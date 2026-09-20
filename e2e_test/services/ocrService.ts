import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return key || "AI_Studio_Default_Key";
};

const genAI = new GoogleGenerativeAI(getApiKey());

export async function extractTextFromDocument(base64Data: string, mimeType: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      "Please perform full OCR on this document and provide all the text found within it. Return only the text content.",
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("OCR Extraction Error (Gemini):", error);
    return "Error extractions text from document.";
  }
}
