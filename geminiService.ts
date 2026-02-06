
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
    // to ensure the most up-to-date API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Generate content with both image and text parts.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex multimodal reasoning task
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this TikTok Shop Analytics screenshot and extract ALL performance metrics.
            
            Look for these fields specifically:
            1. Content Title (Name)
            2. TikTok Video ID (Usually a long 19-digit number)
            3. Duration (DU) - e.g. 01:30
            4. Average Watch Time (AVG.W)
            5. Retention % (RE)
            6. Total Views (VW)
            7. Engagement: Likes (LK), Bookmarks (BM), Comments (CM), Shares (SH)
            8. Calculated Score (PFM %)
            
            If a value is obscured or missing, guess based on context or use "0". 
            Ensure numeric values are cleaned (remove 'K', 'M' symbols if possible or keep them consistently).`
          }
        ]
      },
      config: {
        systemInstruction: `You are an expert TikTok Data Scraper. Your goal is to extract metrics from screenshots with 100% precision. 
        Return ONLY a JSON object. 
        If you see multiple items, pick the most prominent one or the first one in the list.
        Labels might be in Thai or English. 
        'การรับชมวิดีโอ' = Views
        'อัตราการดูจบ' = Retention
        'ระยะเวลาการรับชมเฉลี่ย' = Average Watch Time`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The title or headline of the content" },
            tiktokId: { type: Type.STRING, description: "The numerical TikTok ID" },
            du: { type: Type.STRING, description: "Duration (e.g., 04:12)" },
            avgW: { type: Type.STRING, description: "Average watch time" },
            re: { type: Type.STRING, description: "Retention %" },
            vw: { type: Type.STRING, description: "Views count" },
            lk: { type: Type.STRING, description: "Likes count" },
            bm: { type: Type.STRING, description: "Bookmarks count" },
            cm: { type: Type.STRING, description: "Comments count" },
            sh: { type: Type.STRING, description: "Shares count" },
            pfm: { type: Type.STRING, description: "Performance score" },
            cpm: { type: Type.STRING, description: "CPM" },
            cpe: { type: Type.STRING, description: "CPE" }
          },
          required: ["name", "vw"]
        }
      }
    });

    // Access the .text property directly (do not call as a method).
    const result = response.text;
    if (!result) throw new Error("AI could not extract text from this image. Please ensure the screenshot is clear.");
    
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("Raw AI Response:", result);
      throw new Error("Received malformed data from AI. Please try again with a clearer screenshot.");
    }
  });
};
