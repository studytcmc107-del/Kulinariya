export type Category = "Завтрак" | "Обед" | "Ужин" | "Десерт";

export interface Recipe {
  readonly id: string;
  title: string;
  category: Category;
  servings: number;
  cookingTime: number;
  ingredients: string[];
  instructions: string;
  favorite: boolean;
  imageUrl?: string;
}

export type RecipeDraft = Omit<Recipe, "id" | "favorite">;

export type RecipeFilter = {
  query: string;
  category: Category | "Все";
  favoritesOnly: boolean;
  max30Min: boolean;
  sortBy: "none" | "asc" | "desc";
};
