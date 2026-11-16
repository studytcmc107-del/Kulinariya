import type { Category, NewRecipe, Recipe, RecipeDraft, RecipeFilter } from "./types.js";
import {
  createRecipeOnServer,
  deleteRecipeOnServer,
  fetchRecipes,
  setFavorite
} from "./api.js";
import { debounce } from "./debounce.js";
import { isCategory } from "./parse.js";
import { deleteRecipe, filterRecipes } from "./recipes.js";
import { withRetry } from "./retry.js";
import { assertNever, errorMessage, type LoadState } from "./state.js";
import {
  searchInput,
  categoryFilter,
  favoritesOnly,
  recipeForm,
  recipeList,
  formMessage,
  retryButton,
  renderMessage,
  renderRecipes
} from "./ui.js";

let state: LoadState = { status: "loading" };

function setState(next: LoadState): void {
  state = next;
  render();
}

function updateRecipes(change: (list: Recipe[]) => Recipe[]): void {
  if (state.status !== "success") return;
  setState({ status: "success", recipes: change(state.recipes) });
}

function getFilter(): RecipeFilter {
  return {
    query: "",
    category: isCategory(categoryFilter.value) ? categoryFilter.value : "Все",
    favoritesOnly: favoritesOnly.checked
  };
}

function render(): void {
  retryButton.hidden = state.status !== "error";

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

let controller: AbortController | undefined;

async function search(): Promise<void> {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  try {
    const recipes = await fetchRecipes(searchInput.value, signal);
    setState({ status: "success", recipes });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    setState({ status: "error", message: errorMessage(error) });
  }
}

searchInput.addEventListener(
  "input",
  debounce(() => void search(), 300)
);
categoryFilter.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);
retryButton.addEventListener("click", () => void init());

recipeList.addEventListener("click", async (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest<HTMLButtonElement>("button[data-action]");
  const id = button?.dataset.id;
  const action = button?.dataset.action;
  if (!id || !action || state.status !== "success") return;

  try {
    if (action === "favorite") {
      const current = state.recipes.find((recipe) => recipe.id === id);
      if (!current) return;

      const updated = await setFavorite(id, !current.favorite);
      updateRecipes((list) =>
        list.map((recipe) => (recipe.id === updated.id ? updated : recipe))
      );
    } else if (action === "delete") {
      await deleteRecipeOnServer(id);
      updateRecipes((list) => deleteRecipe(list, id));
    }
  } catch (error: unknown) {
    formMessage.textContent = `Не удалось выполнить действие: ${errorMessage(error)}`;
  }
});

recipeForm.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();

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
  const category = categoryInput.value;
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
  if (!isCategory(category)) {
    formMessage.textContent = "Выберите категорию из списка.";
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
    category,
    servings,
    cookingTime,
    ingredients,
    instructions
  };
  const newRecipe: NewRecipe = { ...draft, favorite: false };

  try {
    const created = await createRecipeOnServer(newRecipe);
    updateRecipes((list) => [created, ...list]);
    recipeForm.reset();
    formMessage.textContent = "Рецепт добавлен.";
  } catch (error: unknown) {
    formMessage.textContent = `Не удалось сохранить рецепт: ${errorMessage(error)}`;
  }
});

async function init(): Promise<void> {
  setState({ status: "loading" });
  try {
    const recipes = await withRetry(() => fetchRecipes(), 3, 1000);
    setState({ status: "success", recipes });
  } catch (error: unknown) {
    setState({ status: "error", message: errorMessage(error) });
  }
}

void init();
