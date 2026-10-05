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
        assert any(k in reason for k in ["rescue", "penyelamatan", "memaksimalkan", "cepat", "manfaat", "praktis", "dapur"]), f"Reason: {rec['alasan']}"


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
