import json
import re

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output
from lfx.schema.message import Message

UNIT_ALIASES = {
    "g": "gram", "gr": "gram", "gram": "gram", "kg": "kg", "ons": "ons",
    "ml": "ml", "l": "liter", "liter": "liter",
    "btr": "butir", "butir": "butir", "biji": "biji", "buah": "buah", "bh": "buah", "pcs": "buah",
    "siung": "siung", "lembar": "lembar", "lbr": "lembar", "slice": "lembar",
    "batang": "batang", "btg": "batang", "ikat": "ikat", "tangkai": "tangkai", "ruas": "ruas",
    "sdm": "sdm", "sdt": "sdt", "piring": "piring", "mangkuk": "mangkuk", "gelas": "gelas",
    "cup": "cup", "potong": "potong", "iris": "iris", "bungkus": "bungkus", "pack": "bungkus",
    "sachet": "sachet", "porsi": "porsi", "genggam": "genggam", "ekor": "ekor", "kaleng": "kaleng",
    "centong": "centong", "papan": "papan",
}

NAME_ALIASES = {
    "telor": "telur", "telur ayam": "telur", "telur ayam negeri": "telur", "telur ayam kampung": "telur",
    "cabe": "cabai", "cabe merah": "cabai merah", "cabe rawit": "cabai rawit",
    "bawang bombay": "bawang bombai", "bawang bombai": "bawang bombai",
    "tomat merah": "tomat", "buncis hijau": "buncis", "daun bawang": "daun bawang",
    "nasi putih": "nasi", "nasi sisa": "nasi", "nasi dingin": "nasi",
    "mi": "mie", "mi instan": "mie instan", "indomie": "mie instan",
}

CATEGORY_KEYWORDS = [
    ("protein", ["telur", "ayam", "daging", "sapi", "ikan", "udang", "tahu", "tempe", "sosis", "bakso",
                 "cumi", "salmon", "tuna", "kornet", "nugget"]),
    ("karbohidrat", ["nasi", "mie", "bihun", "kwetiau", "kentang", "roti", "pasta", "spaghetti",
                     "singkong", "jagung", "ubi", "lontong", "soun"]),
    ("sayur", ["bayam", "kangkung", "sawi", "pakcoy", "wortel", "brokoli", "kol", "kubis", "tomat",
               "timun", "mentimun", "terong", "buncis", "jamur", "labu", "paprika", "selada", "tauge",
               "kacang panjang", "kembang kol", "daun", "kemangi", "kacang"]),
    ("bumbu", ["bawang", "garam", "gula", "kecap", "saus", "merica", "lada", "jahe", "kunyit", "lengkuas",
               "serai", "santan", "minyak", "cabai", "cabe", "kaldu", "mentega", "keju"]),
]

# 3 = cepat rusak (pakai duluan), 2 = sedang, 1 = awet
PERISHABILITY = [
    (3, ["bayam", "kangkung", "sawi", "pakcoy", "selada", "tauge", "kemangi", "daun", "ayam", "ikan",
         "udang", "daging", "cumi", "salmon", "jamur", "tahu", "nasi", "bakso", "sosis", "santan"]),
    (2, ["tomat", "timun", "mentimun", "terong", "buncis", "brokoli", "kol", "kubis", "paprika", "tempe",
         "telur", "mie", "labu", "kacang panjang", "wortel"]),
    (1, ["bawang", "kentang", "garam", "gula", "kecap", "saus", "minyak", "merica", "lada", "jahe",
         "kunyit", "ubi", "singkong", "bihun", "pasta", "spaghetti"]),
]
PERISH_LABEL = {3: "tinggi", 2: "sedang", 1: "rendah"}


def _first_hit(name, table, default):
    for key, words in table:
        for w in words:
            if w in name:
                return key
    return default


class IngredientNormalizer(Component):
    display_name = "Ingredient Normalizer"
    description = (
        "Menormalkan bahan dari Nomz ('telur 2 butir' = '2 butir telur' = '2 telur'), "
        "memisahkan jumlah/satuan, mengelompokkan kategori, menilai tingkat cepat-busuk "
        "(prioritas food-rescue) dan mengekstrak gaya masak, kendala, serta mode dari request."
    )
    icon = "list-checks"
    name = "IngredientNormalizer"

    inputs = [
        MessageTextInput(
            name="request",
            display_name="Nomz Request",
            info="Teks request dari FastAPI/Bob: 'bahan1, bahan2 (Gaya masak utama WAJIB: Kukus) (Kendala khusus: hemat bahan)'. "
                 "Juga menerima JSON dengan key ingredients/cooking_style/constraint/mode.",
        ),
    ]

    outputs = [
        Output(display_name="Normalized Brief", name="brief", method="build_brief"),
    ]

    def _split_request(self, text):
        style = constraint = mode = None
        ingredients_raw = []
        stripped = text.strip()
        if stripped.startswith("{"):
            try:
                obj = json.loads(stripped)
                ing = obj.get("ingredients") or []
                ingredients_raw = [str(i) for i in ing] if isinstance(ing, list) else re.split(r"[,;\n]", str(ing))
                style = obj.get("cooking_style")
                constraint = obj.get("constraint")
                mode = obj.get("mode")
                return ingredients_raw, style, constraint, mode
            except Exception:
                pass
        m = re.search(r"gaya\s+masak(?:\s+utama)?(?:\s+wajib)?\s*:\s*([^)]+)", text, re.I)
        if m:
            style = m.group(1).strip()
        m = re.search(r"kendala(?:\s+khusus)?\s*:\s*([^)]+)", text, re.I)
        if m:
            constraint = m.group(1).strip()
        m = re.search(r"mode\s*:\s*([^)]+)", text, re.I)
        if m:
            mode = m.group(1).strip()
        body = re.sub(r"\([^)]*\)", " ", text)
        parts = re.split(r"[,;\n]| dan ", body)
        ingredients_raw = [p for p in parts if p and p.strip()]
        return ingredients_raw, style, constraint, mode

    def _parse_ingredient(self, raw):
        token = re.sub(r"\s+", " ", raw.strip().strip("-•*").strip()).lower()
        if not token:
            return None
        qty_text, unit = None, None
        m = re.search(r"(\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?)", token)
        if m:
            qty_text = re.sub(r"\s+", "", m.group(1)).replace(",", ".")
            before = token[: m.start()].strip()
            after = token[m.end():].strip()
            if not before:
                words = after.split(" ")
                if words and words[0] in UNIT_ALIASES:
                    unit = UNIT_ALIASES[words[0]]
                    name = " ".join(words[1:]).strip()
                else:
                    name = after
            else:
                words = after.split(" ") if after else []
                if words and words[0] in UNIT_ALIASES:
                    unit = UNIT_ALIASES[words[0]]
                    rest = " ".join(words[1:]).strip()
                else:
                    rest = after
                name = (before + (" " + rest if rest else "")).strip()
        else:
            name = token
            if "secukupnya" in token:
                name = token.replace("secukupnya", "").strip()
                unit = "secukupnya"
        name = re.sub(r"\s+", " ", name).strip(" -:")
        if not name:
            return None
        name = NAME_ALIASES.get(name, name)
        quantity = None
        if qty_text:
            try:
                if "/" in qty_text:
                    a, b = qty_text.split("/")
                    quantity = float(a) / float(b)
                else:
                    quantity = float(qty_text)
            except Exception:
                quantity = None
        return {"name": name, "quantity": quantity, "quantity_text": qty_text, "unit": unit, "raw": raw.strip()}

    def build_brief(self) -> Message:
        text = getattr(self.request, "text", None) or str(self.request or "")
        raw_items, style, constraint, mode = self._split_request(text)

        merged = {}
        order = []
        for raw in raw_items:
            parsed = self._parse_ingredient(raw)
            if not parsed:
                continue
            key = parsed["name"]
            if key in merged:
                cur = merged[key]
                same_unit = cur["unit"] == parsed["unit"] or cur["unit"] is None or parsed["unit"] is None
                if same_unit and cur["quantity"] is not None and parsed["quantity"] is not None:
                    cur["quantity"] += parsed["quantity"]
                    cur["unit"] = cur["unit"] or parsed["unit"]
                    q = cur["quantity"]
                    cur["quantity_text"] = str(int(q)) if float(q).is_integer() else str(round(q, 2))
                elif cur["quantity"] is None:
                    cur.update({k: parsed[k] for k in ("quantity", "quantity_text", "unit")})
                continue
            merged[key] = parsed
            order.append(key)

        ingredients = []
        for key in order:
            p = merged[key]
            if p["quantity_text"] and p["unit"] and p["unit"] != "secukupnya":
                display = f"{p['quantity_text']} {p['unit']} {p['name']}"
            elif p["quantity_text"]:
                display = f"{p['quantity_text']} {p['name']}"
            elif p["unit"] == "secukupnya":
                display = f"{p['name']} secukupnya"
            else:
                display = p["name"]
            score = _first_hit(p["name"], PERISHABILITY, 2)
            ingredients.append({
                "name": p["name"],
                "quantity": p["quantity"],
                "unit": p["unit"],
                "display": display,
                "category": _first_hit(p["name"], CATEGORY_KEYWORDS, "lainnya"),
                "perishability": PERISH_LABEL[score],
                "source_text": p["raw"],
            })

        brief = {
            "ingredients": ingredients,
            "ingredient_names": [i["name"] for i in ingredients],
            "ingredient_displays": [i["display"] for i in ingredients],
            "use_first": [i["name"] for i in ingredients if i["perishability"] == "tinggi"],
            "cooking_style": style,
            "constraint": constraint,
            "mode": mode,
        }
        self.status = f"{len(ingredients)} bahan, gaya={style}"
        return Message(text=json.dumps(brief, ensure_ascii=False))
