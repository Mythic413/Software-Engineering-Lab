"""STDIN bridge for the real ImageRoute custom CNN + TF-IDF fusion model."""
from __future__ import annotations

import base64
import json
import mimetypes
import os
import sys
import tempfile
from pathlib import Path


def main() -> None:
    payload = json.load(sys.stdin)
    raw = str(payload.get("base64", ""))
    mime_type = str(payload.get("mimeType", "application/octet-stream"))
    if "," in raw:
        raw = raw.split(",", 1)[1]
    if not raw:
        raise ValueError("Missing base64 document data")

    root = Path(__file__).resolve().parent
    model_path = root / "model.pth"
    label_map_path = root / "label_map.json"
    fusion_path = root / "model_fusion.pth"
    tfidf_path = root / "model_tfidf.pkl"

    required = [model_path, label_map_path, fusion_path, tfidf_path]
    missing = [str(p.name) for p in required if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Missing custom model artifacts: " + ", ".join(missing)
        )

    # Use the original trained architecture and metadata supplied by the user.
    from classifier import ClassifierService
    from ocr_engine import OCREngine

    suffix = mimetypes.guess_extension(mime_type) or ".bin"
    if mime_type == "application/pdf":
        suffix = ".pdf"
    elif mime_type == "image/jpeg":
        suffix = ".jpg"
    elif mime_type == "image/png":
        suffix = ".png"
    elif mime_type == "image/webp":
        suffix = ".webp"

    fd, temp_path = tempfile.mkstemp(prefix="imageroute_", suffix=suffix)
    os.close(fd)
    try:
        with open(temp_path, "wb") as f:
            f.write(base64.b64decode(raw))

        ocr = OCREngine(fast_mode=True, use_gpu=False)
        ocr_text = ocr.extract_text(temp_path)

        service = ClassifierService(str(model_path), str(label_map_path))
        result = service.predict(temp_path, top_k=3, ocr_text=ocr_text)

        # Keep the model's original 13-class vocabulary. Department routing is a
        # separate application concern handled by the frontend/backend mapping.
        label = result.get("label", "UNKNOWN")
        department_map = {
            "financial": "Finance",
            "resume": "HR",
            "form": "Operations",
            "specification": "Operations",
            "scientific": "Operations",
            "file_folder": "Operations",
            "correspondence": "General",
            "email": "General",
            "handwritten": "General",
            "advertisement": "General",
            "news_article": "General",
            "presentation": "General",
            "questionnaire": "General",
        }
        result["category"] = label
        result["department"] = department_map.get(label, "General")
        result["ocrText"] = ocr_text
        result["engine"] = "ImageRoute Custom CNN + TF-IDF Fusion"
        result["modelVersion"] = "custom-cnn-v4.1"
        result["fusionEnabled"] = service.fusion_head is not None
        result["ocrEngine"] = "EasyOCR"
        result["summary"] = f"Custom model classified this document as {label}."
        result["routingDestination"] = f"{result['department']} Department"
        result["engineStatus"] = result.get("status", "REVIEW")
        result["classifierAction"] = result.get("action", "Manual review required")
        print(json.dumps(result))
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        print(f"[ImageRoute classifier] {exc}", file=sys.stderr)
        sys.exit(1)
