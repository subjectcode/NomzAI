import json
import os
import threading
import time
import urllib.request
import urllib.error
from pathlib import Path
import pytest

# Ensure backend config can be read
backend_dir = Path(__file__).resolve().parent.parent / "backend"
import sys
sys.path.insert(0, str(backend_dir))
from app.core.config import settings


def _get_langflow_api_key() -> str:
    """Retrieve Langflow API key from settings or backend/.env safely."""
    if settings.LANGFLOW_API_KEY:
        return settings.LANGFLOW_API_KEY
    env_path = backend_dir / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("LANGFLOW_API_KEY="):
                    return line.strip().split("=", 1)[1].strip("\"'")
    return ""


class DirectMCPSSEClient:
    """Direct MCP client connecting to Langflow via HTTP SSE (streamable-http)."""

    def __init__(self, sse_url: str, api_key: str):
        self.sse_url = sse_url
        self.api_key = api_key
        self.post_url = None
        self.messages = []
        self._running = False
        self._thread = None
        self._resp = None

    def start(self, timeout: float = 15.0):
        self._running = True
        req = urllib.request.Request(self.sse_url, headers={"x-api-key": self.api_key})
        self._resp = urllib.request.urlopen(req, timeout=timeout)

        self._thread = threading.Thread(target=self._reader, daemon=True)
        self._thread.start()

        start_time = time.time()
        while not self.post_url and time.time() - start_time < timeout:
            time.sleep(0.05)
        if not self.post_url:
            raise RuntimeError("Did not receive endpoint event from Langflow SSE stream")

    def _reader(self):
        current_event = None
        while self._running:
            try:
                line = self._resp.readline()
                if not line:
                    break
                line_str = line.decode("utf-8", errors="ignore").rstrip("\r\n")
                if not line_str:
                    current_event = None
                    continue
                if line_str.startswith("event:"):
                    current_event = line_str.split(":", 1)[1].strip()
                elif line_str.startswith("data:"):
                    data = line_str.split(":", 1)[1].strip()
                    if current_event == "endpoint":
                        if data.startswith("http"):
                            self.post_url = data
                        else:
                            self.post_url = f"http://localhost:7860{data}"
                    elif current_event == "message" or not current_event:
                        try:
                            msg = json.loads(data)
                            self.messages.append(msg)
                        except Exception:
                            pass
            except Exception:
                break

    def post_jsonrpc(self, payload: dict):
        if not self.post_url:
            raise RuntimeError("Client not connected or endpoint URL missing")
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self.post_url,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read()
            if body:
                try:
                    return json.loads(body.decode("utf-8"))
                except Exception:
                    pass
        return None

    def wait_for_response(self, req_id: int, timeout: float = 60.0) -> dict:
        start_time = time.time()
        while time.time() - start_time < timeout:
            for msg in self.messages:
                if msg.get("id") == req_id:
                    return msg
            time.sleep(0.1)
        raise TimeoutError(f"No response with id {req_id} received within {timeout}s")

    def call_method(self, method: str, params: dict, req_id: int, timeout: float = 60.0) -> dict:
        post_res = self.post_jsonrpc({
            "jsonrpc": "2.0",
            "id": req_id,
            "method": method,
            "params": params
        })
        if post_res and post_res.get("id") == req_id:
            return post_res
        return self.wait_for_response(req_id, timeout=timeout)

    def stop(self):
        self._running = False
        if self._resp:
            try:
                self._resp.close()
            except Exception:
                pass


@pytest.fixture(scope="module")
def mcp_client():
    api_key = _get_langflow_api_key()
    if not api_key:
        pytest.skip("LANGFLOW_API_KEY not found in environment or backend/.env")
    sse_url = "http://localhost:7860/api/v1/mcp/project/61414591-0059-4e01-b071-5def3106d701/sse"
    client = DirectMCPSSEClient(sse_url, api_key)
    client.start()
    try:
        # Perform initialize handshake
        init_res = client.call_method(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "nomz-direct-test", "version": "1.0"}
            },
            req_id=1,
            timeout=20.0
        )
        assert init_res.get("id") == 1
        assert "result" in init_res

        # Send initialized notification
        client.post_jsonrpc({"jsonrpc": "2.0", "method": "notifications/initialized"})
        yield client
    finally:
        client.stop()


def test_mcp_tools_list_find_meals(mcp_client):
    """Test that Langflow MCP server advertises find_meals tool with valid schema."""
    tools_res = mcp_client.call_method(
        "tools/list",
        {},
        req_id=2,
        timeout=20.0
    )
    assert tools_res.get("id") == 2
    tools = tools_res.get("result", {}).get("tools", [])
    assert len(tools) > 0

    find_meals_tool = next((t for t in tools if t["name"] == "find_meals"), None)
    assert find_meals_tool is not None, f"find_meals not found in tools: {[t['name'] for t in tools]}"
    assert "inputSchema" in find_meals_tool
    assert "input_value" in find_meals_tool["inputSchema"]["properties"]


def test_mcp_real_tool_call_find_meals(mcp_client):
    """Test end-to-end execution of find_meals via direct MCP protocol."""
    call_res = mcp_client.call_method(
        "tools/call",
        {
            "name": "find_meals",
            "arguments": {
                "input_value": "telur, tomat, daun basil"
            }
        },
        req_id=3,
        timeout=60.0
    )
    assert call_res.get("id") == 3
    assert not call_res.get("result", {}).get("isError", False)

    content = call_res.get("result", {}).get("content", [])
    assert len(content) > 0

    # Content contains the JSON string returned by find_meals
    text_content = content[0].get("text", "")
    assert len(text_content) > 0

    data = json.loads(text_content)
    assert "recommendations" in data
    recs = data["recommendations"]
    assert len(recs) >= 1

    first_rec = recs[0]
    assert "nama" in first_rec and len(first_rec["nama"]) > 0
    assert "deskripsi" in first_rec and len(first_rec["deskripsi"]) > 0
    assert "bahan_tersedia" in first_rec
    assert "bahan_tambahan" in first_rec

    # Verify ingredient integrity
    input_lower = ["telur", "tomat", "daun basil"]
    for b in first_rec["bahan_tersedia"]:
        b_clean = b.lower()
        assert any(u in b_clean or b_clean in u for u in input_lower), (
            f"Ingredient {b} not derived from user input"
        )
