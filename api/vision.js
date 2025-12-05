// /api/vision.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { base64Image } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing API KEY" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Phân tích hình ảnh sản phẩm thời trang và trả về JSON:
      - category
      - style
      - color_tone
      - target_age
      - brand_tone
      - usp_highlights
      - tone_scores (name + value)
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      },
      { text: prompt }
    ]);

    res.status(200).json(result.response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

