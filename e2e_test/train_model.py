"""Training guard for the bundled ImageRoute model.

The production app ships with a trained 13-class CNN + TF-IDF fusion model.
The old 7-class text-only trainer has intentionally been disabled because using
it would overwrite model.pth with an incompatible architecture.

Retraining should be done with the original 13-class training pipeline that
produced model.pth, model_fusion.pth, model_tfidf.pkl and label_map.json.
"""
import json
import sys


def main() -> None:
    print(json.dumps({
        "success": False,
        "error": (
            "Retraining is disabled in this build because the bundled model uses "
            "the 13-class CNN + TF-IDF fusion architecture. The legacy 7-class "
            "trainer is preserved as train_model_legacy.py and must not overwrite "
            "the bundled model artifacts."
        )
    }))
    sys.exit(1)


if __name__ == "__main__":
    main()
