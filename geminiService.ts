
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Handles retries with exponential backoff.
 * Especially useful for 429 (Rate Limit) errors.
 */
async function withRetry<T>(fn: (attempt: number) => Promise<T>, maxRetries = 2, initialDelay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn(i);
    } catch (error: any) {
      lastError = error;
      const errorString = JSON.stringify(error).toLowerCase();
      const isRateLimit = 
        error?.status === 429 || 
        errorString.includes('429') || 
        errorString.includes('resource_exhausted') ||
        errorString.includes('quota');
        
      if (!isRateLimit || i === maxRetries) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Quota reached. Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export const extractProductFromImage = async (base64Image: string) => {
  // Always get a fresh instance with the latest injected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Detect mime type from data URL (e.g. "data:image/jpeg;base64,...")
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: `Extract performance metrics from this TikTok Shop Analytics row.
          Return ONLY JSON:
          {
            "name": "content title",
            "tiktokId": "19-digit id",
            "du": "duration",
            "avgW": "avg watch",
            "re": "retention %",
            "vw": "views",
            "lk": "likes",
            "bm": "bookmarks",
            "cm": "comments",
            "sh": "shares",
            "pfm": "score",
            "products": "count",
            "cpm": "est value",
            "cpe": "est value"
          }`
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = response.text;
    if (!result) throw new Error("AI returned an empty response.");
    return JSON.parse(result);
  });
};
