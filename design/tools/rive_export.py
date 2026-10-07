"""Export the open Rive file as app/public/rive/guachito.riv.

The Rive editor's MCP server (http://127.0.0.1:9791/mcp) runs sandboxed and
can't write into the project, so the export comes back inline and is written here.
Usage: python3 design/tools/rive_export.py   (Rive must be open on "Gauchito v1")
"""
import base64
import json
import re
import urllib.request
from pathlib import Path

URL = "http://127.0.0.1:9791/mcp"
DEST = Path(__file__).resolve().parents[2] / "app/public/rive/guachito.riv"


def post(body, sid=None):
    headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if sid:
        headers["mcp-session-id"] = sid
    r = urllib.request.urlopen(urllib.request.Request(URL, json.dumps(body).encode(), headers), timeout=300)
    text = r.read().decode()
    if text.lstrip().startswith(("event", "data")):
        text = "\n".join(line[5:] for line in text.splitlines() if line.startswith("data:"))
    return r.headers.get("mcp-session-id"), text


sid, _ = post({"jsonrpc": "2.0", "id": 1, "method": "initialize",
               "params": {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "guachito-export", "version": "1"}}})
post({"jsonrpc": "2.0", "method": "notifications/initialized"}, sid)
_, text = post({"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "export_file", "arguments": {
    "format": "riv", "destination": str(DEST.parent), "inline_base64": True}}}, sid)
for item in json.loads(text)["result"]["content"]:
    # The bytes arrive as one long base64 run inside a text item (next to a plain message).
    found = re.search(r"[A-Za-z0-9+/=]{1000,}", item.get("text", ""))
    if found:
        raw = base64.b64decode(found.group(0))
        assert raw[:4] == b"RIVE", "not a .riv"
        DEST.parent.mkdir(parents=True, exist_ok=True)
        DEST.write_bytes(raw)
        print(f"wrote {DEST} ({len(raw)} bytes)")
        break
else:
    raise SystemExit("export returned no file")
