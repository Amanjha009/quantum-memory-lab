"""Local-only JSON API for the optional Python/NumPy physics engine."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.physics import quantum, retention, ispp_program, fn_erase, read_slc_block


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path != "/health":
            self.send_error(404)
            return
        body = json.dumps({"status": "ready", "engine": "numpy"}).encode()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        routes = {
            "/quantum": lambda data: quantum(**data),
            "/retention": lambda data: retention(**data),
            "/nand/ispp": lambda data: ispp_program(**data),
            "/nand/erase": lambda data: fn_erase(**data),
            "/nand/read": lambda data: read_slc_block(**data),
        }
        if self.path not in routes:
            self.send_error(404)
            return
        try:
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
            result = routes[self.path](data)
            body = json.dumps(result, allow_nan=False).encode()
        except (ValueError, TypeError, OverflowError) as exc:
            self.send_error(400, str(exc))
            return
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format, *_args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
