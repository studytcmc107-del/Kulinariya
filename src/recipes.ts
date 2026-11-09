import type { Recipe, RecipeDraft, RecipeFilter } from "./types.js";

export function filterAndSortRecipes(recipes: Recipe[], filter: RecipeFilter): Recipe[] {
  const query = filter.query.trim().toLowerCase();
  
  let result = recipes.filter((recipe) => {
    const matchesQuery = recipe.title.toLowerCase().includes(query);
    const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
    const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
    const matchesTime = !filter.max30Min || recipe.cookingTime <= 30;
    return matchesQuery && matchesCategory && matchesFavorite && matchesTime;
  });

  if (filter.sortBy === "asc") {
    result.sort((a, b) => a.cookingTime - b.cookingTime);
  } else if (filter.sortBy === "desc") {
    result.sort((a, b) => b.cookingTime - a.cookingTime);
  }

  return result;
}

export function createRecipe(draft: RecipeDraft): Recipe {
  return {
    ...draft,
    id: crypto.randomUUID(),
    favorite: false
  };
}

export function updateRecipe(recipes: Recipe[], id: string, changes: Partial<RecipeDraft>): Recipe[] {
  return recipes.map((recipe) => {
    if (recipe.id === id) {
      return {
        ...recipe,
        ...changes,
        ingredients: changes.ingredients ?? recipe.ingredients
      };
    }
    return recipe;
  });
}

export function toggleFavorite(recipes: Recipe[], id: string): Recipe[] {
  return recipes.map((recipe) =>
    recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
  );
}

export function deleteRecipe(recipes: Recipe[], id: string): Recipe[] {
  return recipes.filter((recipe) => recipe.id !== id);
}
