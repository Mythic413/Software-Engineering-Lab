# ImageRoute Custom Model Setup

ImageRoute now uses the **user's trained custom CNN + TF-IDF fusion model + EasyOCR** for document classification. The upload flow does not use Gemini and does not use filename keywords.

## Bundled model artifacts

The project root contains the four artifacts from the trained pipeline:

- `model.pth` — trained 13-class CNN weights
- `model_fusion.pth` — TF-IDF text fusion head weights
- `model_tfidf.pkl` — fitted 300-feature TF-IDF vectorizer
- `label_map.json` — labels, normalization statistics, and training metadata

No `vocab.json` is required for this model.

## Real inference pipeline

```text
Image / PDF
    ↓
EasyOCR
    ↓
OCR text
    ├──────────────→ TF-IDF (model_tfidf.pkl)
    │                         ↓
    └→ Custom CNN (model.pth) → Fusion head (model_fusion.pth)
                                  ↓
                         13-class prediction
                                  ↓
                       Department routing map
```

The supplied `label_map.json` defines these 13 classes:

`advertisement, correspondence, email, file_folder, financial, form, handwritten, news_article, presentation, questionnaire, resume, scientific, specification`

The supplied training metadata reports a best validation accuracy of **78.01% at epoch 85**.

## Python dependencies

```bash
python -m pip install torch torchvision easyocr opencv-python numpy pillow pdf2image scikit-learn
```

PDF support also requires Poppler. On Windows, install Poppler and add its `bin` directory to PATH, or use image files for the simplest demo.

## Run

1. Copy `.env.example` to `.env.local` and set `JWT_SECRET`.
2. Leave MySQL password blank if you want the SQLite fallback.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

The Node server starts the Python bridge automatically when `/api/classify/custom` is called.

## Department mapping

The model is trained on document-type classes, not company departments. ImageRoute therefore applies a separate business mapping after prediction:

- `financial` → Finance
- `resume` → HR
- `form`, `specification`, `scientific`, `file_folder` → Operations
- `correspondence`, `email`, `handwritten`, `advertisement`, `news_article`, `presentation`, `questionnaire` → General

There are **no dedicated Legal or Support classes in this trained 13-class model**, so ImageRoute does not pretend that it can distinguish those departments automatically. Operators can manually override the department in the routing screen.

## Important

Do not replace the four bundled artifacts with the old simplified `vocab.json` pipeline. The current classifier architecture must stay aligned with `model.pth`, `model_fusion.pth`, `model_tfidf.pkl`, and `label_map.json`.
