import json
import re

from lfx.custom.custom_component.component import Component
from lfx.io import MessageTextInput, Output
from lfx.schema.message import Message

SUPPORTED_METHODS = ["Tumis", "Goreng", "Kukus", "Rebus", "Panggang", "Air Fryer"]

CONTRADICTORY_KEYWORDS = {
    "Kukus": ["minyak di wajan", "panaskan wajan", "goreng", "tumis", "minyak goreng di wajan", "gorengan"],
    "Rebus": ["minyak di wajan", "panaskan minyak", "goreng", "tumis dengan api", "goreng hingga"],
    "Goreng": ["kukus", "kukusan", "air mendidih 500", "rebus perlahan"],
    "Tumis": ["kukus", "kukusan", "rebus selama 15"],
}


def normalize_recipe_title(recipe_name: str, method: str, target_style: str | None = None) -> str:
    clean_name = recipe_name.strip()
    if not clean_name:
        return f"{method} Istimewa"

    m = (target_style or method).strip().title()

    if target_style:
        contradictions = {
            "Kukus": ["Tumis ", "Goreng ", "Panggang ", "Bakar ", "Rebus "],
            "Rebus": ["Tumis ", "Goreng ", "Panggang ", "Bakar ", "Kukus "],
            "Goreng": ["Kukus ", "Rebus ", "Sup ", "Sop ", "Panggang "],
            "Tumis": ["Kukus ", "Rebus ", "Sup ", "Sop ", "Goreng "],
            "Panggang": ["Kukus ", "Rebus ", "Sup ", "Tumis ", "Goreng "],
            "Air Fryer": ["Kukus ", "Rebus ", "Sup "],
        }

        prefixes = contradictions.get(m, [])
        for prefix in prefixes:
            if clean_name.lower().startswith(prefix.lower()):
                clean_name = f"{m} " + clean_name[len(prefix):]
                break

        if m == "Kukus":
            clean_name = re.sub(r"(?i)\bgoreng\b", "kukus", clean_name)
            clean_name = re.sub(r"(?i)\btumis\b", "kukus", clean_name)
        elif m == "Goreng":
            clean_name = re.sub(r"(?i)\bkukus\b", "goreng", clean_name)
        elif m == "Rebus":
            clean_name = re.sub(r"(?i)\bgoreng\b", "kuah", clean_name)

    return clean_name


def generate_method_technical_steps(recipe_name: str, method: str, ingredients: list[str]) -> list[str]:
    clean_ing = [i.strip() for i in ingredients if i and i.strip()]
    ing_text = ", ".join(clean_ing) if clean_ing else "bahan utama"
    m = method.strip().title()

    if m == "Kukus":
        return [
            f"Persiapan Kukusan & Wadah: Siapkan kukusan/klakat, isi bagian bawah dengan air bersih ±1-1.5 liter, dan siapkan wadah tahan panas untuk bahan ({ing_text}).",
            "Pendidihan Uap: Panaskan kukusan dengan api sedang hingga air mendidih dan uap tebal aktif mengepul keluar dari sela tutup.",
            f"Penataan Bahan: Tata bahan masakan ({ing_text}) ke dalam wadah tahan panas, lalu masukkan wadah secara hati-hati ke dalam kukusan yang telah beruap.",
            "Pengukusan Terkontrol: Tutup rapat kukusan (lapisi kain bersih pada tutup jika perlu agar uap air tidak menetes), kukus dengan api sedang selama 15-20 menit hingga matang merata.",
            f"Pengujian Kematangan & Penyajian: Buka tutup kukusan hati-hati, uji kematangan dengan menusuk bagian tengah {recipe_name.lower()} (pastikan tekstur lembut/padat dan harum aromatik), lalu angkat dan sajikan selagi hangat.",
        ]

    if m == "Rebus":
        return [
            f"Persiapan Panci & Kuah: Siapkan panci, tuang 600-800 ml air bersih (atau kaldu), serta siapkan potongan bahan ({ing_text}).",
            "Pendidihan Awal: Panaskan panci dengan api sedang-tinggi hingga air mendidih bergolak aktif selama 2-3 menit.",
            f"Pemasukan Bahan Bertahap: Masukkan bahan bertekstur lebih padat terlebih dahulu ({ing_text}), masak dengan api sedang hingga setengah empuk.",
            "Pembumbuan & Pematangan Kuah: Masukkan bumbu pelengkap, kecilkan api ke tingkat sedang-kecil (simmering), biarkan rasa meresap dan aroma harum menyatu sempurna selama 8-10 menit.",
            "Penyelesaian: Uji keempukan bahan dan cicipi kuah hangat, matikan api, lalu tuangkan ke mangkuk saji selagi panas.",
        ]

    if m == "Goreng":
        return [
            f"Persiapan Bahan & Wajan: Keringkan permukaan bahan ({ing_text}) dari air berlebih agar tidak meletup, siapkan wajan dan tuang minyak goreng secukupnya.",
            "Pemanasan Minyak Terkontrol: Panaskan minyak dengan api sedang hingga mencapai suhu optimal (±160-170°C, tandai dengan desisan halus saat spatula kayu disentuhkan).",
            f"Penggorengan Bertahap: Masukkan bahan ({ing_text}) secara bertahap agar suhu minyak tidak drop drastis; jangan diaduk terlalu sering pada menit awal agar bentuknya kokoh.",
            "Pembalikan & Pematangan: Balik bahan sekali saat sisi bawah sudah mulai kokoh dan berwarna kuning keemasan, goreng hingga matang merata dan renyah di luar.",
            "Penirisan & Penyajian: Angkat menggunakan serokan kawat, tiriskan sisa minyak di atas rak kawat atau tisu dapur khusus, sajikan selagi renyah.",
        ]

    if m == "Tumis":
        return [
            f"Persiapan Wajan & Aromatik: Siapkan wajan/wok, tuang 1-2 sdm minyak, serta siapkan bahan ({ing_text}) yang sudah dipotong seragam.",
            "Penumisan Bumbu Aromatik: Panaskan minyak dengan api sedang-tinggi, tumis bumbu aromatik selama 45-60 detik hingga harum semerbak dan layu keemasan.",
            f"Pemasukan Bahan Cepat: Besarkan api sedikit, masukkan bahan utama ({ing_text}), tumis cepat (stir-fry) sambil dibolak-balik agar panas merata dan sayur tetap renyah segar.",
            "Pembumbuan Cepat: Tuangkan bumbu pelengkap dan sedikit air (1-2 sdm jika perlu), aduk rata selama 1-2 menit hingga saus menyelimuti seluruh bahan.",
            "Penyajian: Angkat segera sebelum bahan menjadi terlalu layu (overcooked), pindahkan ke piring saji dan hidangkan hangat.",
        ]

    if m == "Panggang":
        return [
            f"Prapemanasan Alat: Panaskan oven pada suhu 180°C (atau panaskan wajan grill/pan panggangan di atas api sedang-kecil).",
            f"Marinasi & Penataan: Lumuri bahan ({ing_text}) dengan sedikit minyak dan bumbu, lalu tata rapi dengan jarak di atas loyang atau pan panggang.",
            "Pemanggangan: Panggang selama 15-20 menit, balik sekali di pertengahan waktu agar kedua sisi matang merata dengan jejak karamelisasi yang cantik.",
            "Penyelesaian: Pastikan bagian dalam matang sempurna dan aroma panggang semerbak, angkat dan sajikan.",
        ]

    if m == "Air Fryer":
        return [
            f"Prapemanasan Unit: Prapanaskan air fryer pada suhu 180°C selama 3 menit.",
            f"Penataan Bahan: Tata bahan ({ing_text}) di dalam keranjang air fryer dalam satu lapisan (single layer, tidak menumpuk). Olesi atau semprot tipis minyak.",
            "Pemasakan & Pengocokan: Masak selama 10-15 menit pada suhu 180°C. Buka keranjang dan kocok/balik bahan di pertengahan waktu (menit ke-6 atau 7).",
            "Penyajian: Periksa kerenyahan permukaan dan kematangan dalam, angkat menggunakan capitan tahan panas dan sajikan hangat.",
        ]

    # Default generic
    return [
        f"Persiapan Bahan: Siapkan dan potong bahan ({ing_text}) dengan ukuran seragam.",
        f"Proses Memasak {m}: Olah bahan menggunakan metode {m} dengan api sedang secara terkontrol.",
        "Pembumbuan & Koreksi Rasa: Tambahkan bumbu pelengkap, aduk rata dan koreksi rasa.",
        "Penyajian: Angkat dan sajikan hidangan selagi hangat.",
    ]


class RecipeValidatorFormatter(Component):
    display_name = "Recipe Validator & Formatter"
    description = (
        "Memvalidasi output resep dari LLM, memastikan root key recommendations ada, "
        "memvalidasi konsistensi metode masak, menolak bahan halusinasi, membersihkan langkah teknis, "
        "dan memastikan format JSON bersih dan siap dikonsumsi oleh Nomz Mobile App & FastAPI."
    )
    icon = "check-check"
    name = "RecipeValidatorFormatter"

    inputs = [
        MessageTextInput(
            name="interpreted_brief",
            display_name="Interpreted Brief",
            info="Brief dari Cooking Style Interpreter.",
        ),
        MessageTextInput(
            name="llm_output",
            display_name="LLM Raw Output",
            info="Teks respons dari model Gemini.",
        ),
    ]

    outputs = [
        Output(display_name="Formatted JSON", name="formatted_json", method="validate_and_format"),
    ]

    def _clean_markdown(self, text: str) -> str:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)
        return cleaned.strip()

    def validate_and_format(self) -> Message:
        raw_llm = getattr(self.llm_output, "text", None) or str(self.llm_output or "")
        cleaned_str = self._clean_markdown(raw_llm)

        brief_str = getattr(self.interpreted_brief, "text", None) or str(self.interpreted_brief or "{}")
        brief = {}
        try:
            brief = json.loads(brief_str)
        except Exception:
            brief = {}

        target_style = brief.get("cooking_style")
        allowed_user_ingredients = [i.lower().strip() for i in brief.get("ingredient_names", [])]
        user_displays = brief.get("ingredient_displays", [])

        # Parse JSON
        parsed = None
        try:
            parsed = json.loads(cleaned_str)
        except Exception:
            m = re.search(r"\{[\s\S]*\}", cleaned_str)
            if m:
                try:
                    parsed = json.loads(m.group(0))
                except Exception:
                    pass

        if not parsed or not isinstance(parsed, dict) or "recommendations" not in parsed:
            self.status = "Fallback: could not parse recommendations"
            # Fallback output safe structure
            fb_method = target_style or "Tumis"
            fb_recs = [{
                "nama": f"{fb_method} Bahan Segar Dapur",
                "deskripsi": f"Hidangan lezat dan bernutrisi dimasak dengan metode {fb_method}.",
                "metode_masak": fb_method,
                "bahan_tersedia": user_displays if user_displays else ["bahan utama"],
                "bahan_tambahan": ["1 sdm minyak / air", "garam secukupnya", "merica secukupnya"],
                "estimasi_waktu": "20 menit",
                "tingkat_kesulitan": "Mudah",
                "alasan": "Memaksimalkan bahan makanan yang tersedia di dapur Anda.",
                "langkah": generate_method_technical_steps(f"{fb_method} Bahan Segar Dapur", fb_method, user_displays),
                "porsi": "1-2 porsi",
            }]
            return Message(text=json.dumps({"recommendations": fb_recs}, ensure_ascii=False, indent=2))

        recs = parsed.get("recommendations", [])
        if not isinstance(recs, list):
            recs = []

        validated_recs = []
        for r in recs:
            if not isinstance(r, dict):
                continue

            nama = r.get("nama") or "Kreasi Makanan Nomz"
            metode = r.get("metode_masak") or target_style or "Tumis"
            if target_style:
                metode = target_style

            # Normalisasi nama resep agar tidak kontradiktif
            nama = normalize_recipe_title(nama, metode, target_style)

            # Validasi bahan_tersedia
            raw_tersedia = r.get("bahan_tersedia", [])
            valid_tersedia = []
            valid_tambahan = list(r.get("bahan_tambahan", []))

            for bt in raw_tersedia:
                bt_str = str(bt).strip()
                # Bersihkan label kategori jika LLM menyalinnya (contoh: '2 butir telur (protein)' -> '2 butir telur')
                bt_clean = re.sub(r"\s*\((?:protein|karbohidrat|sayur|bumbu|lainnya)\)", "", bt_str, flags=re.I).strip()
                bt_lower = bt_clean.lower()
                if allowed_user_ingredients:
                    matched = any(u in bt_lower or bt_lower in u for u in allowed_user_ingredients)
                    if matched:
                        valid_tersedia.append(bt_clean)
                    else:
                        if bt_clean not in valid_tambahan:
                            valid_tambahan.append(bt_clean)
                else:
                    valid_tersedia.append(bt_clean)

            if not valid_tersedia:
                valid_tersedia = user_displays[:1] if user_displays else ["bahan utama"]

            # Batasi bahan tambahan jika ada kendala hemat bahan
            max_extra = brief.get("constraint_rules", {}).get("max_extra_ingredients")
            if max_extra and len(valid_tambahan) > max_extra:
                valid_tambahan = valid_tambahan[:max_extra]

            # Validasi langkah memasak teknis
            raw_steps = r.get("langkah", [])
            if not isinstance(raw_steps, list):
                raw_steps = [str(raw_steps)]

            # Cek kontradiksi langkah terhadap gaya masak
            steps_joined = " ".join(raw_steps).lower()
            contradictions = CONTRADICTORY_KEYWORDS.get(metode, [])
            has_contradiction = any(c in steps_joined for c in contradictions)

            if has_contradiction or len(raw_steps) < 3:
                # Gunakan langkah teknis standar yang konsisten
                final_steps = generate_method_technical_steps(nama, metode, valid_tersedia)
            else:
                final_steps = [s.strip() for s in raw_steps if s and s.strip()]

            validated_recs.append({
                "nama": nama,
                "deskripsi": r.get("deskripsi") or f"Hidangan lezat dengan metode {metode}.",
                "metode_masak": metode,
                "bahan_tersedia": valid_tersedia,
                "bahan_tambahan": valid_tambahan,
                "estimasi_waktu": r.get("estimasi_waktu") or "20 menit",
                "tingkat_kesulitan": r.get("tingkat_kesulitan") or "Mudah",
                "alasan": r.get("alasan") or "Memaksimalkan bahan makanan yang tersedia di dapur Anda.",
                "langkah": final_steps,
                "porsi": r.get("porsi") or "1-2 porsi",
            })

        if not validated_recs:
            fb_method = target_style or "Tumis"
            validated_recs = [{
                "nama": f"{fb_method} Bahan Dapur Nomz",
                "deskripsi": f"Hidangan praktis dengan teknik {fb_method}.",
                "metode_masak": fb_method,
                "bahan_tersedia": user_displays if user_displays else ["bahan utama"],
                "bahan_tambahan": ["garam secukupnya", "bumbu pelengkap"],
                "estimasi_waktu": "20 menit",
                "tingkat_kesulitan": "Mudah",
                "alasan": "Memaksimalkan bahan makanan yang tersedia.",
                "langkah": generate_method_technical_steps(f"{fb_method} Bahan Dapur Nomz", fb_method, user_displays),
                "porsi": "1-2 porsi",
            }]

        result = {"recommendations": validated_recs}
        self.status = f"Validated {len(validated_recs)} resep ({metode})"
        return Message(text=json.dumps(result, ensure_ascii=False, indent=2))
