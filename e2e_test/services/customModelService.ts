
import { ClassificationResult, DocCategory } from "../types";
import { toast } from 'sonner';

/**
 * Calls the backend Python bridge to run the custom trained model.
 */
export const classifyDocumentCustom = async (base64Data: string, mimeType: string, ocrText?: string): Promise<ClassificationResult> => {
  console.log("Using Custom Python Model for classification...");
  toast.info("Processing with Custom Python Model...");

  const savedUser = localStorage.getItem('activeUser');
  const token = savedUser ? JSON.parse(savedUser).token : null;
  
  try {
    // The Python bridge expects raw base64, not a data: URL.
    const rawBase64 = base64Data.includes(',')
      ? base64Data.substring(base64Data.indexOf(',') + 1)
      : base64Data;

    const response = await fetch('/api/classify/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        base64: rawBase64,
        mimeType: mimeType
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        // If it's not JSON, it might be HTML (like a 404 or 500 page)
        const text = await response.text();
        console.error("Non-JSON Error Response:", text);
        if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
          errorMessage = `Server returned an HTML error page (${response.status}). This usually means the API route was not found or the server crashed.`;
        } else {
          errorMessage = text.substring(0, 200); // Show first 200 chars of text error
        }
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    toast.success("Custom classification complete!");
    
    // The trained model predicts 13 document classes. Department routing is a
    // separate business mapping; it never uses the filename. Some model classes
    // intentionally map to General because the training set has no dedicated
    // Legal/Support class.
    const departmentMap: Record<string, ClassificationResult['department']> = {
      financial: 'Finance',
      resume: 'HR',
      form: 'Operations',
      specification: 'Operations',
      scientific: 'Operations',
      file_folder: 'Operations',
      correspondence: 'General',
      email: 'General',
      handwritten: 'General',
      advertisement: 'General',
      news_article: 'General',
      presentation: 'General',
      questionnaire: 'General'
    };

    const category = result.category as DocCategory;
    const department = result.department || departmentMap[String(category).toLowerCase()] || 'General';

    const extractedFields = Array.isArray(result.extractedFields)
      ? result.extractedFields
      : [
          { key: 'Model', value: result.engine || 'ImageRoute Custom CNN + TF-IDF Fusion' },
          { key: 'OCR', value: result.ocrEngine || 'EasyOCR' },
          { key: 'Fusion', value: result.fusionEnabled ? 'Enabled' : 'Disabled' }
        ];

    return {
      category,
      department,
      confidence: Number(result.confidence || 0),
      extractedFields,
      summary: result.summary || 'Document classified by the local model.',
      routingDestination: result.routingDestination || `${department} Department`,
      engineStatus: result.engineStatus || 'FINAL',
      classifierAction: result.classifierAction || `Route to /${department} folder`,
      ocrText: result.ocrText || ''
    };
  } catch (error) {
    console.error("Custom Model Error:", error);
    toast.error("Custom model failed. Check console for details.");
    throw error;
  }
};

/**
 * Triggers the retraining process on the backend.
 */
export const trainModel = async (): Promise<{ success: boolean; message: string; vocabSize?: number }> => {
  const savedUser = localStorage.getItem('activeUser');
  const token = savedUser ? JSON.parse(savedUser).token : null;
  
  try {
    const response = await fetch('/api/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Retraining failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error("Retraining Error:", error);
    throw error;
  }
};
