import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit, redis } from '@/lib/rateLimit'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysisCache'
import { MAX_CREDITS } from '@/lib/planUtils'
import { PerformanceTimer } from '@/lib/monitoring'

// ── Fix #1 + #6: Module-level singleton — instantiated once, not per request ──
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_INSTRUCTION = `
You are an expert competitive intelligence analyst. Your goal is to identify systematic product weaknesses that represent genuine business opportunities by analyzing real user feedback.

Follow this Research Protocol strictly:
1. Use Google Search to find high-signal sources: Reddit, G2, Capterra, Trustpilot, App Store, ProductHunt, Hacker News.
2. Extract specific complaints, frequency indicators, intensity signals ("dealbreaker", "switching"), and workaround mentions.
3. Group similar complaints into weakness patterns.
4. Assess Frequency, Pain Intensity, Monetization Potential, and Competitive Moat.

IMPORTANT: You MUST return the analysis ONLY as valid JSON (no markdown, no explanation text) in this exact format:
{
  "executiveSummary": "string",
  "weaknessMatrix": [
    {
      "name": "string",
      "frequency": "High|Medium|Low",
      "frequencyPercentage": "string",
      "painIntensity": "Severe|Moderate|Mild",
      "opportunityScore": number (1-5),
      "quotes": ["string"],
      "significance": "string",
      "competitorsAffected": [{"name": "string", "failureMode": "string"}],
      "monetizationSignals": "string"
    }
  ],
  "comparisonTable": [
    {
      "weakness": "string",
      "frequency": "string",
      "pain": "string",
      "moat": "string",
      "opportunityScore": number,
      "whyBuildThis": "string"
    }
  ],
  "strategicRecommendations": {
    "strongestOpportunity": "string",
    "quickWinAlternative": "string",
    "redFlags": "string"
  },
  "validationNextSteps": ["string"],
  "sources": [{"title": "string (name of the source)", "uri": "string (full URL)"}]
}

Avoid generic ratings. Be specific (e.g., "can't bulk-edit tasks on mobile" vs "poor UX"). Focus on paying users.
CRITICAL: In the "sources" array, include ALL URLs you referenced or found during your research. Each source must have a descriptive "title" and a valid full "uri". Include at least 5-10 sources.
`

export async function POST(req: NextRequest) {
  const timer = new PerformanceTimer('api/analyze')
  try {
    // ── Fix #1: Authentication ─────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Fix #3: Rate Limiting ──────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse & validate request body ──────────────────────────────
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    // ── Fix #5 (Audit 2): Maximum query length ────────────────────
    const MAX_QUERY_LENGTH = 500
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be ${MAX_QUERY_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    // ── Fix #5 (Audit 2): Character validation ────────────────────
    const ALLOWED_QUERY_PATTERN = /^[a-zA-Z0-9\s\-_.,!?'"()&@#%+\/:]+$/
    if (!ALLOWED_QUERY_PATTERN.test(trimmedQuery)) {
      return NextResponse.json(
        { error: 'Query contains invalid characters' },
        { status: 400 }
      )
    }

    logger.info('[analyze] Request received', {
      userId: user.id,
      queryLength: trimmedQuery.length
    })

    // ── Fix #1: Service role client for DB operations ──────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── Fix #2: Pre-check credits BEFORE calling Gemini ────────────
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits_used')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Unable to verify account status' },
        { status: 403 }
      )
    }

    // Get user's active plan from subscriptions
    const { data: subscriptionData } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_slug, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    const activePlan = subscriptionData?.plan_slug ?? 'hobby'
    const maxCredits = MAX_CREDITS[activePlan] ?? 3

    if (profileData.credits_used >= maxCredits) {
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // ── Fix #6: In-flight request lock ─────────────────────────────
    let lockAcquired = false
    const lockKey = `analyze:lock:${user.id}`
    try {
      const r = redis()
      const result = await r.set(lockKey, '1', { nx: true, ex: 60 })
      lockAcquired = result === 'OK'
    } catch (lockErr) {
      // If Redis is down, allow the request through (lock is secondary protection)
      logger.warn('[analyze] Lock acquisition failed — proceeding without lock', {
        error: (lockErr as Error).message,
      })
      lockAcquired = true // treat as acquired to proceed
    }

    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'An analysis is already in progress. Please wait.' },
        { status: 429 }
      )
    }

    try {
      const cached = await getCachedAnalysis(trimmedQuery, user.id)
      if (cached) {
        logger.info('[analyze] Cache HIT', { userId: user.id })
        
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              await supabaseAdmin.rpc('save_analysis_atomically', {
                p_user_id: user.id, p_query_text: trimmedQuery, p_analysis_result: cached
              })
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, report: cached })}\n\n`))
            } catch (rpcError: any) {
              if (rpcError?.message?.includes('NO_CREDITS_REMAINING')) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' })}\n\n`))
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to save analysis.' })}\n\n`))
              }
            } finally {
              timer.stop({ cached: true })
              controller.close()
              await redis().del(lockKey)
            }
          }
        })
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'X-Cache': 'HIT'
          }
        })
      }

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) throw new Error('Server configuration error')

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const modelName = 'gemini-2.5-flash'
            const apiVersion = 'v1beta'
            const prompt = `Analyze the following query for competitive weaknesses and opportunities: "${trimmedQuery}"\n\nRemember: Respond with ONLY valid JSON.`
            
            let result;
            try {
              const modelWithSearch = genAI.getGenerativeModel(
                { model: modelName, systemInstruction: SYSTEM_INSTRUCTION, tools: [{ googleSearchRetrieval: {} }] as never },
                { apiVersion }
              )
              result = await modelWithSearch.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
              })
            } catch (searchErr) {
              logger.warn('[analyze] Search failed, retrying without search')
              const modelNoSearch = genAI.getGenerativeModel(
                { model: modelName, systemInstruction: SYSTEM_INSTRUCTION },
                { apiVersion }
              )
              result = await modelNoSearch.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
              })
            }
            
            let fullText = ''
            for await (const chunk of result.stream) {
              const chunkText = chunk.text()
              fullText += chunkText
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
              )
            }
            
            let rawText = fullText.trim()
            if (rawText.startsWith('```json')) rawText = rawText.substring(7)
            else if (rawText.startsWith('```')) rawText = rawText.substring(3)
            if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3)
            rawText = rawText.trim()
            
            const json = JSON.parse(rawText)
            const finalReport = {
              executiveSummary: json.executiveSummary || '',
              weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
                ...w, quotes: (w.quotes as string[]) || [], competitorsAffected: (w.competitorsAffected as unknown[]) || []
              })),
              comparisonTable: json.comparisonTable || [],
              strategicRecommendations: json.strategicRecommendations || { strongestOpportunity: '', quickWinAlternative: '', redFlags: '' },
              validationNextSteps: json.validationNextSteps || [],
              sources: json.sources || []
            }
            
            try {
               const { error: rpcError } = await supabaseAdmin.rpc('save_analysis_atomically', {
                 p_user_id: user.id, p_query_text: trimmedQuery, p_analysis_result: finalReport
               })
               
               if (rpcError?.message?.includes('NO_CREDITS_REMAINING')) {
                 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'No credits remaining. Please upgrade your plan.' })}\n\n`))
               } else {
                 await setCachedAnalysis(trimmedQuery, user.id, finalReport)
                 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, report: finalReport })}\n\n`))
               }
            } catch (saveErr) {
               logger.error('[analyze] Failed to save', { error: saveErr })
               controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to save analysis results.' })}\n\n`))
            }
          } catch (err: any) {
            logger.error('[analyze] Stream error', { error: err.message })
            if (err?.message?.includes('429') || err?.message?.includes('quota')) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'API quota exceeded. Please wait before trying again.' })}\n\n`))
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Analysis failed. Please try again.' })}\n\n`))
            }
          } finally {
            timer.stop({ cached: false, queryLength: trimmedQuery.length })
            controller.close()
            await redis().del(lockKey)
          }
        }
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
      
    } catch (err) {
      await redis().del(lockKey)
      throw err
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[analyze] Server error', { error: err.message, stack: err.stack })
    Sentry.captureException(err)

    if (err.message?.includes('429') || err.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Fix #9 (Audit 2): Never return raw error messages to the client
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
