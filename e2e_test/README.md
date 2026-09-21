# ImageRoute

ImageRoute is an AI-assisted document/image routing application. Uploaded documents are analyzed locally using the supplied custom PyTorch CNN, EasyOCR, and TF-IDF fusion model.

## Classification engine

`Image/PDF → EasyOCR → Custom CNN + TF-IDF → 13-class prediction → Department mapping`

Bundled model artifacts:

- `model.pth`
- `model_fusion.pth`
- `model_tfidf.pkl`
- `label_map.json`

No `vocab.json` is needed.

## Quick start (Windows)

```powershell
npm install
python -m pip install torch torchvision easyocr opencv-python numpy pillow pdf2image scikit-learn==1.7.2
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

If your Python executable is not `python`, set `PYTHON_BIN` in `.env.local`, for example:

```text
PYTHON_BIN=py
```

MySQL is optional. If MySQL is not configured, the server falls back to SQLite.

## Model classes

The supplied trained model has 13 classes: advertisement, correspondence, email, file_folder, financial, form, handwritten, news_article, presentation, questionnaire, resume, scientific, specification.

Its supplied training metadata reports a best validation accuracy of 78.01%.

## Department mapping

- financial → Finance
- resume → HR
- form/specification/scientific/file_folder → Operations
- correspondence/email/handwritten/advertisement/news_article/presentation/questionnaire → General

The trained model does not contain dedicated Legal or Support classes. Those departments remain available as manual routing overrides.

## Security / configuration

Set `JWT_SECRET` in `.env.local` for anything beyond a local demo. MySQL credentials are read from environment variables; no database password is hard-coded.

Demo database seed data is disabled by default. Set `DEMO_DATA=true` only if you want the visual demo records.

## Retraining

The old incompatible 7-class trainer is preserved as `train_model_legacy.py`. The active `train_model.py` intentionally refuses to overwrite the bundled model. Retraining should use the original 13-class training pipeline that produced all four model artifacts.
