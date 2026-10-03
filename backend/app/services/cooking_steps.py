import re
from typing import List, Optional

# Supported cooking methods
SUPPORTED_METHODS = ["Tumis", "Goreng", "Kukus", "Rebus", "Panggang", "Air Fryer"]

CONTRADICTORY_KEYWORDS = {
    "Kukus": ["minyak di wajan", "panaskan wajan", "goreng", "tumis", "minyak goreng di wajan", "gorengan"],
    "Rebus": ["minyak di wajan", "panaskan minyak", "goreng", "tumis dengan api", "goreng hingga"],
    "Goreng": ["kukus", "kukusan", "air mendidih 500", "rebus perlahan"],
    "Tumis": ["kukus", "kukusan", "rebus selama 15"],
}


def normalize_cooking_method(recipe_name: str, requested_style: Optional[str] = None) -> str:
    """Determine and normalize cooking method based on explicit requested style or recipe name cues."""
    if requested_style and requested_style.strip():
        req_clean = requested_style.strip().title()
        for sm in SUPPORTED_METHODS:
            if sm.lower() == req_clean.lower():
                return sm
        # Handle variations like "Airfryer"
        if "air" in req_clean.lower() and "fry" in req_clean.lower():
            return "Air Fryer"
        return req_clean

    name_lower = recipe_name.lower()
    if any(k in name_lower for k in ["kukus", "tim"]):
        return "Kukus"
    if any(k in name_lower for k in ["rebus", "sup", "sop", "soto", "kuah", "sayur asem", "sayur bening"]):
        return "Rebus"
    if any(k in name_lower for k in ["goreng", "krispi", "crispy"]):
        return "Goreng"
    if any(k in name_lower for k in ["panggang", "bakar", "roast", "grill"]):
        return "Panggang"
    if any(k in name_lower for k in ["air fryer", "airfryer"]):
        return "Air Fryer"
    if any(k in name_lower for k in ["tumis", "cah", "oseng", "orak arik", "balado"]):
        return "Tumis"

    return "Tumis"


def normalize_recipe_title(recipe_name: str, method: str, requested_style: Optional[str] = None) -> str:
    """Ensure the recipe title does not contradict the final cooking method."""
    clean_name = recipe_name.strip()
    if not clean_name:
        return f"{method} Istimewa"

    target_method = method.title()

    # If an explicit cooking style was requested, remove conflicting prefixes
    if requested_style:
        contradictions = {
            "Kukus": ["Tumis ", "Goreng ", "Panggang ", "Bakar ", "Rebus "],
            "Rebus": ["Tumis ", "Goreng ", "Panggang ", "Bakar ", "Kukus "],
            "Goreng": ["Kukus ", "Rebus ", "Sup ", "Sop ", "Panggang "],
            "Tumis": ["Kukus ", "Rebus ", "Sup ", "Sop ", "Goreng "],
            "Panggang": ["Kukus ", "Rebus ", "Sup ", "Tumis ", "Goreng "],
            "Air Fryer": ["Kukus ", "Rebus ", "Sup "],
        }

        prefixes = contradictions.get(target_method, [])
        for prefix in prefixes:
            if clean_name.lower().startswith(prefix.lower()):
                clean_name = f"{target_method} " + clean_name[len(prefix):]
                break

        # If title still contains conflicting method word, sanitize
        if target_method == "Kukus" and "goreng" in clean_name.lower():
            clean_name = re.sub(r'(?i)\bgoreng\b', 'kukus', clean_name)
        elif target_method == "Kukus" and "tumis" in clean_name.lower():
            clean_name = re.sub(r'(?i)\btumis\b', 'kukus', clean_name)
        elif target_method == "Goreng" and "kukus" in clean_name.lower():
            clean_name = re.sub(r'(?i)\bkukus\b', 'goreng', clean_name)
        elif target_method == "Rebus" and "goreng" in clean_name.lower():
            clean_name = re.sub(r'(?i)\bgoreng\b', 'kuah', clean_name)

    return clean_name


def generate_method_technical_steps(recipe_name: str, method: str, ingredients: List[str]) -> List[str]:
    """Generate high-quality, method-consistent technical cooking steps."""
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
            f"Pemasukan Bahan Bertahap: Masukkan bahan utama ({ing_text}) secara bertahap mulai dari bahan yang bertekstur lebih padat agar matang bersamaan.",
            "Perebusan & Pembumbuan: Turunkan api ke tingkat sedang-kecil, rebus secara perlahan (simmer) selama 8-12 menit, lalu bumbui dengan garam, merica, dan kaldu secukupnya hingga kuah sedap gurih.",
            f"Pengecekan Tekstur & Penyajian: Cicipi kuah {recipe_name.lower()} dan pastikan bahan telah empuk sempurna serta rasa seimbang. Matikan api dan sajikan hangat di mangkuk saji.",
        ]

    if m == "Goreng":
        return [
            f"Persiapan Bahan: Keringkan permukaan bahan ({ing_text}) menggunakan tisu dapur agar minyak tidak meletup saat digoreng.",
            "Pemanasan Minyak: Tuang minyak goreng ke wajan secukupnya, panaskan dengan api sedang hingga mencapai suhu ±160-170°C (uji dengan celupkan ujung spatula kayu hingga berdesis halus).",
            f"Penggorengan Bertahap: Masukkan bahan ({ing_text}) secara hati-hati ke dalam minyak panas tanpa membuat wajan terlalu penuh agar suhu minyak tetap stabil.",
            "Pengendalian Panas & Pembalikan: Masak dengan api sedang, biarkan sisi bawah kokoh selama 2-3 menit sebelum dibalik satu kali agar matang merata dan tidak menyerap minyak berlebih.",
            f"Penirisan & Penyajian: Goreng {recipe_name.lower()} hingga permukaan renyah dan berwarna kuning keemasan. Angkat, tiriskan di atas peniris minyak, lalu sajikan hangat.",
        ]

    if m == "Panggang":
        return [
            f"Persiapan Bahan & Marinasi: Bumbui dan olesi bahan ({ing_text}) secara merata dengan bumbu olesan atau minyak tipis.",
            "Prapemanasan Alat: Panaskan panggangan/grill pan atau oven dengan api sedang/suhu 180°C selama 5 menit hingga panas merata.",
            f"Pemanggangan: Letakkan bahan ({ing_text}) di atas panggangan panas dengan jarak cukup agar sirkulasi udara panas optimal.",
            "Pembalikan & Pengontrolan: Panggang selama 6-8 menit per sisi, oleskan sisa bumbu berkala, dan balik saat muncul bercak grill mark kecokelatan yang harum.",
            f"Pengujian & Penyajian: Pastikan bagian dalam {recipe_name.lower()} telah matang sempurna dan juicy, angkat dari panggangan, istirahatkan 1 menit, lalu sajikan hangat.",
        ]

    if m == "Air Fryer":
        return [
            f"Persiapan Keranjang & Bahan: Siapkan keranjang air fryer, olesi tipis minyak, dan masukkan bahan ({ing_text}) dalam satu lapisan tanpa bertumpuk.",
            "Prapemanasan: Setel air fryer ke suhu 180°C dan panaskan selama 3 menit.",
            f"Pemasakan: Masukkan keranjang berisi bahan {recipe_name.lower()} ke dalam air fryer, atur waktu masak 10-12 menit.",
            "Pengocokan di Tengah Waktu: Pada menit ke-6, tarik keranjang keluar dan balik bahan secara merata agar sirkulasi udara renyah merata.",
            "Penyelesaian: Masak hingga sisa waktu habis dan warna kecokelatan keemasan renyah. Angkat dan sajikan selagi renyah hangat.",
        ]

    # Default to Tumis
    return [
        f"Persiapan Bahan: Siapkan dan potong rapi bahan utama ({ing_text}) dengan ukuran seragam agar tingkat kematangan merata.",
        "Pemanasan Wajan & Minyak: Panaskan wajan/wok dengan api sedang, tambahkan 1-2 sdm minyak goreng dan biarkan panas hingga minyak mengalir encer di permukaan wajan.",
        "Penumisan Bumbu Aromatik: Masukkan bumbu dasar/aromatik terlebih dahulu, tumis cepat selama 30-45 detik dengan api sedang hingga aroma harum semerbak keluar.",
        f"Pemasukan Bahan Utama: Masukkan bahan utama ({ing_text}), aduk cepat dengan teknik stir-fry selama 2-4 menit hingga layu namun tetap bertekstur segar.",
        f"Pembumbuan & Penyelesaian: Tambahkan bumbu pelengkap dan sedikit air jika perlu, aduk rata 30 detik hingga bumbu menyelimuti {recipe_name.lower()} mengilap, angkat dan sajikan selagi hangat.",
    ]


def ensure_recipe_consistency(
    item_nama: str,
    item_metode_masak: Optional[str],
    item_bahan_tersedia: List[str],
    item_langkah: List[str],
    cooking_style: Optional[str] = None,
) -> tuple[str, str, List[str]]:
    """Normalize recipe name, cooking method, and technical steps to ensure full consistency."""
    # 1. Determine method
    final_method = normalize_cooking_method(item_nama, requested_style=cooking_style)

    # 2. Normalize title
    final_name = normalize_recipe_title(item_nama, final_method, requested_style=cooking_style)

    # 3. Check steps for absence or direct contradiction with final method
    needs_new_steps = False
    if not item_langkah or len(item_langkah) < 2:
        needs_new_steps = True
    else:
        # Check contradictory keywords
        forbidden = CONTRADICTORY_KEYWORDS.get(final_method, [])
        combined_steps = " ".join(item_langkah).lower()
        if any(f in combined_steps for f in forbidden):
            needs_new_steps = True

    if needs_new_steps:
        final_steps = generate_method_technical_steps(final_name, final_method, item_bahan_tersedia)
    else:
        final_steps = item_langkah

    return final_name, final_method, final_steps
