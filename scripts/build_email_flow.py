import json
import uuid
from pathlib import Path
import httpx

from composio_gmail_sender import ComposioGmailSender

def create_email_flow(comp_dir=None):
    if comp_dir is None:
        comp_dir = Path(__file__).resolve().parent.parent / "langflow" / "components"
    comp_dir = Path(comp_dir)

    chat_input_id = f"ChatInput-{uuid.uuid4().hex[:5]}"
    sender_id = f"ComposioGmailSender-{uuid.uuid4().hex[:5]}"
    chat_output_id = f"ChatOutput-{uuid.uuid4().hex[:5]}"

    chat_input_node = {
        "id": chat_input_id,
        "type": "genericNode",
        "position": {"x": 100, "y": 200},
        "data": {
            "type": "ChatInput",
            "showNode": True,
            "id": chat_input_id,
            "node": {
                "template": {
                    "input_value": {"value": "", "type": "str", "required": False},
                    "files": {"value": [], "type": "file"},
                    "background_color": {"value": ""},
                    "chat_icon": {"value": ""},
                    "text_color": {"value": ""},
                    "sender": {"value": "User"},
                    "sender_name": {"value": "User"},
                    "session_id": {"value": ""},
                    "should_store_message": {"value": True}
                },
                "description": "Get user chat inputs or structured payload.",
                "display_name": "Email Input",
                "outputs": [
                    {
                        "display_name": "Message",
                        "name": "message",
                        "method": "message_response",
                        "types": ["Message"]
                    }
                ]
            }
        }
    }

    sender_inst = ComposioGmailSender()
    sender_fn = sender_inst.to_frontend_node()
    sender_node = {
        "id": sender_id,
        "type": "genericNode",
        "position": {"x": 500, "y": 200},
        "data": {
            "node": sender_fn["data"]["node"],
            "type": "ComposioGmailSender",
            "showNode": True,
            "id": sender_id,
        }
    }
    code_sender = open(comp_dir / "composio_gmail_sender.py", "r", encoding="utf-8").read()
    sender_node["data"]["node"]["template"]["code"]["value"] = code_sender

    chat_output_node = {
        "id": chat_output_id,
        "type": "genericNode",
        "position": {"x": 900, "y": 200},
        "data": {
            "type": "ChatOutput",
            "showNode": True,
            "id": chat_output_id,
            "node": {
                "template": {
                    "input_value": {"value": "", "type": "other", "required": False},
                    "background_color": {"value": ""},
                    "chat_icon": {"value": ""},
                    "text_color": {"value": ""},
                    "sender": {"value": "Machine"},
                    "sender_name": {"value": "AI"},
                    "session_id": {"value": ""},
                    "should_store_message": {"value": True}
                },
                "description": "Display flow output.",
                "display_name": "Email Output",
                "outputs": [
                    {
                        "display_name": "Message",
                        "name": "message",
                        "method": "message_response",
                        "types": ["Message"]
                    }
                ]
            }
        }
    }

    def make_edge(src_id, src_handle, tgt_id, tgt_handle):
        src_str = json.dumps(src_handle)
        tgt_str = json.dumps(tgt_handle)
        return {
            "source": src_id,
            "sourceHandle": src_str,
            "target": tgt_id,
            "targetHandle": tgt_str,
            "data": {
                "sourceHandle": src_handle,
                "targetHandle": tgt_handle
            },
            "id": f"xy-edge__{src_id}{src_str}-{tgt_id}{tgt_str}",
            "animated": False,
            "className": "",
            "selected": False
        }

    edges = [
        make_edge(
            chat_input_id,
            {"dataType": "ChatInput", "id": chat_input_id, "name": "message", "output_types": ["Message"]},
            sender_id,
            {"fieldName": "email_payload", "id": sender_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            sender_id,
            {"dataType": "ComposioGmailSender", "id": sender_id, "name": "result", "output_types": ["Message"]},
            chat_output_id,
            {"fieldName": "input_value", "id": chat_output_id, "inputTypes": ["Data", "JSON", "DataFrame", "Table", "Message"], "type": "other"}
        )
    ]

    flow = {
        "name": "email_otp_sender",
        "description": "Nomz Transactional Email Orchestrator via Composio v3 Gmail Tools.",
        "icon": "mail",
        "icon_bg_color": "#059669",
        "gradient": "",
        "data": {
            "nodes": [chat_input_node, sender_node, chat_output_node],
            "edges": edges,
            "viewport": {"x": 100, "y": 100, "zoom": 1.0}
        },
        "is_component": False,
        "mcp_enabled": True,
        "action_name": "email_otp_sender",
        "action_description": "Send transactional emails and OTP via Composio v3",
        "endpoint_name": "email_otp_sender",
        "tags": ["nomz", "email", "composio", "otp"],
    }
    return flow

if __name__ == "__main__":
    flow = create_email_flow()
    out_path = Path(__file__).resolve().parent.parent / "langflow" / "flows" / "email_otp_sender.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(flow, f, indent=2, ensure_ascii=False)
    print(f"Generated email flow at {out_path}")
