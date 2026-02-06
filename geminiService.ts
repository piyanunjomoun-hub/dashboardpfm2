
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

export const extractProductFromImage = async (base64Image: string) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("API_KEY_MISSING: ไม่พบ API Key ในระบบ GitHub Secrets หรือ Environment Variable");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Extract performance metrics from this TikTok Shop Analytics screenshot. 
            Identify the content title, 19-digit TikTok ID, duration, views, and engagement metrics.
            If a value is not found, use "0" or "N/A".`
          }
        ]
      }],
      config: {
        systemInstruction: "You are a professional data analyst. Your task is to extract tabular data from TikTok Shop Analytics screenshots with 100% accuracy. Always return valid JSON matching the requested schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The title or headline of the content" },
            tiktokId: { type: Type.STRING, description: "The 19-digit numerical TikTok ID" },
            du: { type: Type.STRING, description: "Duration (e.g., 04:12)" },
            avgW: { type: Type.STRING, description: "Average watch time (e.g., 01:45)" },
            re: { type: Type.STRING, description: "Retention percentage (e.g., 62%)" },
            vw: { type: Type.STRING, description: "Views count (e.g., 12.4K)" },
            lk: { type: Type.STRING, description: "Likes count" },
            bm: { type: Type.STRING, description: "Bookmarks count" },
            cm: { type: Type.STRING, description: "Comments count" },
            sh: { type: Type.STRING, description: "Shares count" },
            pfm: { type: Type.STRING, description: "Performance score percentage" },
            cpm: { type: Type.STRING, description: "Cost per mille value" },
            cpe: { type: Type.STRING, description: "Cost per engagement value" }
          },
          required: ["name", "vw", "pfm"]
        }
      }
    });

    const result = response.text;
    if (!result) throw new Error("AI ไม่สามารถอ่านข้อมูลจากภาพนี้ได้ กรุณาใช้ภาพที่ชัดเจนขึ้น");
    
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("JSON Parse Error:", result);
      throw new Error("รูปแบบข้อมูลที่ได้รับไม่ถูกต้อง (Invalid JSON)");
    }
  });
};
