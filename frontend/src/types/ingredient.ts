export interface HealthResponse {
  status: string;
  service: string;
  database: string;
}

export interface DetectedIngredientItem {
  name: string;
  confidence: number;
}

export interface Ingredient {
  id: string;
  name: string;
  confidence: number;
}

export interface DetectIngredientsResponse {
  ingredients: DetectedIngredientItem[];
}
