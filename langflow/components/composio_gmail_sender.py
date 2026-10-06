import json
import logging
import os
import urllib.error
import urllib.request

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output, SecretStrInput
from lfx.schema.message import Message

logger = logging.getLogger(__name__)


class ComposioGmailSender(Component):
    display_name = "Composio Gmail Sender"
    description = (
        "Mengeksekusi pengiriman email transaksional/OTP secara aman melalui Composio v3 Tools API "
        "(GMAIL_SEND_EMAIL) dengan akun terhubung yang terverifikasi."
    )
    icon = "mail"
    name = "ComposioGmailSender"

    inputs = [
        MessageTextInput(
            name="email_payload",
            display_name="Email Payload",
            info="JSON payload berisi recipient_email, subject, body, dan optional display_name.",
        ),
        SecretStrInput(
            name="api_key",
            display_name="Composio API Key",
            info="Kunci API Composio (ak_...).",
            value="COMPOSIO_API_KEY",
        ),
        MessageTextInput(
            name="connected_account_id",
            display_name="Connected Account ID",
            info="ID akun Gmail terhubung pada Composio.",
            value="ca_xzILXmWzTG36",
        ),
    ]

    outputs = [
        Output(display_name="Delivery Result", name="result", method="send_email"),
    ]

    def send_email(self) -> Message:
        raw_payload = getattr(self.email_payload, "text", None) or str(self.email_payload or "{}")
        try:
            data = json.loads(raw_payload)
        except Exception:
            data = {"recipient_email": "", "subject": "", "body": raw_payload}

        recipient = data.get("recipient_email", "").strip()
        subject = data.get("subject", "Pemberitahuan Akun Nomz").strip()
        body = data.get("body", "").strip()

        key = self.api_key or os.environ.get("COMPOSIO_API_KEY", "")
        if hasattr(key, "get_secret_value"):
            key = key.get_secret_value()
        key = str(key or "").strip()

        acc_id = str(self.connected_account_id or "ca_xzILXmWzTG36").strip()

        if not key or not recipient:
            err_msg = "Composio API Key atau recipient_email tidak boleh kosong"
            self.status = f"Error: {err_msg}"
            return Message(text=json.dumps({"successful": False, "error": err_msg}))

        url = "https://backend.composio.dev/api/v3/tools/execute/GMAIL_SEND_EMAIL"
        headers = {
            "x-api-key": key,
            "Content-Type": "application/json",
        }
        req_body = {
            "connected_account_id": acc_id,
            "entity_id": "default",
            "arguments": {
                "recipient_email": recipient,
                "subject": subject,
                "body": body,
            },
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(req_body).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                successful = bool(resp_data.get("successful"))
                msg_id = (
                    resp_data.get("data", {})
                    .get("response_data", {})
                    .get("id")
                )
                self.status = f"Dispatched email to {recipient} (Success: {successful}, msgId: {msg_id})"
                return Message(
                    text=json.dumps({
                        "successful": successful,
                        "recipient": recipient,
                        "message_id": msg_id,
                        "raw": resp_data,
                    }, ensure_ascii=False)
                )
        except Exception as e:
            logger.error("Composio Gmail execution error in Langflow: %s", e)
            self.status = f"Failed to send email to {recipient}: {e}"
            return Message(text=json.dumps({"successful": False, "error": str(e), "recipient": recipient}))
