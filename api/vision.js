import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Missing image" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing API Key on server" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Phân tích hình ảnh thời trang và trả về JSON:

    {
      "category": "...",
      "color_tone": "...",
      "style": "...",
      "target_age": "...",
      "brand_tone": "...",
      "usp_highlights": ["...", "..."],
      "tone_scores": [
        { "name": "", "value": 0 }
      ]
    }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: base64Image } }
    ]);

    const text = result.response?.text();
    return res.status(200).json({ result: text });
  } catch (e) {
    console.error("VISION ERROR ->", e);
    return res.status(500).json({ error: e.message || "Vision Failed" });
  }
}
