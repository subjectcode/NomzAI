# Nomz Langflow Workflow Definitions

Direktori ini berisi definisi workflow Langflow yang digunakan saat runtime oleh backend FastAPI Nomz.

## Workflow 1: `find_meals` (Milestone 3)
- **Nama Flow**: `find_meals`
- **Flow ID**: `2e514b81-21d7-49b9-9fae-a981f95a8029`
- **File Definisi**: [find_meals.json](file:///d:/Projects/Bob/Nomz/langflow/find_meals.json)
- **Runtime Endpoint**: `POST http://localhost:7860/api/v1/run/2e514b81-21d7-49b9-9fae-a981f95a8029`
- **Authentication**: Header `x-api-key: <LANGFLOW_API_KEY>`

### Node & Komponen Aktual:
1. **Chat Input** (`ChatInput-mZhYn`):
   - Menerima confirmed ingredients dari backend FastAPI (`input_value`).
2. **Prompt Template** (`Prompt Template-OMNBi`):
   - Menerima variabel `{ingredients}` dari Chat Input.
   - Menegakkan format JSON ketat (root `recommendations`), bahasa Indonesia alami, pemisahan `bahan_tersedia` vs `bahan_tambahan`, dan larangan klaim kesehatan/keamanan pangan absolut.
3. **Google Generative AI** (`ext:google:GoogleGenerativeAIComponent@official-Gtk78`):
   - Model: Gemini LLM (dikonfigurasi dengan API key dan parameter `temperature: 0.2`).
4. **Chat Output** (`ChatOutput-uj4qo`):
   - Mengalirkan respons rekomendasi JSON kembali ke caller API.

### Integrasi Runtime FastAPI:
- Endpoint FastAPI: `POST /api/recommendations`
- Handler: `app.services.langflow.run_find_meals_flow`
- Response Header: `X-Recommendation-Engine: langflow`, `X-Langflow-Flow-Id: 2e514b81-21d7-49b9-9fae-a981f95a8029`
