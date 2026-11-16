import type { Recipe, RecipeDraft, RecipeFilter } from "./types.js";

export function filterRecipes(
  recipes: Recipe[],
  filter: RecipeFilter
): Recipe[] {
  const query = filter.query.trim().toLowerCase();

  return recipes.filter((recipe) => {
    const matchesQuery = recipe.title.toLowerCase().includes(query);
    const matchesCategory =
      filter.category === "Все" || recipe.category === filter.category;
    const matchesFavorite =
      !filter.favoritesOnly || recipe.favorite;

    return matchesQuery && matchesCategory && matchesFavorite;
  });
}

export function createRecipe(draft: RecipeDraft): Recipe {
  return {
    ...draft,
    id: crypto.randomUUID(),
    favorite: false
  };
}

export function toggleFavorite(
  recipes: Recipe[],
  id: string
): Recipe[] {
  return recipes.map((recipe) =>
    recipe.id === id
      ? { ...recipe, favorite: !recipe.favorite }
      : recipe
  );
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}
