import json
import pytest
import httpx
from app.core.config import settings
from app.services.langflow import _extract_text_from_langflow_response, _clean_json_markdown

V2_FLOW_ID = "9b196854-4746-49e7-ad92-f67f06c054ff"


def _run_flow(input_val: str) -> dict:
    headers = {"x-api-key": settings.LANGFLOW_API_KEY} if settings.LANGFLOW_API_KEY else {}
    run_url = f"{settings.LANGFLOW_BASE_URL}/api/v1/run/{V2_FLOW_ID}"
    r = httpx.post(
        run_url,
        json={"input_value": input_val, "input_type": "chat", "output_type": "chat"},
        headers=headers,
        timeout=60.0
    )
    assert r.status_code == 200, f"Error {r.status_code}: {r.text[:300]}"
    clean = _clean_json_markdown(_extract_text_from_langflow_response(r.json()))
    data = json.loads(clean)
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    return data


def test_scenario_a_tumis():
    """Scenario A: Tumis - recipe must be stir-fry."""
    data = _run_flow("nasi, telur, bawang, sayur (Gaya masak utama WAJIB: Tumis)")
    for rec in data["recommendations"]:
        assert rec["metode_masak"] == "Tumis"
        name_lower = rec["nama"].lower()
        assert any(k in name_lower for k in ["tumis", "oseng", "cah", "nasi"]), f"Name {rec['nama']} not tumis"


def test_scenario_b_kukus():
    """Scenario B: Kukus - recipe must be steam, no frying/tumis steps."""
    data = _run_flow("telur, jamur (Gaya masak utama WAJIB: Kukus)")
    for rec in data["recommendations"]:
        assert rec["metode_masak"] == "Kukus"
        name_lower = rec["nama"].lower()
        assert any(k in name_lower for k in ["kukus", "tim"]), f"Name {rec['nama']} not kukus"
        for step in rec["langkah"]:
            s_lower = step.lower()
            assert "panaskan minyak" not in s_lower, f"Forbidden term in step: {step}"
            assert "panaskan wajan" not in s_lower, f"Forbidden term in step: {step}"
            assert "minyak goreng di wajan" not in s_lower, f"Forbidden term in step: {step}"


def test_scenario_c_rebus():
    """Scenario C: Rebus - recipe must be boiling/soup."""
    data = _run_flow("mie, sayur, telur (Gaya masak utama WAJIB: Rebus)")
    for rec in data["recommendations"]:
        assert rec["metode_masak"] == "Rebus"
        name_lower = rec["nama"].lower()
        assert any(k in name_lower for k in ["rebus", "kuah", "sup", "sop", "mie"]), f"Name {rec['nama']} not rebus"


def test_scenario_d_goreng():
    """Scenario D: Goreng - recipe must be frying."""
    data = _run_flow("tahu, telur (Gaya masak utama WAJIB: Goreng)")
    for rec in data["recommendations"]:
        assert rec["metode_masak"] == "Goreng"
        name_lower = rec["nama"].lower()
        assert any(k in name_lower for k in ["goreng", "dadar", "krispi", "tahu"]), f"Name {rec['nama']} not goreng"


def test_scenario_e_rescue():
    """Scenario E: Rescue - recipe maximizes limited available ingredients."""
    data = _run_flow("tomat 1 buah, telur 1 butir (Mode: rescue)")
    for rec in data["recommendations"]:
        assert len(rec["bahan_tersedia"]) >= 1
        reason = rec["alasan"].lower()
        assert any(k in reason for k in ["rescue", "penyelamatan", "menyelamatkan", "mengamankan", "membusuk", "terbuang", "memaksimalkan", "cepat", "manfaat", "praktis", "dapur", "matang", "efektif", "segar", "kesegaran"]), f"Reason: {rec['alasan']}"


def test_scenario_f_quantity():
    """Scenario F: Quantity - user quantities preserved."""
    data = _run_flow("telur 2 butir, tomat 1 buah")
    for rec in data["recommendations"]:
        tersedia_str = " ".join(rec["bahan_tersedia"]).lower()
        assert "telur" in tersedia_str
        assert "tomat" in tersedia_str
        assert "2" in tersedia_str or "butir" in tersedia_str
        assert "1" in tersedia_str or "buah" in tersedia_str


def test_scenario_g_constraint():
    """Scenario G: Constraint - respects hemat bahan constraint."""
    data = _run_flow("nasi, telur (Kendala khusus: hemat bahan)")
    for rec in data["recommendations"]:
        # Hemat bahan limits extra ingredients to reasonable staple pantry items
        assert len(rec["bahan_tambahan"]) <= 4, f"Too many extra items: {rec['bahan_tambahan']}"


def test_scenario_h_video_search_and_deduplication():
    """Scenario H & I: Video Search & Deduplication - Langflow V2 returns real deduplicated videos attached to recipes."""
    data = _run_flow("telur, tomat, bawang putih (Gaya masak utama WAJIB: Tumis)")
    assert len(data["recommendations"]) >= 1
    r0 = data["recommendations"][0]
    videos = r0.get("videos") or data.get("videos") or []
    assert len(videos) > 0, "No videos returned by Langflow V2 tool orchestration"
    seen_ids = set()
    for v in videos:
        vid = v.get("video_id")
        assert vid, "Missing video_id"
        assert vid not in seen_ids, f"Duplicate video ID found: {vid}"
        seen_ids.add(vid)
        assert v.get("title"), "Missing video title"
        assert v.get("thumbnail_url"), "Missing thumbnail_url"


def test_scenario_j_video_relevance():
    """Scenario J: Video Relevance - recipe-aware query produces culinary tutorial videos."""
    data = _run_flow("ayam fillet, brokoli (Gaya masak utama WAJIB: Tumis)")
    assert len(data["recommendations"]) >= 1
    r0 = data["recommendations"][0]
    videos = r0.get("videos") or data.get("videos") or []
    assert len(videos) > 0
    # At least one video title reflects culinary cooking relevance
    titles = [v["title"].lower() for v in videos]
    has_relevant_cue = any(
        any(k in t for k in ["ayam", "brokoli", "tumis", "masak", "resep", "cara"])
        for t in titles
    )
    assert has_relevant_cue, f"No relevant culinary video in: {titles[:3]}"


def test_scenario_k_email_tool_orchestration_mock():
    """Scenario K: Email Tool - safe execution test verifying Composio Gmail tool dispatch through Langflow."""
    from app.services.otp import send_otp_email_via_composio
    from unittest.mock import patch
    import io

    # Mock Langflow flow response
    mock_payload = b'{"outputs": [{"outputs": [{"results": {"message": {"text": "{\\"successful\\": true, \\"recipient\\": \\"qa@nomz.dev\\", \\"message_id\\": \\"msg_qa_test_999\\"}"}}}]}]}'
    with patch("urllib.request.urlopen", return_value=io.BytesIO(mock_payload)):
        ok = send_otp_email_via_composio("qa@nomz.dev", "789012", "QA Nomz")
        assert ok is True
