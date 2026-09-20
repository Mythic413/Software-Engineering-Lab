import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. Using placeholder key for initialization.");
    return "AI_Studio_Default_Key";
  }
  return key;
};

const genAI = new GoogleGenerativeAI(getApiKey());

export async function classifyAndExtractDocument(
  base64Data: string,
  mimeType: string,
  modelName: string = 'gemini-1.5-flash'
) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      Analyze this document. 
      1. Perform full OCR to extract all text.
      2. Classify this document into one of these categories: Invoice, Resume, ID/Passport, Legal Contract, Receipt, Technical Doc, Other.
      3. Suggest a confidence score (0.0 to 1.0), a short summary (1 sentence), and a routing destination (e.g. "Finance Dept", "HR", "Legal").
      
      Respond only with a JSON object:
      {
        "ocrText": "string (full text extracted)",
        "category": "string",
        "confidence": number,
        "summary": "string",
        "routingDestination": "string",
        "engineStatus": "Success (Gemini Multimodal)",
        "classifierAction": "Auto-Routed"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid Gemini response format");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Multimodal Processing Error:", error);
    return {
      ocrText: "",
      category: "Unknown",
      confidence: 0,
      summary: "Error during document analysis.",
      routingDestination: "Review Queue",
      engineStatus: "Gemini Failure",
      classifierAction: "Manual Review Required"
    };
  }
}
