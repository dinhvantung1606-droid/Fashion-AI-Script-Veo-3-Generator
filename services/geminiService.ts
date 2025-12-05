import { AppConfig, VisionAnalysis, Script, GeneratedVeoData } from "../types";

// -------------------- Generic CALL to /api/generate --------------------
const callTextAI = async (prompt: string) => {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  return await res.json();
};

// -------------------- 1. Vision Image Analysis --------------------
export const analyzeProductImage = async (base64Image: string): Promise<VisionAnalysis> => {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });

  const data = await res.json();

  if (!data) throw new Error("Vision API returned no response");

  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch {
    return data;
  }
};

// -------------------- 2. Generate 5 Scripts --------------------
export const generateScripts = async (config: AppConfig): Promise<Script[]> => {
  const prompt = `
    Đóng vai đạo diễn sản xuất video quảng cáo thời trang.
    Tạo NGAY 5 kịch bản video khác nhau:

    Sản phẩm: ${config.productName}
    Mô tả: ${config.productDescription}
    Vision AI: ${JSON.stringify(config.visionData)}
    Phong cách: ${config.videoStyle}
    Loại video: ${config.videoType}
    Ngôn ngữ: ${config.language}
    Giọng đọc: ${config.accent}

    Trả về JSON:
    [
      {
        "id": "",
        "title": "",
        "hook": "",
        "scenes": [
          { "time": "", "action": "", "dialogue_or_text": "", "camera_angle": "", "music": "" }
        ]
      }
    ]
  `;

  const result = await callTextAI(prompt);
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Script generation failed");

  return JSON.parse(text);
};

// -------------------- 3. Generate Veo Prompt --------------------
export const generateVeoPrompt = async (script: Script, config: AppConfig): Promise<GeneratedVeoData> => {
  const prompt = `
    Tạo PROMPTS Veo-3.

    Script: ${JSON.stringify(script)}
    Config: ${JSON.stringify(config)}
    Vision: ${JSON.stringify(config.visionData)}

    Trả về JSON:
    {
      "scenePrompts": [
        { "description": "", "camera": "", "lighting": "", "motion": "", "text": "", "aspect_ratio": "9:16" }
      ],
      "adsCaption": "",
      "hashtags": [],
      "ctaVariations": []
    }
  

  const result = await callTextAI(prompt);
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Generate VEO Prompt failed");

  return JSON.parse(text);
};
