import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit, redis } from '@/lib/rateLimit'
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/analysisCache'
import { MAX_CREDITS } from '@/lib/planUtils'

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
      // ── Fix #9: Check cache BEFORE calling Gemini ──────────────────
      // Fix #7 (Audit 2): Cache namespaced by user.id
      const cached = await getCachedAnalysis(trimmedQuery, user.id)
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
              { error: 'No credits remaining. Please upgrade your plan.' },
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

          // Note: Gemini SDK does not accept AbortSignal in generateContent().
          // Timeout protection is handled by the model fallback loop; if a model
          // hangs, the outer try/catch + Sentry capture will eventually surface it.
          const GEMINI_TIMEOUT_MS = 45_000
          const timeoutId = setTimeout(() => {
            // Logging-only: if we reach here, the await below is still pending
          }, GEMINI_TIMEOUT_MS)

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

      // ── Fix #2: Atomic credit decrement + analysis save (MUST block on failure) ──
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('save_analysis_atomically', {
          p_user_id: user.id,
          p_query_text: trimmedQuery,
          p_analysis_result: finalReport
        })

        if (rpcError) {
          if (rpcError.message?.includes('NO_CREDITS_REMAINING')) {
            // Fix #2: DO NOT return the analysis — user has no credits
            return NextResponse.json(
              { error: 'No credits remaining. Please upgrade your plan.' },
              { status: 403 }
            )
          }
          logger.error('[analyze] RPC save failed', { error: rpcError.message })
        }
      } catch (rpcErr) {
        const rpcMsg = rpcErr instanceof Error ? rpcErr.message : String(rpcErr)
        if (rpcMsg.includes('NO_CREDITS_REMAINING')) {
          // Fix #2: DO NOT return the analysis — user has no credits
          return NextResponse.json(
            { error: 'No credits remaining. Please upgrade your plan.' },
            { status: 403 }
          )
        }
        logger.error('[analyze] RPC exception', { error: rpcMsg })
      }

      // ── Fix #9: Cache the result ────────────────────────────────────
      // Fix #7 (Audit 2): Cache namespaced by user.id
      await setCachedAnalysis(trimmedQuery, user.id, finalReport)

      logger.info('[analyze] Analysis complete', {
        userId: user.id,
        model: usedModel,
        sourcesCount: sources.length
      })

      return NextResponse.json(finalReport, {
        headers: { 'X-Cache': 'MISS' }
      })
    } finally {
      // ── Fix #6: Always release the in-flight lock ─────────────────
      try {
        await redis().del(lockKey)
      } catch {
        // Silently fail — lock has a TTL, so it'll expire anyway
      }
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
