'use client'

/**
 * Client-side AI service using Puter.js + Gemini 3.1 Pro.
 * No API keys required — uses the "User-Pays" model.
 * Puter handles authentication automatically (one-time popup).
 */

import { AnalysisReport } from '../types'

// TypeScript declarations for Puter.js global
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string
            stream?: boolean
          }
        ) => Promise<string | AsyncIterable<{ text?: string }>>
      }
      auth: {
        isSignedIn: () => boolean
        signIn: () => Promise<void>
      }
    }
  }
}

const SYSTEM_PROMPT = `You are an expert competitive intelligence analyst. Your goal is to identify systematic product weaknesses that represent genuine business opportunities by analyzing real user feedback.

Follow this Research Protocol strictly:
1. Search for high-signal sources: Reddit, G2, Capterra, Trustpilot, App Store, ProductHunt, Hacker News.
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
CRITICAL: In the "sources" array, include ALL URLs you referenced or found during your research. Each source must have a descriptive "title" and a valid full "uri". Include at least 5-10 sources.`

/**
 * Wait for the Puter.js SDK to be loaded and ready.
 * Returns true if ready, false if timed out.
 */
function waitForPuter(timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.puter?.ai) {
      resolve(true)
      return
    }

    const start = Date.now()
    const interval = setInterval(() => {
      if (window.puter?.ai) {
        clearInterval(interval)
        resolve(true)
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval)
        resolve(false)
      }
    }, 200)
  })
}

/**
 * Parse raw AI response text into a structured AnalysisReport.
 * Handles markdown code fences and various JSON edge cases.
 */
function parseAIResponse(rawText: string): AnalysisReport {
  let text = rawText.trim()

  // Strip markdown code fences
  if (text.startsWith('```json')) text = text.substring(7)
  else if (text.startsWith('```')) text = text.substring(3)
  if (text.endsWith('```')) text = text.substring(0, text.length - 3)
  text = text.trim()

  const json = JSON.parse(text)

  return {
    executiveSummary: json.executiveSummary || '',
    weaknessMatrix: (json.weaknessMatrix || []).map((w: Record<string, unknown>) => ({
      ...w,
      quotes: (w.quotes as string[]) || [],
      competitorsAffected: (w.competitorsAffected as unknown[]) || [],
    })),
    comparisonTable: json.comparisonTable || [],
    strategicRecommendations: json.strategicRecommendations || {
      strongestOpportunity: '',
      quickWinAlternative: '',
      redFlags: '',
    },
    validationNextSteps: json.validationNextSteps || [],
    sources: json.sources || [],
  }
}

/**
 * Main analysis function using Puter.js + Gemini 3.1 Pro.
 * 
 * @param query - The competitor/market analysis query
 * @param onStreamChunk - Callback for streaming text updates (for UI)
 * @returns Parsed AnalysisReport
 */
export async function analyzeWithPuter(
  query: string,
  onStreamChunk?: (chunk: string) => void
): Promise<AnalysisReport> {
  // 1. Wait for Puter SDK to load
  const ready = await waitForPuter()
  if (!ready || !window.puter?.ai) {
    throw new Error('AI service is loading. Please refresh the page and try again.')
  }

  const prompt = `Analyze the following query for competitive weaknesses and opportunities: "${query}"\n\nRemember: Respond with ONLY valid JSON.`

  // 2. Build the conversation with system prompt
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ]

  // 3. Call Gemini 3.1 Pro via Puter with streaming
  try {
    const response = await window.puter.ai.chat(messages, {
      model: 'gemini-3.1-pro-preview',
      stream: true,
    })

    // 4. Collect streamed chunks
    let fullText = ''

    if (typeof response === 'string') {
      // Non-streaming response (fallback)
      fullText = response
      if (onStreamChunk) onStreamChunk(response)
    } else if (response && Symbol.asyncIterator in Object(response)) {
      // Streaming response
      for await (const part of response as AsyncIterable<{ text?: string }>) {
        if (part?.text) {
          fullText += part.text
          if (onStreamChunk) onStreamChunk(part.text)
        }
      }
    } else {
      // Response is a plain object — extract text
      const textResponse = String(response)
      fullText = textResponse
      if (onStreamChunk) onStreamChunk(textResponse)
    }

    if (!fullText.trim()) {
      throw new Error('Empty response from AI. Please try again.')
    }

    // 5. Parse the response into AnalysisReport
    return parseAIResponse(fullText)
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))

    // Check for rate limit errors
    if (
      error.message.includes('429') ||
      error.message.includes('quota') ||
      error.message.includes('RESOURCE_EXHAUSTED')
    ) {
      throw new Error(
        'AI service rate limit reached. Please wait a minute before retrying.'
      )
    }

    // Check for auth errors
    if (
      error.message.includes('auth') ||
      error.message.includes('sign in') ||
      error.message.includes('not logged in')
    ) {
      throw new Error(
        'Please sign in to your Puter account to use the AI service. A popup will appear on your next attempt.'
      )
    }

    // Re-throw with a clean message if it's a parse error
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      throw new Error('Failed to parse AI response. Please try again.')
    }

    throw error
  }
}
