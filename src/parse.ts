import type { Recipe } from "./types.js";

function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.category === "string" &&
    typeof item.servings === "number" &&
    typeof item.cookingTime === "number" &&
    Array.isArray(item.ingredients) &&
    item.ingredients.every((x: unknown) => typeof x === "string") &&
    typeof item.instructions === "string" &&
    typeof item.favorite === "boolean"
  );
}

export function parseRecipes(data: unknown): Recipe[] {
  if (!Array.isArray(data) || !data.every(isRecipe)) {
    throw new Error("Сервер вернул данные неожиданного формата");
  }
  return data;
}
