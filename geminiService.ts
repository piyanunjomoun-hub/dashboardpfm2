export async function extractProductFromImage(params: {
  prompt: string;
  imageBase64?: string; // base64 (no data: prefix)
  mimeType?: string;    // e.g. "image/png"
}) {
  const r = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await r.json();

  // ถ้า server ตอบ error จะได้ไม่ทำให้หน้า crash เงียบ ๆ
  if (!r.ok) {
    throw new Error(data?.error || "Gemini API error");
  }

  return data;
}
