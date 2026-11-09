import type { Category, Recipe, RecipeDraft, RecipeFilter } from "./types.js";
import { initialRecipes } from "./data.js";
import { loadRecipes, saveRecipes } from "./storage.js";
import { createRecipe, deleteRecipe, filterAndSortRecipes, toggleFavorite, updateRecipe } from "./recipes.js";
import {
  searchInput,
  categoryFilter,
  sortBySelect,
  favoritesOnly,
  fastOnly,
  clearFiltersBtn,
  recipeForm,
  editRecipeIdInput,
  formModeTitle,
  formSubmitBtn,
  cancelEditBtn,
  recipeList,
  formMessage,
  renderRecipes,
  renderCategoryCounts
} from "./ui.js";

let recipes: Recipe[] = loadRecipes() ?? initialRecipes;

function getFilter(): RecipeFilter {
  return {
    query: searchInput.value,
    category: categoryFilter.value as Category | "Все",
    favoritesOnly: favoritesOnly.checked,
    max30Min: fastOnly.checked,
    sortBy: sortBySelect.value as "none" | "asc" | "desc"
  };
}

function render(): void {
  renderCategoryCounts(recipes);
  renderRecipes(filterAndSortRecipes(recipes, getFilter()));
}

function persistAndRender(): void {
  saveRecipes(recipes);
  render();
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
sortBySelect.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);
fastOnly.addEventListener("change", render);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "Все";
  sortBySelect.value = "none";
  favoritesOnly.checked = false;
  fastOnly.checked = false;
  render();
});

cancelEditBtn.addEventListener("click", () => {
  recipeForm.reset();
  editRecipeIdInput.value = "";
  formModeTitle.textContent = "Добавить рецепт";
  formSubmitBtn.textContent = "Сохранить рецепт";
  cancelEditBtn.style.display = "none";
});

recipeList.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest<HTMLButtonElement>("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  if (!id) return;

  if (action === "favorite") {
    recipes = toggleFavorite(recipes, id);
    persistAndRender();
  } else if (action === "delete") {
    if (confirm("Вы действительно хотите удалить этот рецепт?")) {
      recipes = deleteRecipe(recipes, id);
      persistAndRender();
    }
  } else if (action === "edit") {
    const targetRecipe = recipes.find((r) => r.id === id);
    if (!targetRecipe) return;

    editRecipeIdInput.value = targetRecipe.id;
    formModeTitle.textContent = "Редактировать рецепт";
    formSubmitBtn.textContent = "Обновить рецепт";
    cancelEditBtn.style.display = "inline-block";

    const titleIn = document.querySelector<HTMLInputElement>("#recipe-title");
    const catIn = document.querySelector<HTMLSelectElement>("#recipe-category");
    const servIn = document.querySelector<HTMLInputElement>("#recipe-servings");
    const timeIn = document.querySelector<HTMLInputElement>("#recipe-time");
    const imgIn = document.querySelector<HTMLInputElement>("#recipe-image");
    const ingIn = document.querySelector<HTMLTextAreaElement>("#recipe-ingredients");
    const instIn = document.querySelector<HTMLTextAreaElement>("#recipe-instructions");

    if (titleIn) titleIn.value = targetRecipe.title;
    if (catIn) catIn.value = targetRecipe.category;
    if (servIn) servIn.value = String(targetRecipe.servings);
    if (timeIn) timeIn.value = String(targetRecipe.cookingTime);
    if (imgIn) imgIn.value = targetRecipe.imageUrl || "";
    if (ingIn) ingIn.value = targetRecipe.ingredients.join(", ");
    if (instIn) instIn.value = targetRecipe.instructions;
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
});

recipeForm.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  const titleInput = document.querySelector<HTMLInputElement>("#recipe-title");
  const categoryInput = document.querySelector<HTMLSelectElement>("#recipe-category");
  const servingsInput = document.querySelector<HTMLInputElement>("#recipe-servings");
  const timeInput = document.querySelector<HTMLInputElement>("#recipe-time");
  const imageInput = document.querySelector<HTMLInputElement>("#recipe-image");
  const ingredientsInput = document.querySelector<HTMLTextAreaElement>("#recipe-ingredients");
  const instructionsInput = document.querySelector<HTMLTextAreaElement>("#recipe-instructions");

  if (!titleInput || !categoryInput || !servingsInput || !timeInput || !imageInput || !ingredientsInput || !instructionsInput) {
    formMessage.textContent = "Ошибка разметки формы.";
    return;
  }

  const title = titleInput.value.trim();
  const servings = Number(servingsInput.value);
  const cookingTime = Number(timeInput.value);
  const imageUrl = imageInput.value.trim();
  const ingredients = ingredientsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const instructions = instructionsInput.value.trim();

  if (!title || !instructions || ingredients.length === 0) {
    formMessage.textContent = "Заполните все обязательные поля формы.";
    return;
  }

  const editId = editRecipeIdInput.value;

  if (editId) {
    const changes: Partial<RecipeDraft> = {
      title,
      category: categoryInput.value as Category,
      servings,
      cookingTime,
      ingredients,
      instructions,
      imageUrl: imageUrl || undefined
    };
    recipes = updateRecipe(recipes, editId, changes);
    editRecipeIdInput.value = "";
    formModeTitle.textContent = "Добавить рецепт";
    formSubmitBtn.textContent = "Сохранить рецепт";
    cancelEditBtn.style.display = "none";
    formMessage.textContent = "Рецепт успешно обновлен.";
  } else {
    const draft: RecipeDraft = {
      title,
      category: categoryInput.value as Category,
      servings,
      cookingTime,
      ingredients,
      instructions,
      imageUrl: imageUrl || undefined
    };
    recipes = [createRecipe(draft), ...recipes];
    formMessage.textContent = "Рецепт добавлен.";
  }

  recipeForm.reset();
  persistAndRender();
});

render();
