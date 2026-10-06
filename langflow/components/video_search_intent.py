import json
import re

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output
from lfx.schema.message import Message


class VideoSearchIntent(Component):
    display_name = "Video Search Intent"
    description = (
        "Membangun query pencarian video YouTube yang kaya konteks kuliner berdasarkan hasil rekomendasi resep, "
        "gaya masak, dan bahan utama (bukan sekadar pencarian generik)."
    )
    icon = "search"
    name = "VideoSearchIntent"

    inputs = [
        MessageTextInput(
            name="validated_recipes",
            display_name="Validated Recipes",
            info="JSON hasil validasi dari RecipeValidatorFormatter.",
        ),
        MessageTextInput(
            name="interpreted_brief",
            display_name="Interpreted Brief",
            info="Brief dari Cooking Style Interpreter.",
        ),
    ]

    outputs = [
        Output(display_name="Search Intent", name="intent", method="build_intent"),
    ]

    def build_intent(self) -> Message:
        raw_recipes = getattr(self.validated_recipes, "text", None) or str(self.validated_recipes or "{}")
        brief_str = getattr(self.interpreted_brief, "text", None) or str(self.interpreted_brief or "{}")

        try:
            recipes_data = json.loads(raw_recipes)
        except Exception:
            recipes_data = {"recommendations": []}

        try:
            brief = json.loads(brief_str)
        except Exception:
            brief = {}

        recs = recipes_data.get("recommendations", [])
        if recs:
            top_rec = recs[0]
            recipe_name = top_rec.get("nama") or "Masakan Rumahan"
            metode = top_rec.get("metode_masak") or brief.get("cooking_style") or ""
            bahan_list = top_rec.get("bahan_tersedia", [])
        else:
            recipe_name = "Masakan Rumahan"
            metode = brief.get("cooking_style") or ""
            bahan_list = brief.get("ingredient_names", [])

        # Buat query YouTube terarah
        clean_name = re.sub(r"[^\w\s]", "", recipe_name).strip()
        query_parts = ["resep", clean_name]
        if metode and metode.lower() not in clean_name.lower():
            query_parts.append(metode)
        query_parts.append("tutorial")

        search_query = " ".join(query_parts)

        intent_payload = {
            "search_query": search_query,
            "recipe_name": recipe_name,
            "cooking_style": metode,
            "key_ingredients": bahan_list[:3],
            "recipes_data": recipes_data,
        }

        self.status = f"Query intent: '{search_query}'"
        return Message(text=json.dumps(intent_payload, ensure_ascii=False, indent=2))
