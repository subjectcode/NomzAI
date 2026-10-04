export interface HealthResponse {
  status: string;
  service: string;
  database: string;
}

export interface DetectedIngredientItem {
  name: string;
  confidence: number;
  quantity?: number | string | null;
  unit?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  confidence: number;
  quantity?: number | string | null;
  unit?: string | null;
  notes?: string | null;
  isCountable?: boolean;
}

export interface DetectIngredientsResponse {
  ingredients: DetectedIngredientItem[];
}
