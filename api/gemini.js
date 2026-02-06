export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
    }

    const { prompt, imageBase64, mimeType } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ ok: false, error: "Missing prompt" });
    }

    // Call Gemini REST API (keeps key on server)
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const parts = [{ text: prompt }];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: { data: imageBase64, mimeType },
      });
    }

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
      }),
    });

    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
