import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit } from '@/lib/rateLimit'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysisCache'

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
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse & validate request body ──────────────────────────────
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    logger.info('[analyze] Request received', {
      userId: user.id,
      queryLength: trimmedQuery.length
    })

    // ── Fix #1: Credit check ───────────────────────────────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── Fix #9: Check cache BEFORE calling Gemini ──────────────────
    const cached = await getCachedAnalysis(trimmedQuery)
    if (cached) {
      logger.info('[analyze] Cache HIT', { userId: user.id })

      // Still save to user's history and decrement credits atomically
      try {
        await supabaseAdmin.rpc('save_analysis_atomically', {
          p_user_id: user.id,
          p_query_text: trimmedQuery,
          p_analysis_result: cached
        })
      } catch (rpcError: unknown) {
        const errMsg = rpcError instanceof Error ? rpcError.message : String(rpcError)
        if (errMsg.includes('NO_CREDITS_REMAINING')) {
          return NextResponse.json(
            { error: 'No credits remaining' },
            { status: 403 }
          )
        }
        throw rpcError
      }

      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' }
      })
    }

    // ── Verify API key exists (Fix #1: removed secret logging) ─────
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      logger.error('[analyze] Gemini API key not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // ── Model fallback with timeout (Fix #7A) ──────────────────────
    let response: { text: () => string; candidates?: unknown[] } | undefined
    let usedModel = 'unknown'

    const modelsToTry = [
      { name: 'gemini-2.5-flash', version: 'v1beta' as const },
      { name: 'gemini-2.0-flash', version: 'v1beta' as const },
      { name: 'gemini-1.5-flash', version: 'v1beta' as const },
    ]

    let lastError: Error | null = null

    for (const { name: modelName, version: apiVersion } of modelsToTry) {
      try {
        logger.info('[analyze] Trying model with search', { model: modelName, apiVersion })

        // ── Attempt 1: With Search Tool ───────────────────────────
        const modelWithSearch = genAI.getGenerativeModel(
          {
            model: modelName,
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearchRetrieval: {} }] as never
          },
          { apiVersion }
        )

        const prompt = `Analyze the following query for competitive weaknesses and opportunities: "${trimmedQuery}"\n\nRemember: Respond with ONLY valid JSON.`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45_000) // Slightly longer for search

        try {
          const result = await modelWithSearch.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          })
          response = result.response as typeof response
          usedModel = modelName
        } catch (searchErr: any) {
          // ── Fallback: If ANY error occurs with search, try WITHOUT search ──
          // This handles 429s (Quota) AND 404s (Search not enabled for this API key tier)
          logger.warn('[analyze] Search failed, retrying without search', { 
            model: modelName, 
            error: searchErr.message?.substring(0, 100) 
          })
          
          const modelNoSearch = genAI.getGenerativeModel(
            {
              model: modelName,
              systemInstruction: SYSTEM_INSTRUCTION
            },
            { apiVersion }
          )

          const fallbackResult = await modelNoSearch.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          })
          response = fallbackResult.response as typeof response
          usedModel = `${modelName} (no-search)`
        } finally {
          clearTimeout(timeoutId)
        }

        if (response) {
          logger.info('[analyze] Model succeeded', { model: usedModel })
          break
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const msg = lastError.message

        // ── Fix: Only fall back on 404/500/etc, not 429 ─────────────
        const isRecoverable =
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('400') ||
          msg.includes('Bad Request') ||
          msg.includes('500')

        if (isRecoverable) {
          logger.warn('[analyze] Model failed, trying next', {
            model: modelName,
            reason: msg.substring(0, 100)
          })
          continue
        }

        // Abort errors → 504
        if (lastError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Analysis timed out. Please try again.' },
            { status: 504 }
          )
        }

        break // Non-recoverable error
      }
    }

    if (!response) {
      logger.error('[analyze] All models failed', {
        lastError: lastError?.message
      })
      Sentry.captureException(lastError)
      throw lastError || new Error('Failed to generate content with any model')
    }

    // ── Parse Gemini response ───────────────────────────────────────
    let rawText = response.text() || '{}'
    rawText = rawText.trim()
    if (rawText.startsWith('```json')) rawText = rawText.substring(7)
    else if (rawText.startsWith('```')) rawText = rawText.substring(3)
    if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3)
    rawText = rawText.trim()

    const json = JSON.parse(rawText)

    // ── Extract grounding sources ───────────────────────────────────
    const candidate = (response as { candidates?: Array<{ groundingMetadata?: Record<string, unknown> }> }).candidates?.[0]
    let sources: { title: string; uri: string }[] = []
    const gm = candidate?.groundingMetadata as Record<string, unknown[] | undefined> | undefined

    if (gm?.groundingChunks && (gm.groundingChunks as Array<{ web?: { uri?: string; title?: string } }>).length > 0) {
      sources = (gm.groundingChunks as Array<{ web?: { uri?: string; title?: string } }>)
        .filter((chunk) => chunk?.web?.uri)
        .map((chunk) => ({
          title: chunk.web?.title || 'Source',
          uri: chunk.web!.uri!
        }))
    }

    if (sources.length === 0 && json.sources && Array.isArray(json.sources)) {
      sources = json.sources.map((s: { title?: string; name?: string; uri?: string; url?: string }) => ({
        title: s.title || s.name || 'Source',
        uri: s.uri || s.url || '#'
      }))
    }

    // ── Build final report ──────────────────────────────────────────
    const finalReport = {
      executiveSummary: json.executiveSummary || '',
      weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
        ...w,
        quotes: (w.quotes as string[]) || [],
        competitorsAffected: (w.competitorsAffected as unknown[]) || []
      })),
      comparisonTable: json.comparisonTable || [],
      strategicRecommendations: json.strategicRecommendations || {
        strongestOpportunity: '',
        quickWinAlternative: '',
        redFlags: ''
      },
      validationNextSteps: json.validationNextSteps || [],
      sources
    }

    // ── Fix #8: Atomic credit decrement + analysis save (server side) ─
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('save_analysis_atomically', {
        p_user_id: user.id,
        p_query_text: trimmedQuery,
        p_analysis_result: finalReport
      })

      if (rpcError) {
        if (rpcError.message?.includes('NO_CREDITS_REMAINING')) {
          return NextResponse.json(
            { error: 'No credits remaining' },
            { status: 403 }
          )
        }
        logger.error('[analyze] RPC save failed', { error: rpcError.message })
        // Don't block the response — user still gets their report
      }
    } catch (rpcErr) {
      const rpcMsg = rpcErr instanceof Error ? rpcErr.message : String(rpcErr)
      if (rpcMsg.includes('NO_CREDITS_REMAINING')) {
        return NextResponse.json(
          { error: 'No credits remaining' },
          { status: 403 }
        )
      }
      logger.error('[analyze] RPC exception', { error: rpcMsg })
    }

    // ── Fix #9: Cache the result ────────────────────────────────────
    await setCachedAnalysis(trimmedQuery, finalReport)

    logger.info('[analyze] Analysis complete', {
      userId: user.id,
      model: usedModel,
      sourcesCount: sources.length
    })

    return NextResponse.json(finalReport, {
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[analyze] Server error', { error: err.message })
    Sentry.captureException(err)

    if (err.message?.includes('429') || err.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please wait before trying again.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
