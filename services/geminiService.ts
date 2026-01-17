
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert competitive intelligence analyst. Your goal is to identify systematic product weaknesses that represent genuine business opportunities by analyzing real user feedback.

Follow this Research Protocol strictly:
1. Use Google Search to find high-signal sources: Reddit, G2, Capterra, Trustpilot, App Store, ProductHunt, Hacker News.
2. Extract specific complaints, frequency indicators, intensity signals ("dealbreaker", "switching"), and workaround mentions.
3. Group similar complaints into weakness patterns.
4. Assess Frequency, Pain Intensity, Monetization Potential, and Competitive Moat.

IMPORTANT: You MUST return the analysis in a structured JSON format following this schema:
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
  "validationNextSteps": ["string"]
}

Avoid generic ratings. Be specific (e.g., "can't bulk-edit tasks on mobile" vs "poor UX"). Focus on paying users.
`;

export async function analyzeWeakness(query: string): Promise<AnalysisReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following query for competitive weaknesses and opportunities: "${query}"`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          weaknessMatrix: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                frequency: { type: Type.STRING },
                frequencyPercentage: { type: Type.STRING },
                painIntensity: { type: Type.STRING },
                opportunityScore: { type: Type.NUMBER },
                quotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                significance: { type: Type.STRING },
                competitorsAffected: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      failureMode: { type: Type.STRING }
                    }
                  }
                },
                monetizationSignals: { type: Type.STRING }
              }
            }
          },
          comparisonTable: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weakness: { type: Type.STRING },
                frequency: { type: Type.STRING },
                pain: { type: Type.STRING },
                moat: { type: Type.STRING },
                opportunityScore: { type: Type.NUMBER },
                whyBuildThis: { type: Type.STRING }
              }
            }
          },
          strategicRecommendations: {
            type: Type.OBJECT,
            properties: {
              strongestOpportunity: { type: Type.STRING },
              quickWinAlternative: { type: Type.STRING },
              redFlags: { type: Type.STRING }
            }
          },
          validationNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["executiveSummary", "weaknessMatrix", "comparisonTable", "strategicRecommendations", "validationNextSteps"]
      }
    }
  });

  const rawText = response.text || "{}";
  const json = JSON.parse(rawText);
  
  // Extract grounding sources safely
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  // Ensure arrays exist to prevent .map() crashes
  return {
    executiveSummary: json.executiveSummary || "",
    weaknessMatrix: (json.weaknessMatrix || []).map((w: any) => ({
      ...w,
      quotes: w.quotes || [],
      competitorsAffected: w.competitorsAffected || []
    })),
    comparisonTable: json.comparisonTable || [],
    strategicRecommendations: json.strategicRecommendations || {
      strongestOpportunity: "",
      quickWinAlternative: "",
      redFlags: ""
    },
    validationNextSteps: json.validationNextSteps || [],
    sources
  };
}
