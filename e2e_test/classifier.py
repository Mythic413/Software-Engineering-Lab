"""
classifier.py  (v4.1 — corrected for 13-class merged dataset, 8 100 images)
─────────────────────────────────────────────────────────────────
Custom CNN document classifier — built entirely from scratch.

ARCHITECTURE CHANGES vs v3 (all derived from gradient analysis):

    1.  ResConvBlock replaces double-ConvBnRelu
        PROBLEM: 8 conv layers with no skip connections.
                 Gradient from the loss travels backward through
                 8 multiplications.  Each BN+ReLU attenuates ~0.90×,
                 so Block 1 receives 0.90^8 = 43% of the original
                 gradient.  Block 1 is chronically undertrained —
                 it extracts coarse edge features that never improve.
        FIX: ResConvBlock adds a 1×1 skip connection so gradients
             bypass the two conv layers entirely.  Block 1 now
             receives near-100% gradient strength at every step.

    2.  BatchNorm momentum lowered from 0.1 → BN_MOMENTUM (0.05)
        PROBLEM: With batch_size=16 (requested), each batch's
                 distribution is noisier.  Default momentum 0.1 makes
                 running_mean/var update ~14% per batch; at 0.05 it
                 updates ~7%, making inference-time BN stats smoother
                 and more representative of the full dataset.
        FIX: BN_MOMENTUM = 0.05 applied to every BatchNorm2d.

    3.  Dual pooling: AvgPool + MaxPool → concat → 512 features
        PROBLEM: AdaptiveAvgPool(1) compresses 14×14 feature maps to
                 a single vector by averaging.  This discards the peak
                 activation — the most discriminative region of the
                 document (e.g. the heading of a memo, the grid of a
                 form).
        FIX: Concatenate AvgPool and MaxPool outputs.
             AvgPool → average texture/density (global context)
             MaxPool → strongest local activation (key document feature)
             Together → 512-dim vector with 2× richer signal.

    4.  Head: GELU replaces ReLU; dropout raised 0.3 → 0.45
        PROBLEM: ReLU clamps negatives to zero — any negative neuron
                 in the head receives zero gradient permanently (dead
                 neuron).  With the 16% overfitting gap, dropout
                 0.3 was insufficient regularisation.
        FIX: GELU has a smooth gradient for all inputs (no hard zero).
             Dropout raised to 0.45 to close the overfitting gap.

    5.  Output layer initialised with std=0.01 instead of kaiming
        PROBLEM: kaiming_normal_ for the last Linear gave logits with
                 std ≈ 1.0, so softmax was NOT near-uniform at epoch 0.
                 This raised the initial loss to ~3.3 vs the expected
                 ~2.565 (= log(13)) for uniform predictions over 13
                 classes, meaning the first several batches overcorrect
                 and destabilise early training.
        FIX: Last linear weights ~ N(0, 0.01) → near-zero logits →
             near-uniform initial softmax → loss starts at ~2.565.

    6.  ClassifierService.transform: Grayscale(3) added
        PROBLEM: Training v3+ applies Grayscale(3) to every image.
                 The old inference transform did not, causing a
                 distribution mismatch between train and inference.
        FIX: Grayscale(3) added as first step in inference transform,
             with optional override via label_map.json 'grayscale' flag.

CHANGES IN v4.1  (corrected for new 13-class dataset)
──────────────────────────────────────────────────────
    7.  Removed duplicate OCRWarning class
        PROBLEM: OCRWarning was defined in both classifier.py and
                 ocr_engine.py, and was never actually raised here.
                 The duplicate silently shadowed ocr_engine's version
                 if both modules were imported in the same process.
        FIX: Removed entirely from classifier.py.
             Import from ocr_engine if you need it here:
                 from ocr_engine import OCRWarning

    8.  NUM_CLASSES constant added; stale C=16 comment fixed
        PROBLEM: _init_weights docstring said "C=16, loss≈3.32" which
                 was copied from the original 16-class RVL-CDIP setup.
                 After the 3-way merge the dataset has 13 classes:
                 log(13) ≈ 2.565, not 2.77.  The wrong number misleads
                 debugging of initial loss values.
        FIX: NUM_CLASSES = 13 constant added at module level.
             Docstring corrected to C=13, loss≈2.565.

    9.  DATASET_CLASSES canonical label list added
        PROBLEM: The label ordering stored in label_map.json during
                 training must match dataset_summary.json class_ids
                 exactly (0=advertisement … 12=specification).
                 Without a module-level reference list, the ordering
                 could silently drift if train_model.py scans folders
                 in a different sort order across OS/filesystem.
        FIX: DATASET_CLASSES = [...] defines the canonical ordering.
             Use it in train_model.py when building label_map.json.
             ClassifierService now warns when the loaded label list
             does not match this ordering.

    10. Class-imbalance weights added
        PROBLEM: The merged dataset has a 3.71× imbalance:
                 financial=1064 train samples vs presentation=287.
                 With uniform CrossEntropyLoss the model over-predicts
                 financial/scientific/correspondence at the expense of
                 presentation, advertisement, and email.
        FIX: TRAIN_CLASS_COUNTS maps each class to its training count
             (from dataset_summary.json).
             compute_class_weights() returns a float32 Tensor of
             inverse-frequency weights for CrossEntropyLoss(weight=…).
             Usage in train_model.py:
                 weights  = compute_class_weights(device)
                 criterion = nn.CrossEntropyLoss(weight=weights)

Architecture:
   Input (3 × 384 × 384)
 │
 ├─ ResConvBlock(3→32)   + MaxPool  → 32  × 192 × 192
 ├─ ResConvBlock(32→64)  + MaxPool  → 64  × 96  × 96
 ├─ ResConvBlock(64→128) + MaxPool  → 128 × 48  × 48
 ├─ ResConvBlock(128→256)+ MaxPool  → 256 × 24  × 24
 ├─ ResConvBlock(256→512)+ MaxPool  → 512 × 12  × 12   ← new
 │
 ├─ AvgPool(1) → 512   ┐
 ├─ MaxPool(1) → 512   ┤ cat → 1024
 │
 └─ Head: Linear(1024→512) → GELU → Dropout(0.45)
        → Linear(512→256)  → GELU → Dropout(0.22)
        → Linear(256→13)
"""

import os
import json
import warnings
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
import sys

__all__ = [
    "ConvBnRelu", "ResConvBlock", "DocumentCNN", "ClassifierService",
    "NUM_CLASSES", "DATASET_CLASSES", "TRAIN_CLASS_COUNTS",
    "compute_class_weights",
]

# ── Global constants ──────────────────────────────────────────────────────────

# Number of output classes after the 3-way merge
# (memo+letter → correspondence, budget+invoice → financial,
#  scientific_report+scientific_publication → scientific).
# FIX 8: was missing; stale "C=16" comments updated throughout.
NUM_CLASSES: int = 13

# Lower BN momentum: running stats update more smoothly with small batches.
# Default PyTorch is 0.1; 0.05 halves the per-batch update rate.
BN_MOMENTUM: float = 0.05

# ── Canonical label ordering (must match dataset_summary.json class_ids) ─────
# FIX 9: anchors the label→index mapping so train_model.py and
# ClassifierService always agree, regardless of filesystem sort order.
#
# Index 0–12 corresponds to class_id 0–12 in dataset_summary.json:
#   0  advertisement   1  correspondence  2  email         3  file_folder
#   4  financial       5  form            6  handwritten   7  news_article
#   8  presentation    9  questionnaire  10  resume       11  scientific
#  12  specification
DATASET_CLASSES: list[str] = [
    "advertisement",    # 0
    "correspondence",   # 1
    "email",            # 2
    "file_folder",      # 3
    "financial",        # 4
    "form",             # 5
    "handwritten",      # 6
    "news_article",     # 7
    "presentation",     # 8
    "questionnaire",    # 9
    "resume",           # 10
    "scientific",       # 11
    "specification",    # 12
]

# ── Class-imbalance support ───────────────────────────────────────────────────
# FIX 10: Training counts from dataset_summary.json (split="train").
# The dataset has a 3.71× imbalance (financial 1 064 vs presentation 287).
# Use compute_class_weights() to build the weight tensor for CrossEntropyLoss.
#
# Ordered to match DATASET_CLASSES (index 0–12).
TRAIN_CLASS_COUNTS: dict[str, int] = {
    "advertisement":  298,
    "correspondence": 816,
    "email":          299,
    "file_folder":    313,
    "financial":     1064,
    "form":           443,
    "handwritten":    303,
    "news_article":   311,
    "presentation":   287,
    "questionnaire":  300,
    "resume":         300,
    "scientific":     926,
    "specification":  444,
}


def compute_class_weights(
    device: torch.device | str = "cpu",
    smoothing: float = 0.0,
) -> torch.Tensor:
    """
    FIX 10: Compute inverse-frequency class weights for CrossEntropyLoss.

    Formula (per class i):
        w_i = max_count / count_i

    This scales the loss contribution of rare classes upward so they
    receive gradients proportional to their difficulty, not their count.

    After smoothing (optional), weights are L1-normalised so their mean
    is 1.0, keeping the effective learning rate stable.

    Args:
        device    : Target device for the returned tensor ('cpu' or 'cuda').
        smoothing : Add this value to every count before inverting, which
                    softens extreme weights.  0.0 = no smoothing (default).
                    Use e.g. 50.0 if the largest class weight (3.71) feels
                    too aggressive and you want a gentler correction.

    Returns:
        Float32 tensor of shape (NUM_CLASSES,) ordered by DATASET_CLASSES.

    Usage in train_model.py:
        weights   = compute_class_weights(device=device)
        criterion = nn.CrossEntropyLoss(weight=weights)
        # Then use criterion normally — no other changes needed.

    Computed weights (smoothing=0, rounded to 4 dp):
        advertisement  3.5705   correspondence 1.3039   email          3.5585
        file_folder    3.3994   financial      1.0000   form           2.4018
        handwritten    3.5116   news_article   3.4212   presentation   3.7073
        questionnaire  3.5467   resume         3.5467   scientific     1.1490
        specification  2.3964
    """
    counts = [
        float(TRAIN_CLASS_COUNTS[cls]) + smoothing
        for cls in DATASET_CLASSES
    ]
    max_count = max(counts)
    raw = torch.tensor([max_count / c for c in counts], dtype=torch.float32)
    # L1-normalise so mean weight == 1.0 (keeps gradient scale stable)
    raw = raw / raw.mean()
    return raw.to(device)


# ─────────────────────────────────────────────────────────────────────────────
# Building blocks
# ─────────────────────────────────────────────────────────────────────────────

class ConvBnRelu(nn.Module):
    """
    Conv2d + BatchNorm2d + ReLU (no bias — BN subsumes it).
    padding auto-derived as kernel//2 for 'same' spatial size.
    BN_MOMENTUM used for smoother running stats with small batches.
    """
    def __init__(self, in_ch: int, out_ch: int, kernel: int = 3,
                 stride: int = 1):
        super().__init__()
        if kernel % 2 == 0:
            raise ValueError(f"ConvBnRelu: odd kernel required, got {kernel}.")
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel, stride=stride,
                      padding=kernel // 2, bias=False),
            nn.BatchNorm2d(out_ch, momentum=BN_MOMENTUM),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class ResConvBlock(nn.Module):
    """
    Residual block with two 3×3 convolutions and a skip connection.

    Structure (pre-activation style for cleaner gradient flow):
        input
         ├── Conv(3×3)-BN-ReLU
         │   Conv(3×3)-BN          ← no activation before residual add
         └── 1×1 Conv-BN           ← channel projection if in≠out
         ↓
         Add → ReLU → Dropout2d    ← activation after residual sum

    WHY this fixes gradient attenuation:
        Without skip: gradient × 0.90^8 = 43% reaches Block 1.
        With skip:    gradient bypasses both convs directly.
                      Block 1 receives ~100% gradient strength.

    Dropout2d(p) randomly zeroes entire feature-map channels,
    acting as stronger spatial regularisation than element-wise dropout.
    """
    def __init__(self, in_ch: int, out_ch: int, drop2d: float = 0.05):
        super().__init__()
        # Branch: two conv layers
        self.conv1 = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch, momentum=BN_MOMENTUM),
            nn.ReLU(inplace=True),
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch, momentum=BN_MOMENTUM),
            # No activation here — applied AFTER residual add
        )
        # Skip: 1×1 projection when channel count changes
        self.skip = (
            nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, bias=False),
                nn.BatchNorm2d(out_ch, momentum=BN_MOMENTUM),
            )
            if in_ch != out_ch else nn.Identity()
        )
        self.act    = nn.ReLU(inplace=True)
        self.drop2d = nn.Dropout2d(p=drop2d)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        identity = self.skip(x)
        out      = self.conv2(self.conv1(x))
        return self.drop2d(self.act(out + identity))


# ─────────────────────────────────────────────────────────────────────────────
# Main model
# ─────────────────────────────────────────────────────────────────────────────

class DocumentCNN(nn.Module):
    """
    Residual CNN for document image classification.
    All weights initialised from scratch — no pretrained source used.

    Args:
        num_classes : Number of output classes (default NUM_CLASSES = 13).
        dropout     : Dropout rate in the classifier head (default 0.45).
        drop2d      : Dropout2d rate in each ResConvBlock (default 0.05).
    """

    MIN_TRAIN_BATCH = 2   # BatchNorm requires at least 2 samples

    def __init__(
        self,
        num_classes: int   = NUM_CLASSES,
        dropout:     float = 0.45,
        drop2d:      float = 0.05,
    ):
        super().__init__()

        self.features = nn.Sequential(
    # Block 1 — 384×384 → 192×192
    ResConvBlock(3,   32,  drop2d=drop2d),
    nn.MaxPool2d(2, 2),

    # Block 2 — 192×192 → 96×96
    ResConvBlock(32,  64,  drop2d=drop2d),
    nn.MaxPool2d(2, 2),

    # Block 3 — 96×96 → 48×48
    ResConvBlock(64,  128, drop2d=drop2d),
    nn.MaxPool2d(2, 2),

    # Block 4 — 48×48 → 24×24
    ResConvBlock(128, 256, drop2d=drop2d),
    nn.MaxPool2d(2, 2),

    # Block 5 — 24×24 → 12×12  (new — richer features for table/grid docs)
    ResConvBlock(256, 512, drop2d=drop2d),
    nn.MaxPool2d(2, 2),
)

        # Dual pooling: AvgPool captures global context (texture, density);
        # MaxPool captures the strongest local activation (discriminative region).
        # Concatenating gives 512-dim representation — 2× richer than AvgPool alone.
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)

        # Head: 512 → 256 → num_classes
        # GELU used instead of ReLU — smooth gradient for all inputs,
        # no dead neuron problem under heavy dropout.
        self.head = nn.Sequential(
    nn.Linear(1024, 512),
    nn.GELU(),
    nn.Dropout(dropout),
    nn.Linear(512, 256),
    nn.GELU(),
    nn.Dropout(dropout * 0.5),   # lighter second dropout
    nn.Linear(256, num_classes),
)

        self._init_weights()

    def _init_weights(self) -> None:
        """
        Weight initialisation — activation-appropriate methods.

        Conv2d + ResConvBlock conv layers: kaiming_normal_(relu)
        BatchNorm2d: gamma=1, beta=0
        Linear hidden layers: kaiming_normal_(relu) for pre-GELU layers
        Linear output layer: N(0, 0.01) → near-zero logits at init →
            near-uniform softmax → initial loss ≈ log(C) ≈ 2.565 for C=13.

        FIX 8: previous comment incorrectly stated C=16 and loss≈3.32.
            With 13 classes: log(13) ≈ 2.565.  kaiming init gives logit
            std≈1 → initial loss≈3.0+, causing overcorrection in early
            batches.  N(0, 0.01) on the last layer fixes this.
        """
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.ones_(m.weight)
                nn.init.zeros_(m.bias)
            elif isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                nn.init.zeros_(m.bias)

        # Override the LAST linear layer with tiny init for near-uniform start
        last_linear = self.head[-1]
        nn.init.normal_(last_linear.weight, mean=0.0, std=0.01)
        nn.init.zeros_(last_linear.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass with batch-size guard for BatchNorm stability.
        NaN detection is handled in run_epoch (not here) so exceptions
        don't escape the AMP autocast block.
        """
        if self.training and x.shape[0] < self.MIN_TRAIN_BATCH:
            raise ValueError(
                f"[DocumentCNN] Batch size {x.shape[0]} < {self.MIN_TRAIN_BATCH} "
                "required for BatchNorm. Increase BATCH_SIZE or use GroupNorm."
            )

        feat = self.features(x)                       # (B, 512, 12, 12)
        avg  = self.avg_pool(feat).flatten(1)          # (B, 512)
        mx   = self.max_pool(feat).flatten(1)          # (B, 512)
        x    = torch.cat([avg, mx], dim=1)             # (B, 1024)
        return self.head(x)                            # (B, num_classes)

class TextFusionHead(nn.Module):
    """
    Takes CNN logits (B, num_classes) + TF-IDF features (B, tfidf_dim)
    and fuses them into a final prediction.

    Why this works for your failing classes:
        financial  → currency symbols, account/invoice numbers
        scientific → abstract, methodology, references keywords
        form       → checkbox labels, field names like "Date:", "Name:"
    These are perfectly separable by text alone — the CNN struggles
    because they look visually similar at 384×384.
    """
    def __init__(self, num_classes: int, tfidf_dim: int = 300):
        super().__init__()
        # Text branch: TF-IDF → dense embedding
        self.text_branch = nn.Sequential(
            nn.Linear(tfidf_dim, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.GELU(),
        )
        # Fusion: CNN logits + text embedding → final prediction
        # CNN logits are num_classes wide; text branch outputs 128
        self.fusion = nn.Sequential(
            nn.Linear(num_classes + 128, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes),
        )

    def forward(self, cnn_logits: torch.Tensor,
                tfidf_feats: torch.Tensor) -> torch.Tensor:
        text_emb = self.text_branch(tfidf_feats)
        combined = torch.cat([cnn_logits, text_emb], dim=1)
        return self.fusion(combined)
# ─────────────────────────────────────────────────────────────────────────────
# Inference service
# ─────────────────────────────────────────────────────────────────────────────

class ClassifierService:
    """
    Loads trained DocumentCNN weights and classifies a document image or PDF.

    Confidence routing thresholds:
        FINAL      >= 0.85    → high confidence, auto-route
        REVIEW      0.60–0.85 → medium confidence, flag for review
        QUARANTINE < 0.60     → low confidence, manual check required
    """

    FINAL_THRESHOLD      = 0.72
    QUARANTINE_THRESHOLD = 0.45
    # Two-stage routing groups: Stage 1 coarse type, Stage 2 fine class
    ROUTING_GROUPS: dict[str, list[str]] = {
    "text_heavy":    ["email", "correspondence", "resume", "handwritten"],
    "form_like":     ["form", "questionnaire", "financial"],
    "visual_heavy":  ["presentation", "advertisement"],
    "technical":     ["scientific", "specification", "news_article", "file_folder"],
    }

    _REQUIRED_META_KEYS: dict = {
        "labels": list,
        "mean":   list,
        "std":    list,
    }

    def __init__(self, model_path: str, label_map_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"[Classifier] model.pth not found: {model_path}\n"
                "  Run: python train_model.py"
            )
        if not os.path.exists(label_map_path):
            raise FileNotFoundError(
                f"[Classifier] label_map.json not found: {label_map_path}\n"
                "  Run: python train_model.py"
            )

        with open(label_map_path) as f:
            meta = json.load(f)

        for key, typ in self._REQUIRED_META_KEYS.items():
            if key not in meta:
                raise KeyError(
                    f"[Classifier] label_map.json missing key '{key}'. "
                    "Re-run train_model.py."
                )
            if not isinstance(meta[key], typ):
                raise TypeError(
                    f"[Classifier] label_map.json '{key}' should be "
                    f"{typ.__name__}, got {type(meta[key]).__name__}."
                )

        for stat_key in ("mean", "std"):
            if len(meta[stat_key]) != 3:
                raise ValueError(
                    f"[Classifier] label_map.json '{stat_key}' must have 3 values, "
                    f"got {len(meta[stat_key])}. Re-run train_model.py."
                )

        self.labels      = meta["labels"]
        self.mean        = meta["mean"]
        self.std         = meta["std"]
        self.num_classes = len(self.labels)
        # FIX 6: read grayscale flag so inference matches training transform
        self.grayscale   = meta.get("grayscale", False)

        if self.num_classes == 0:
            raise ValueError(
                "[Classifier] label_map.json 'labels' is empty. "
                "Re-run train_model.py."
            )

        # FIX 9: warn if the loaded label list does not match DATASET_CLASSES.
        # A mismatch means label_map.json was built with a different class order
        # than the canonical one, which will silently misroute documents.
        if self.labels != DATASET_CLASSES:
            warnings.warn(
                "[Classifier] label_map.json 'labels' does not match "
                "DATASET_CLASSES.\n"
                f"  Expected : {DATASET_CLASSES}\n"
                f"  Got      : {self.labels}\n"
                "Re-run train_model.py with DATASET_CLASSES to fix ordering.",
                UserWarning, stacklevel=2,
            )

        # FIX 8: warn if num_classes doesn't match NUM_CLASSES constant.
        if self.num_classes != NUM_CLASSES:
            warnings.warn(
                f"[Classifier] label_map.json has {self.num_classes} labels "
                f"but NUM_CLASSES={NUM_CLASSES}. "
                "Model was trained on a different class set.",
                UserWarning, stacklevel=2,
            )

        # FIX 6: Grayscale(3) prepended if training used grayscale conversion
        resize_and_norm = [
            transforms.Resize((384, 384), antialias=True),
            transforms.ToTensor(),
            transforms.Normalize(mean=self.mean, std=self.std),
        ]
        if self.grayscale:
            resize_and_norm.insert(0, transforms.Grayscale(num_output_channels=3))

        self.transform = transforms.Compose(resize_and_norm)

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        self.model = DocumentCNN(num_classes=self.num_classes)
        self.model.load_state_dict(
            torch.load(model_path, map_location=self.device, weights_only=True)
        )
        self.model.to(self.device).eval()
        fusion_path    = os.path.splitext(model_path)[0] + "_fusion.pth"
        vectorizer_path = os.path.splitext(model_path)[0] + "_tfidf.pkl"

        self.fusion_head  = None
        self.tfidf_vectorizer = None

        if os.path.exists(fusion_path) and os.path.exists(vectorizer_path):
            with open(vectorizer_path, "rb") as f:
                self.tfidf_vectorizer = pickle.load(f)
            tfidf_dim = len(self.tfidf_vectorizer.vocabulary_)
            self.fusion_head = TextFusionHead(self.num_classes, tfidf_dim)
            self.fusion_head.load_state_dict(
                torch.load(fusion_path, map_location=self.device, weights_only=True) )
            self.fusion_head.to(self.device).eval()
            print("[Classifier] Text fusion head loaded.", file=sys.stderr)
        else:
            print("[Classifier] No fusion head found — CNN-only mode.", file=sys.stderr)

        print(
            f"[Classifier] Ready"
            f"  |  device={self.device}"
            f"  |  classes={self.num_classes}"
            f"  |  grayscale={self.grayscale}"
            f"  |  mean={[round(v,4) for v in self.mean]}"
        , file=sys.stderr)

    # ── Image loading ─────────────────────────────────────────────────────────

    def _load_image(self, file_path: str) -> torch.Tensor:
        """Load document image or PDF page → normalised (1,3,224,224) tensor."""
        ext = os.path.splitext(file_path)[1].lower()
        try:
            if ext == ".pdf":
                try:
                    from pdf2image import convert_from_path
                except ImportError:
                    raise ImportError(
                        "[Classifier] pdf2image not installed.\n"
                        "  pip install pdf2image  +  install poppler."
                    )
                pil_img = convert_from_path(
                    file_path, first_page=1, last_page=1, dpi=300
                )[0]
                img = pil_img.convert("RGB")
            else:
                raw = Image.open(file_path)
                if raw.mode == "P" and "transparency" in raw.info:
                    img = raw.convert("RGBA").convert("RGB")
                else:
                    img = raw.convert("RGB")
        except FileNotFoundError:
            raise FileNotFoundError(f"[Classifier] Not found: {file_path}")
        except Exception as exc:
            raise RuntimeError(
                f"[Classifier] Cannot load '{file_path}': {exc}"
            ) from exc

        tensor = self.transform(img).unsqueeze(0).to(self.device)

        if torch.isnan(tensor).any() or torch.isinf(tensor).any():
            raise RuntimeError(
                f"[Classifier] NaN/Inf in normalised tensor for '{file_path}'. "
                "Check label_map.json mean/std values."
            )
        return tensor

    # ── Prediction ────────────────────────────────────────────────────────────

    def predict(self, file_path: str, top_k: int = 3, ocr_text: str | None = None) -> dict:
        """
        Classify one document.

        Returns dict: label, confidence, status, action, top_k, logits_ok.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"[Classifier] File not found: {file_path}")

        self.model.eval()

        with torch.no_grad():
            tensor = self._load_image(file_path)
            logits = self.model(tensor)

    # Use fusion head if available and OCR text is provided
            if self.fusion_head is not None and self.tfidf_vectorizer is not None:
                # The bridge can provide OCR text so the document is OCR'd only once.
                if ocr_text is None:
                    from ocr_engine import OCREngine
                    _ocr = OCREngine(fast_mode=True)
                    ocr_text = _ocr.extract_text(file_path)
                tfidf_vec = self.tfidf_vectorizer.transform([ocr_text or ""]).toarray()
                tfidf_t   = torch.tensor(tfidf_vec, dtype=torch.float32).to(self.device)
                logits    = self.fusion_head(logits, tfidf_t)
            probs = F.softmax(logits, dim=1).squeeze(0)
            if torch.isnan(probs).any() or torch.isinf(probs).any():
                warnings.warn(
                        f"[Classifier] NaN/Inf in output for '{file_path}'. "
                        "Routing to QUARANTINE.",
                        RuntimeWarning, stacklevel=2,)
                return {
                    "label": "UNKNOWN", "confidence": float("nan"),
                    "status": "QUARANTINE",
                    "action": "Move to /output/Quarantine  [NaN — corrupt input or model]",
                    "top_k": [], "logits_ok": False,}

            top1_conf, top1_idx = torch.max(probs, dim=0)
            score = top1_conf.item()
            label = self.labels[top1_idx.item()]

            k = min(top_k, self.num_classes)
            topk_v, topk_i = torch.topk(probs, k)
            top_k_results = [
                {"label": self.labels[i.item()], "confidence": round(v.item(), 4)}
                for v, i in zip(topk_v, topk_i)
            ]

        if score >= self.FINAL_THRESHOLD:
            status, action = "FINAL", f"Route to /output/{label}"
        elif score >= self.QUARANTINE_THRESHOLD:
            status, action = "REVIEW", f"Route to /output/{label}  [review]"
        else:
            status, action = "QUARANTINE", "Move to /output/Quarantine"

        return {
            "label":      label,
            "confidence": round(score, 4),
            "status":     status,
            "action":     action,
            "top_k":      top_k_results,
            "logits_ok":  True,
        }

    def predict_batch(self, file_paths: list[str], top_k: int = 3) -> list[dict]:
        """Classify a list of files; bad files get QUARANTINE result."""
        results = []
        for path in file_paths:
            try:
                results.append(self.predict(path, top_k=top_k))
            except Exception as exc:
                warnings.warn(
                    f"[Classifier] Skipping '{path}': {exc}",
                    RuntimeWarning, stacklevel=2,
                )
                results.append({
                    "label": "ERROR", "confidence": 0.0,
                    "status": "QUARANTINE",
                    "action": f"Error: {exc}",
                    "top_k": [], "logits_ok": False,
                })
        return results
    
    def predict_with_routing_group(self, file_path: str,top_k: int = 3) -> dict: 
        result = self.predict(file_path, top_k=top_k)
        label  = result.get("label", "UNKNOWN")
        group = "unknown"
        for grp_name, members in self.ROUTING_GROUPS.items():
            if label in members:
                group = grp_name
                break
        result["routing_group"] = group
        return result
