import type { Category, RecipeDraft, RecipeFilter } from "./types.js";
import { fetchRecipes } from "./api.js";
import { createRecipe, deleteRecipe, filterRecipes, toggleFavorite } from "./recipes.js";
import { assertNever, errorMessage, type LoadState } from "./state.js";
import {
  searchInput,
  categoryFilter,
  favoritesOnly,
  recipeForm,
  recipeList,
  formMessage,
  renderMessage,
  renderRecipes
} from "./ui.js";

let state: LoadState = { status: "loading" };

function setState(next: LoadState): void {
  state = next;
  render();
}

function getFilter(): RecipeFilter {
  return {
    query: searchInput.value,
    category: categoryFilter.value as Category | "Все",
    favoritesOnly: favoritesOnly.checked
  };
}

function render(): void {
  switch (state.status) {
    case "loading":
      renderMessage("Загружаем рецепты...");
      break;
    case "error":
      renderMessage(`Не удалось загрузить: ${state.message}`);
      break;
    case "success":
      renderRecipes(filterRecipes(state.recipes, getFilter()));
      break;
    default:
      assertNever(state);
  }
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);

recipeList.addEventListener("click", (event: MouseEvent) => {
  if (state.status !== "success") return;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  if (!id) return;

  if (action === "favorite") {
    setState({ status: "success", recipes: toggleFavorite(state.recipes, id) });
  } else if (action === "delete") {
    setState({ status: "success", recipes: deleteRecipe(state.recipes, id) });
  }
});

recipeForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();
  if (state.status !== "success") return;

  const titleInput = document.querySelector<HTMLInputElement>("#recipe-title");
  const categoryInput = document.querySelector<HTMLSelectElement>("#recipe-category");
  const servingsInput = document.querySelector<HTMLInputElement>("#recipe-servings");
  const timeInput = document.querySelector<HTMLInputElement>("#recipe-time");
  const ingredientsInput = document.querySelector<HTMLTextAreaElement>("#recipe-ingredients");
  const instructionsInput = document.querySelector<HTMLTextAreaElement>("#recipe-instructions");

  if (!titleInput || !categoryInput || !servingsInput || !timeInput ||
      !ingredientsInput || !instructionsInput) {
    formMessage.textContent = "Ошибка разметки формы.";
    return;
  }

  const title = titleInput.value.trim();
  const servings = Number(servingsInput.value);
  const cookingTime = Number(timeInput.value);
  const ingredients = ingredientsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const instructions = instructionsInput.value.trim();

  if (!title || !instructions || ingredients.length === 0) {
    formMessage.textContent = "Заполните все поля формы.";
    return;
  }
  if (!Number.isFinite(servings) || servings < 1 || servings > 30) {
    formMessage.textContent = "Количество порций должно быть от 1 до 30.";
    return;
  }
  if (!Number.isFinite(cookingTime) || cookingTime < 1 || cookingTime > 600) {
    formMessage.textContent = "Время должно быть от 1 до 600 минут.";
    return;
  }

  const draft: RecipeDraft = {
    title,
    category: categoryInput.value as Category,
    servings,
    cookingTime,
    ingredients,
    instructions
  };

  setState({
    status: "success",
    recipes: [createRecipe(draft), ...state.recipes]
  });

  recipeForm.reset();
  formMessage.textContent = "Рецепт добавлен.";
});

async function init(): Promise<void> {
  setState({ status: "loading" });
  try {
    const recipes = await fetchRecipes();
    setState({ status: "success", recipes });
  } catch (error: unknown) {
    setState({ status: "error", message: errorMessage(error) });
  }
}

void init();
