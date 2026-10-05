import json

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output
from lfx.schema.message import Message


class RescuePromptBuilder(Component):
    display_name = "Rescue Prompt Builder"
    description = (
        "Menyusun prompt rekomendasi masakan cerdas dan kaya konteks kuliner berdasarkan hasil "
        "normalisasi bahan, strategi food rescue, dan interpretasi gaya masak."
    )
    icon = "sparkles"
    name = "RescuePromptBuilder"

    inputs = [
        MessageTextInput(
            name="interpreted_brief",
            display_name="Interpreted Brief",
            info="Brief dari Cooking Style Interpreter.",
        ),
    ]

    outputs = [
        Output(display_name="Prompt Message", name="prompt", method="build_prompt"),
    ]

    def build_prompt(self) -> Message:
        text = getattr(self.interpreted_brief, "text", None) or str(self.interpreted_brief or "{}")
        try:
            brief = json.loads(text)
        except Exception:
            brief = {}

        ingredients = brief.get("ingredients", [])
        displays = brief.get("ingredient_displays", [])
        use_first = brief.get("use_first", [])
        style = brief.get("cooking_style")
        style_spec = brief.get("style_spec") or {}
        constraint = brief.get("constraint")
        mode = brief.get("mode")
        rules = brief.get("constraint_rules") or {}

        # Formulasi daftar bahan dengan penanda rescue
        ing_lines = []
        for ing in ingredients:
            disp = ing.get("display") or ing.get("name")
            perish = ing.get("perishability")
            cat = ing.get("category")
            tag = " [PRIORITAS RESCUE - CEPAT RUSAK]" if perish == "tinggi" else ""
            ing_lines.append(f"- {disp} ({cat}){tag}")

        ingredients_text = "\n".join(ing_lines) if ing_lines else ", ".join(displays)

        # Aturan gaya masak teknis
        style_instructions = ""
        if style and style_spec:
            forbidden = ", ".join(style_spec.get("forbidden_terms", []))
            required = ", ".join(style_spec.get("required_terms", []))
            style_instructions = f"""
GAYA MASAK WAJIB: {style}
- Teknik Utama: {style_spec.get('technique', '')}
- Alat yang digunakan: {style_spec.get('equipment', '')}
- Pengaturan Panas/Api: {style_spec.get('heat', '')}
- Estimasi Durasi: {style_spec.get('timing', '')}
- Indikator Kematangan: {style_spec.get('cues', '')}
- ISTILAH TERLARANG (JANGAN GUNAKAN): {forbidden}
- ISTILAH WAJIB ADA DALAM LANGKAH: {required}
SETIAP REKOMENDASI HIDANGAN WAJIB MENGGUNAKAN METODE {style} SEBAGAI METODE UTAMA. Dilarang menghasilkan masakan dengan metode bertolak belakang!
"""
        elif style:
            style_instructions = f"\nGAYA MASAK WAJIB: {style}. Semua rekomendasi wajib menggunakan metode {style}.\n"

        # Aturan kendala
        constraint_text = ""
        if constraint or mode:
            notes = rules.get("notes", [])
            notes_str = "; ".join(notes) if notes else (constraint or mode)
            constraint_text = f"\nKENDALA / MODE PENGGUNA: {notes_str}\n"

        prompt_content = f"""Kamu adalah engine rekomendasi kuliner dan perencana masakan rumah tangga profesional untuk aplikasi Nomz.
Tujuan utama Nomz adalah FOOD RESCUE: membantu pengguna memasak makanan lezat dengan memaksimalkan bahan yang sudah dimiliki agar tidak terbuang sia-sia.

DAFTAR BAHAN MAKANAN PENGGUNA:
{ingredients_text}
{style_instructions}{constraint_text}
TUGAS:
Berikan 3 rekomendasi hidangan realistis, lezat, dan ramah dapur rumah tangga yang memprioritaskan bahan di atas (terutama bahan cepat rusak).

ATURAN STRUKTURAL DAN KONSISTENSI KETAT:
1. Kolom 'bahan_tersedia' HANYA BOLEH berisi bahan dari daftar bahan pengguna di atas (pertahankan takaran jika ada, contoh: "1 piring nasi", "2 butir telur", "1 buah tomat", tanpa label tanda kurung). DILARANG KERAS memasukkan bahan baru ke 'bahan_tersedia'.
2. Bahan pelengkap wajar dapur (minyak, garam, gula, bawang, air, merica) WAJIB masuk ke 'bahan_tambahan' beserta takarannya.
3. Kolom 'metode_masak' wajib konsisten dengan gaya masak yang diminta ({style or 'metode utama masakan'}).
4. Kolom 'nama' harus mencerminkan metode masak dan bahan utama secara harmonis.
5. PANDUAN MEMASAK TEKNIS (GUIDED COOKING STEPS):
   Langkah dalam 'langkah' harus terperinci, teknis, dan runtut (minimal 4-6 langkah):
   - Sebutkan bahan dan takarannya saat dimasukkan.
   - Cantumkan tingkat panas api (api kecil, api sedang, api besar).
   - Cantumkan durasi waktu terukur (misal: 2-3 menit, 10 menit).
   - Cantumkan isyarat sensorik (aroma harum, warna kuning keemasan, uap tebal, kuah mendidih bergolak).
   - Berikan tips teknis memasak sesuai metode {style or 'yang dipilih'}.
6. Kolom 'alasan' harus menjelaskan nilai food rescue dan mengapa bahan-bahan tersebut cocok diolah bersama.
7. Format output HARUS berupa JSON valid tanpa teks pengantar atau markdown tambahan di luar JSON.

SCHEMA JSON KELUARAN:
{{
  "recommendations": [
    {{
      "nama": "Nama Resep",
      "deskripsi": "Deskripsi singkat hidangan 1-2 kalimat.",
      "metode_masak": "{style or 'Metode'}",
      "bahan_tersedia": ["bahan dari daftar user"],
      "bahan_tambahan": ["bumbu pelengkap"],
      "estimasi_waktu": "20 menit",
      "tingkat_kesulitan": "Mudah",
      "alasan": "Alasan food rescue dan kecocokan rasa.",
      "langkah": [
        "Langkah 1 teknis...",
        "Langkah 2 teknis...",
        "Langkah 3 teknis..."
      ],
      "porsi": "1-2 porsi"
    }}
  ]
}}
"""
        self.status = f"Prompt generated for {len(ingredients)} ingredients"
        return Message(text=prompt_content.strip())
