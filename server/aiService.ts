import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('[EventPilot AI] GEMINI_API_KEY environment variable is not set or using placeholder. Running AI with synthetic fallback mode.');
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (err) {
    console.error('[EventPilot AI] Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

/**
 * Generate completion using Gemini API with structured JSON output or text fallback
 */
export async function generateAgentResponse(systemPrompt: string, userPrompt: string, temperature: number = 0.2): Promise<string> {
  const ai = getAIClient();
  if (!ai) {
    return ''; // Return empty string to trigger local deterministic agent fallback in caller
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}` }] }
      ],
      config: {
        temperature,
        responseMimeType: 'application/json'
      }
    });

    return response.text || '';
  } catch (error) {
    console.error('[EventPilot AI] Gemini API call error:', error);
    return '';
  }
}
