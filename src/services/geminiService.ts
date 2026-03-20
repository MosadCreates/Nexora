
import { AnalysisReport } from "../types";

/**
 * Client-side analysis service — proxies to /api/analyze.
 * Fix #1/#8: Auth token is now passed in the header. Credit decrement
 * is handled server-side atomically — no client-side credits logic.
 */
export async function analyzeWeakness(query: string, accessToken: string): Promise<AnalysisReport> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const report: AnalysisReport = await response.json();
    return report;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(err.message || 'Analysis failed. Please try again.');
  }
}
