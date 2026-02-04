export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false });
    }

    const GAS_URL = process.env.GAS_URL;
    const SECRET = process.env.SECRET;

    const r = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req.body, secret: SECRET }),
    });

    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
}
