import json
import re

from lfx.custom.custom_component.component import Component
from lfx.io import IntInput, MessageTextInput, Output
from lfx.schema.message import Message


class VideoRelevanceRanker(Component):
    display_name = "Video Relevance & Ranking"
    description = (
        "Melakukan perangkingan relevansi video tutorial memasak terhadap resep terpilih, "
        "memastikan tidak ada video duplikat, dan menggabungkan video ke dalam kontrak respons terstruktur Nomz."
    )
    icon = "sparkles"
    name = "VideoRelevanceRanker"

    inputs = [
        MessageTextInput(
            name="candidate_videos",
            display_name="Candidate Videos",
            info="Pesan berisi daftar kandidat video dari YouTubeSearchTool.",
        ),
        IntInput(
            name="top_k",
            display_name="Top K Videos",
            info="Batas maksimal video yang disertakan dalam rekomendasi (default 8).",
            value=8,
        ),
    ]

    outputs = [
        Output(display_name="Final Response", name="final_response", method="rank_and_merge"),
    ]

    def _score_relevance(self, video_title: str, recipe_name: str, method: str) -> int:
        title_lower = video_title.lower()
        recipe_words = [w for w in re.split(r"\s+", recipe_name.lower()) if len(w) > 2]
        score = 0
        for w in recipe_words:
            if w in title_lower:
                score += 3
        if method and method.lower() in title_lower:
            score += 2
        if "resep" in title_lower:
            score += 1
        if "cara" in title_lower or "tutorial" in title_lower:
            score += 1
        return score

    def rank_and_merge(self) -> Message:
        raw_candidates = getattr(self.candidate_videos, "text", None) or str(self.candidate_videos or "{}")
        try:
            payload = json.loads(raw_candidates)
        except Exception:
            payload = {}

        candidates = payload.get("candidates", [])
        intent = payload.get("intent", {})
        recipe_name = intent.get("recipe_name", "")
        method = intent.get("cooking_style", "")
        recipes_data = intent.get("recipes_data", {})
        if not isinstance(recipes_data, dict):
            recipes_data = {"recommendations": []}

        top_k = int(self.top_k or 8)

        # 1. Deduplikasi ketat berdasarkan video_id
        seen_ids = set()
        deduped = []
        for v in candidates:
            vid = v.get("video_id")
            if vid and vid not in seen_ids:
                seen_ids.add(vid)
                deduped.append(v)

        # 2. Perangkingan relevansi
        scored = []
        for v in deduped:
            s = self._score_relevance(v.get("title", ""), recipe_name, method)
            scored.append((s, v))

        # Urutkan berdasarkan skor tertinggi
        scored.sort(key=lambda x: x[0], reverse=True)
        top_videos = [item[1] for item in scored[:top_k]]

        # 3. Integrasi ke dalam struktur rekomendasi Nomz
        recs = recipes_data.get("recommendations", [])
        if recs and isinstance(recs, list):
            # Lampirkan video relevan ke rekomendasi utama
            for r in recs:
                if isinstance(r, dict) and "videos" not in r:
                    r["videos"] = top_videos

        recipes_data["videos"] = top_videos
        self.status = f"Ranked & attached {len(top_videos)} videos (deduped from {len(candidates)})"
        return Message(text=json.dumps(recipes_data, ensure_ascii=False, indent=2))
