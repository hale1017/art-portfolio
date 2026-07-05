#!/usr/bin/env python3
"""本機開發伺服器(純 Python 標準庫,無需安裝任何東西)。

為什麼不用 `python -m http.server`?
因為它不支援 HTTP Range 請求,Chrome/Edge 播放 MP4 影片會卡住。
這支小伺服器補上 Range 支援,材料包影片在本機才能正常播放。

用法(在 repo 根目錄或任何位置執行皆可):
    python tools/serve.py [埠號]     # 預設 8765
"""
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RangeHandler(SimpleHTTPRequestHandler):
    """在 SimpleHTTPRequestHandler 之上加最小限度的 Range 支援。"""

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")  # 開發時改檔案,重整就要看到
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        rng = self.headers.get("Range")
        if os.path.isdir(path) or not rng:
            return super().send_head()

        m = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
        if not m or m.groups() == ("", ""):
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        start_s, end_s = m.groups()
        if start_s == "":
            # 後綴範圍:最後 N bytes
            start = max(0, size - int(end_s))
            end = size - 1
        else:
            start = int(start_s)
            end = min(int(end_s), size - 1) if end_s else size - 1

        if start > end or start >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            super().end_headers()
            return None

        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        f.seek(start)
        self._range_remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        self._range_remaining = None
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    handler = partial(RangeHandler, directory=root)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print(f"網站預覽:http://localhost:{port}/   (按 Ctrl+C 停止)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
