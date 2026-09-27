# Milestone 4 — IBM Bob & MCP Integration

## Ringkasan
Milestone 4 menghubungkan IBM Bob dengan workflow Langflow `find_meals` melalui Model Context Protocol (MCP) menggunakan koneksi langsung (direct streamable-http).

## Arsitektur Integrasi
```text
[User di IBM Bob Chat]
         │ (input prompt: "Saya punya telur, tomat, daun basil. Bisa masak apa?")
         ▼
[IBM Bob Agent] ── membaca bob/agent-instructions.md
         │ (mendelegasikan ke tool find_meals via MCP)
         ▼
[.bob/mcp.json (direct streamable-http)]
         │ (koneksi langsung ke Langflow SSE endpoint)
         ▼
[Langflow MCP Server /api/v1/mcp/project/<PROJECT_ID>/sse]
         │ (menjalankan flow find_meals: Google Gemini)
         ▼
[JSON Rekomendasi Terstruktur]
         │ (dikembalikan via MCP response)
         ▼
[IBM Bob Chat] (menampilkan rekomendasi masakan ke user dalam Bahasa Indonesia)
```

## Komponen
1. `bob/agent-instructions.md`: Instruksi sistem agent IBM Bob agar mendelegasikan rekomendasi masakan ke tool `find_meals` dan menyajikan respons dalam Bahasa Indonesia alami.
2. `bob/mcp-config.example.json`: Template konfigurasi MCP direct streamable-http yang aman untuk ditrack Git (menggunakan placeholder tanpa secret).
3. `.bob/mcp.json`: Runtime konfigurasi lokal di workspace Nomz yang menghubungkan IBM Bob langsung ke endpoint Langflow SSE dengan header `x-api-key`. Diabaikan oleh `.gitignore`.
4. `tests/test_m4_mcp.py`: Automated integration test yang menguji protokol MCP direct SSE end-to-end (`initialize` → `tools/list` → `tools/call find_meals` → response validasi).
