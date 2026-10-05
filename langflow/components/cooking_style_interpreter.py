import json
import re

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output
from lfx.schema.message import Message

# Spesifikasi teknik per metode masak. Dipakai oleh prompt resep, prompt panduan teknis,
# dan validator untuk memastikan metode benar-benar konsisten (judul -> bahan -> metode -> langkah).
METHOD_CATALOG = {
    "Kukus": {
        "technique": "Steaming: bahan dimasak oleh uap air mendidih di kukusan, tanpa minyak penggorengan.",
        "equipment": "kukusan/steamer, wadah tahan panas, tutup (lapisi kain agar uap tidak menetes)",
        "heat": "air mendidih dulu, lalu api sedang agar uap tebal stabil",
        "timing": "10-25 menit tergantung ketebalan bahan",
        "cues": "uap mengepul tebal; tekstur set/empuk; tusuk lidi/garpu keluar bersih",
        "forbidden_terms": ["goreng", "tumis", "panaskan wajan", "panaskan minyak", "minyak panas", "sangrai", "oven", "air fryer"],
        "required_terms": ["kukus", "uap"],
    },
    "Rebus": {
        "technique": "Boiling/simmering: bahan dimasak dalam air atau kuah mendidih lalu dikecilkan.",
        "equipment": "panci, air/kaldu secukupnya, sendok sayur",
        "heat": "api besar sampai mendidih, kecilkan ke api kecil-sedang agar simmer",
        "timing": "8-20 menit; bahan padat dahulu, sayur lunak belakangan",
        "cues": "kuah bergolak halus; bahan empuk; kuah gurih seimbang",
        "forbidden_terms": ["goreng", "tumis", "panaskan wajan", "panaskan minyak", "minyak panas", "kukusan", "oven", "air fryer"],
        "required_terms": ["rebus", "kuah", "mendidih"],
    },
    "Goreng": {
        "technique": "Frying: bahan dimasak dalam minyak panas yang cukup banyak hingga kecokelatan renyah.",
        "equipment": "wajan/penggorengan dalam, minyak goreng, spatula, peniris",
        "heat": "api sedang (±170°C); jangan terlalu penuh agar suhu minyak stabil",
        "timing": "2-4 menit per sisi; balik sekali",
        "cues": "minyak berdesis halus saat bahan masuk; kuning keemasan; ditiriskan",
        "forbidden_terms": ["kukus", "kukusan", "uap", "rebus", "direbus", "oven", "air fryer"],
        "required_terms": ["goreng", "minyak"],
    },
    "Tumis": {
        "technique": "Stir-frying: bahan diaduk cepat di wajan dengan sedikit minyak api sedang-tinggi.",
        "equipment": "wajan/wok, sedikit minyak, spatula",
        "heat": "api sedang-tinggi, bumbu aromatik lebih dulu lalu bahan utama",
        "timing": "5-10 menit total; aduk terus",
        "cues": "aroma bawang harum; sayur layu tapi renyah; bumbu menyelimuti bahan",
        "forbidden_terms": ["kukus", "kukusan", "uap", "rebus selama", "direbus selama", "oven", "air fryer", "deep fry"],
        "required_terms": ["tumis", "wajan"],
    },
    "Panggang": {
        "technique": "Roasting/grilling: bahan dimasak oleh panas kering oven atau panggangan.",
        "equipment": "oven/teflon panggang/grill pan, loyang atau alas, kuas minyak",
        "heat": "oven 180°C (prapanaskan 5-10 menit) atau panggangan api sedang",
        "timing": "10-25 menit; balik di tengah waktu",
        "cues": "permukaan kecokelatan; aroma panggang harum; bagian dalam matang",
        "forbidden_terms": ["kukus", "kukusan", "rebus", "direbus", "tumis", "goreng hingga", "air fryer"],
        "required_terms": ["panggang", "oven", "grill", "panggangan"],
    },
    "Air Fryer": {
        "technique": "Air frying: udara panas bersirkulasi cepat memasak bahan dengan sedikit minyak.",
        "equipment": "air fryer, keranjang, semprot/olesan tipis minyak",
        "heat": "180°C, prapanaskan 3 menit",
        "timing": "8-15 menit; kocok/balik keranjang di tengah",
        "cues": "permukaan renyah keemasan; tidak ada genangan minyak",
        "forbidden_terms": ["kukus", "kukusan", "rebus", "direbus", "tumis", "panaskan wajan", "goreng dalam minyak"],
        "required_terms": ["air fryer", "keranjang"],
    },
}

STYLE_ALIASES = {
    "kukus": "Kukus", "steam": "Kukus", "steaming": "Kukus", "tim": "Kukus",
    "rebus": "Rebus", "boil": "Rebus", "kuah": "Rebus",
    "goreng": "Goreng", "fried": "Goreng", "deep fry": "Goreng",
    "tumis": "Tumis", "stir fry": "Tumis", "oseng": "Tumis",
    "panggang": "Panggang", "bakar": "Panggang", "grill": "Panggang", "oven": "Panggang",
    "air fryer": "Air Fryer", "airfryer": "Air Fryer", "air-fryer": "Air Fryer",
}


def canonical_method(value):
    if not value:
        return None
    v = re.sub(r"\s+", " ", str(value).strip().lower())
    if v in STYLE_ALIASES:
        return STYLE_ALIASES[v]
    for alias, method in STYLE_ALIASES.items():
        if alias in v:
            return method
    return None


class CookingStyleInterpreter(Component):
    display_name = "Cooking Style Interpreter"
    description = (
        "Mengubah gaya masak + kendala + mode menjadi spesifikasi teknis nyata (peralatan, panas, waktu, "
        "indikator kematangan, istilah terlarang/wajib) agar resep dan langkah memasak benar-benar "
        "sesuai metode, bukan sekadar label."
    )
    icon = "chef-hat"
    name = "CookingStyleInterpreter"

    inputs = [
        MessageTextInput(
            name="brief",
            display_name="Normalized Brief",
            info="JSON dari Ingredient Normalizer.",
        ),
    ]

    outputs = [
        Output(display_name="Interpreted Brief", name="interpreted", method="interpret"),
    ]

    def _constraint_rules(self, constraint, mode):
        text = f"{constraint or ''} {mode or ''}".lower()
        rules = {"max_extra_ingredients": None, "max_minutes": None, "max_steps": None, "notes": []}
        if any(k in text for k in ["hemat", "tanpa belanja", "tidak belanja", "tanpa beli", "no_shopping", "no shopping"]):
            rules["max_extra_ingredients"] = 3
            rules["notes"].append("Hemat bahan: tambahan hanya bumbu dapur dasar, maksimal 3 item.")
        if any(k in text for k in ["cepat", "quick", "instan", "buru"]):
            rules["max_minutes"] = 15
            rules["notes"].append("Cepat: total waktu maksimal 15 menit.")
        if any(k in text for k in ["sederhana", "simple", "praktis"]):
            rules["max_steps"] = 5
            rules["max_extra_ingredients"] = rules["max_extra_ingredients"] or 4
            rules["notes"].append("Sederhana: maksimal 5 langkah dan bumbu minimal.")
        if "free" in text or "bebas" in text:
            rules["notes"].append("Eksplorasi bebas: variasi rasa dan teknik dipersilakan.")
        if not rules["notes"]:
            rules["notes"].append("Rescue: prioritaskan bahan yang paling cepat rusak.")
        return rules

    def interpret(self) -> Message:
        text = getattr(self.brief, "text", None) or str(self.brief or "{}")
        brief = json.loads(text)

        style_raw = brief.get("cooking_style")
        method = canonical_method(style_raw)
        constraint = brief.get("constraint")
        # Frontend lama kadang mengirim metode lewat constraint ('Tumis').
        if not method and canonical_method(constraint) and (constraint or "").strip().lower() in STYLE_ALIASES:
            method = canonical_method(constraint)
            brief["constraint"] = None

        brief["cooking_style"] = method or style_raw
        brief["method_locked"] = bool(method)
        brief["style_spec"] = ({"method": method, **METHOD_CATALOG[method]} if method else None)
        brief["method_catalog"] = {
            m: {"technique": s["technique"], "forbidden_terms": s["forbidden_terms"], "required_terms": s["required_terms"]}
            for m, s in METHOD_CATALOG.items()
        }
        brief["constraint_rules"] = self._constraint_rules(brief.get("constraint"), brief.get("mode"))
        self.status = f"metode={method or 'bebas'}"
        return Message(text=json.dumps(brief, ensure_ascii=False))
