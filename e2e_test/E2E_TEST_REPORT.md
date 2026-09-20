# ImageRoute E2E Verification Report

Date: 2026-09-20 (UTC)

## Verified successfully

- `model.pth` loads with the supplied `classifier.py` architecture.
- `label_map.json` matches the 13-class canonical label order.
- `model_fusion.pth` loads and the TF-IDF fusion head is enabled.
- `model_tfidf.pkl` loads and exposes a 300-feature vocabulary.
- Python syntax compilation passes for the classifier, bridge, OCR adapter, and trainer.
- The classifier performs a real inference using the supplied weights and a supplied OCR text string.
- The Python bridge accepts base64 image data and returns valid JSON with category, department, confidence, OCR text, fusion status, and routing status.
- Department mapping is model-class based; it does not use the filename.
- Server-side document ownership checks were tightened so clients cannot read/write another user's documents through a supplied `userId` or document id.
- Document update fields are allow-listed to prevent arbitrary SQL column injection through request keys.
- Frontend TypeScript/TSX source parsing passes with zero parser errors across all 31 source files.

## Important environment limitations

A complete browser + Node server run could not be completed in this environment because external package installation is unavailable here. `npm install` could not reach the package registry, so Express/Vite/React dependencies were not runnable in this container.

The real `easyocr` package was also unavailable in this environment. The Python bridge was therefore integration-tested with an EasyOCR-compatible OCR test double backed by local Tesseract. This verifies the bridge/base64/model/fusion/JSON path, but it does **not** prove the real EasyOCR runtime on a Windows machine.

The supplied TF-IDF artifact was trained with scikit-learn 1.7.2. The verification environment had scikit-learn 1.8.0, which produced an `InconsistentVersionWarning`. The project setup pins `scikit-learn==1.7.2`; use that version locally.

## Remaining local test

On Windows, install the project dependencies and EasyOCR, run the server, then upload a real JPG/PNG/PDF. The browser path to verify is:

`Login → Route Image → upload → EasyOCR → Custom CNN + TF-IDF fusion → department mapping → save document → History/Queue`

`vocab.json` is not required by this model.
