export default async function handler(req, res) {
  try {
    const r = await fetch("https://1.1.1.1/cdn-cgi/trace", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const text = await r.text();
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(text);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
