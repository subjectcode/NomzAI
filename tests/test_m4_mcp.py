import json
import os
import subprocess
import time
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


class MCPStdioClient:
    """Helper client to interact with mcp-proxy over stdio JSON-RPC."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "http://localhost:7860/api/v1/mcp/project/61414591-0059-4e01-b071-5def3106d701/streamable"
        self.cmd = [
            "uvx",
            "--with", "mcp<2.0.0",
            "mcp-proxy",
            "--transport", "streamablehttp",
            "--headers", "x-api-key", self.api_key,
            self.url
        ]
        self.process = None

    def start(self):
        self.process = subprocess.Popen(
            self.cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

    def stop(self):
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=3)
            except Exception:
                self.process.kill()
            self.process = None

    def send_msg(self, msg: dict):
        line = json.dumps(msg) + "\n"
        self.process.stdin.write(line)
        self.process.stdin.flush()

    def read_msg(self, timeout: float = 30.0) -> dict:
        start = time.time()
        while time.time() - start < timeout:
            line = self.process.stdout.readline()
            if line:
                line_str = line.strip()
                if line_str.startswith("{"):
                    return json.loads(line_str)
            time.sleep(0.1)
        raise TimeoutError(f"No response received from MCP within {timeout}s")


@pytest.fixture(scope="module")
def mcp_client():
    api_key = _get_langflow_api_key()
    if not api_key:
        pytest.skip("LANGFLOW_API_KEY not found in environment or backend/.env")
    client = MCPStdioClient(api_key)
    client.start()
    try:
        # Perform initialize handshake
        client.send_msg({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "nomz-test-suite", "version": "1.0"}
            }
        })
        init_res = client.read_msg(timeout=20.0)
        assert init_res.get("id") == 1
        assert "result" in init_res

        client.send_msg({"jsonrpc": "2.0", "method": "notifications/initialized"})
        yield client
    finally:
        client.stop()


def test_mcp_tools_list_find_meals(mcp_client):
    """Test that Langflow MCP server advertises find_meals tool with valid schema."""
    mcp_client.send_msg({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    })
    tools_res = mcp_client.read_msg(timeout=20.0)
    assert tools_res.get("id") == 2
    tools = tools_res.get("result", {}).get("tools", [])
    assert len(tools) > 0

    find_meals_tool = next((t for t in tools if t["name"] == "find_meals"), None)
    assert find_meals_tool is not None, f"find_meals not found in tools: {[t['name'] for t in tools]}"
    assert "inputSchema" in find_meals_tool
    assert "input_value" in find_meals_tool["inputSchema"]["properties"]


def test_mcp_real_tool_call_find_meals(mcp_client):
    """Test end-to-end execution of find_meals via MCP protocol."""
    mcp_client.send_msg({
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "find_meals",
            "arguments": {
                "input_value": "telur, tomat, daun basil"
            }
        }
    })
    call_res = mcp_client.read_msg(timeout=60.0)
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
