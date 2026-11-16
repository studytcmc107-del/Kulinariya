export const CATEGORIES = ["Завтрак", "Обед", "Ужин", "Десерт"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Recipe {
  readonly id: string;
  title: string;
  category: Category;
  servings: number;
  cookingTime: number;
  ingredients: string[];
  instructions: string;
  favorite: boolean;
}

export type RecipeDraft = Omit<Recipe, "id" | "favorite">;
export type NewRecipe = Omit<Recipe, "id">;

export type RecipeFilter = {
  query: string;
  category: Category | "Все";
  favoritesOnly: boolean;
};
