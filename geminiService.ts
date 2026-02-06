
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Handles retries with exponential backoff for rate limits.
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

/**
 * Extracts TikTok shop analytics from an image using Gemini.
 */
export const extractProductFromImage = async (base64Image: string) => {
  // Extract clean base64 and mime type
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  return withRetry(async () => {
    // CRITICAL: Always initialize a new GoogleGenAI instance right before the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Extract ALL TikTok video performance metrics from this screenshot.
            
            Fields to find:
            - Video Title/Headline (name)
            - Video ID (tiktokId)
            - Duration (du) - e.g., 05:20
            - Average Watch Time (avgW)
            - Retention Rate (re) - look for %
            - Views (vw) - look for 'การรับชมวิดีโอ' or 'Views'
            - Likes (lk) - look for 'ถูกใจ' or 'Likes'
            - Bookmarks (bm) - look for 'บันทึก' or 'Favorites'
            - Comments (cm) - look for 'ความคิดเห็น' or 'Comments'
            - Shares (sh) - look for 'แชร์' or 'Shares'
            - Score (pfm) - look for 'คะแนน' or 'Score'
            
            Rules:
            1. Return ONLY JSON.
            2. Clean all numbers (remove 'K', 'M', or commas if found, convert to plain string numbers).
            3. If a value is missing, return "0" or "0%".`
          }
        ]
      },
      config: {
        systemInstruction: "You are a specialized TikTok Shop Analytics parser. Convert image data into structured JSON matching the provided schema exactly. Handle Thai and English labels correctly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            tiktokId: { type: Type.STRING },
            du: { type: Type.STRING },
            avgW: { type: Type.STRING },
            re: { type: Type.STRING },
            vw: { type: Type.STRING },
            lk: { type: Type.STRING },
            bm: { type: Type.STRING },
            cm: { type: Type.STRING },
            sh: { type: Type.STRING },
            pfm: { type: Type.STRING },
            cpm: { type: Type.STRING },
            cpe: { type: Type.STRING }
          },
          required: ["name", "vw"]
        }
      }
    });

    let result = response.text;
    if (!result) throw new Error("AI could not extract text. Try a clearer image.");
    
    // Clean potential markdown blocks
    result = result.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("Parse Error. Raw text:", result);
      throw new Error("Failed to parse AI response. The data was malformed.");
    }
  });
};
