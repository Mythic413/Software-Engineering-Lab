"""Local OCR adapter used by ImageRoute's custom classifier."""
from __future__ import annotations

import os
from pathlib import Path

import cv2
import easyocr
import numpy as np


class OCREngine:
    def __init__(self, fast_mode: bool = True, use_gpu: bool = False):
        self.fast_mode = fast_mode
        self.reader = easyocr.Reader(["en"], gpu=use_gpu, verbose=False)

    def _images_from_file(self, file_path: str):
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            from pdf2image import convert_from_path
            pages = convert_from_path(file_path, first_page=1, last_page=5, dpi=200)
            return [cv2.cvtColor(np.array(page.convert("RGB")), cv2.COLOR_RGB2BGR) for page in pages]

        image = cv2.imread(file_path)
        if image is None:
            raise RuntimeError(f"OCR could not read image: {file_path}")
        return [image]

    def extract_text(self, file_path: str) -> str:
        parts: list[str] = []
        for image in self._images_from_file(file_path):
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            if not self.fast_mode:
                gray = cv2.fastNlMeansDenoising(gray)
            results = self.reader.readtext(gray, detail=0, paragraph=True)
            if results:
                parts.append(" ".join(str(x) for x in results))
        return "\n".join(parts).strip()
