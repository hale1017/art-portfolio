# -*- coding: utf-8 -*-
"""
process_images.py — 上傳圖片自動壓縮 + 預產縮圖

給 GitHub Actions(.github/workflows/images.yml)與本機使用,冪等:
1. images/uploads/ 的 JPG/PNG:先依 EXIF 轉正,長邊 > 2000px 就縮到 2000px
   並重新壓縮覆寫(藝術家可以直接傳手機原圖,不用自己壓)。
2. 每張圖產出 images/thumbs/<檔名>-480.webp 與 -1600.webp
   (前台 js/data.js 的 imgURL() 直接取用,不再依賴主機的即時影像服務)。
3. 來源已刪除的孤兒縮圖會一併清掉。

SVG 與影片不處理(前台直接用原檔)。
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
UPLOADS = ROOT / "images" / "uploads"
THUMBS = ROOT / "images" / "thumbs"

MAX_EDGE = 2000          # 原圖長邊上限
JPEG_QUALITY = 82
WEBP_QUALITY = 78
THUMB_WIDTHS = (480, 1600)

RASTER_EXTS = {".jpg", ".jpeg", ".png"}


def shrink_original(path: Path) -> bool:
    """長邊超過 MAX_EDGE 的原圖:轉正、縮小、重壓縮覆寫。回傳是否有改動。"""
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)  # 手機照片依 EXIF 轉正,避免縮圖躺平
        w, h = im.size
        if max(w, h) <= MAX_EDGE:
            return False
        scale = MAX_EDGE / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        if path.suffix.lower() in (".jpg", ".jpeg"):
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            im.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        else:
            im.save(path, "PNG", optimize=True)
    return True


def make_thumbs(path: Path) -> int:
    """產出各寬度的 webp 縮圖(來源較新才重做,不放大)。回傳新產出的張數。"""
    made = 0
    src_mtime = path.stat().st_mtime
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)
        for width in THUMB_WIDTHS:
            out = THUMBS / f"{path.stem}-{width}.webp"
            if out.exists() and out.stat().st_mtime >= src_mtime:
                continue
            w, h = im.size
            target_w = min(width, w)  # 不放大
            thumb = im.resize((target_w, round(h * target_w / w)), Image.LANCZOS)
            if thumb.mode == "P":
                thumb = thumb.convert("RGBA")
            thumb.save(out, "WEBP", quality=WEBP_QUALITY)
            made += 1
    return made


def clean_orphans(stems: set) -> int:
    """來源已刪除的縮圖一併移除,倉庫不留垃圾。"""
    removed = 0
    for f in THUMBS.glob("*.webp"):
        stem = f.stem.rsplit("-", 1)[0]
        if stem not in stems:
            f.unlink()
            removed += 1
    return removed


def main():
    THUMBS.mkdir(exist_ok=True)
    sources = sorted(p for p in UPLOADS.iterdir() if p.suffix.lower() in RASTER_EXTS)
    shrunk = thumbs = 0
    for p in sources:
        if shrink_original(p):
            shrunk += 1
            print(f"壓縮原圖:{p.name}")
        thumbs += make_thumbs(p)
    orphans = clean_orphans({p.stem for p in sources})
    print(f"完成:壓縮 {shrunk} 張原圖、產出 {thumbs} 張縮圖、清除 {orphans} 張孤兒縮圖(來源共 {len(sources)} 張)")


if __name__ == "__main__":
    main()
