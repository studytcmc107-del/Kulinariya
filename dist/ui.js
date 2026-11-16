function requireElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Не найден элемент: ${selector}`);
    }
    return element;
}
export const searchInput = requireElement("#search");
export const categoryFilter = requireElement("#category-filter");
export const favoritesOnly = requireElement("#favorites-only");
export const recipeForm = requireElement("#recipe-form");
export const recipeList = requireElement("#recipe-list");
export const formMessage = requireElement("#form-message");
export const resultsCount = requireElement("#results-count");
export const retryButton = requireElement("#retry-button");
export function renderMessage(text) {
    recipeList.innerHTML = "";
    resultsCount.textContent = "";
    const p = document.createElement("p");
    p.textContent = text;
    recipeList.append(p);
}
export function renderRecipes(recipes) {
    recipeList.replaceChildren();
    resultsCount.textContent = `Найдено рецептов: ${recipes.length}`;
    if (recipes.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Ничего не найдено. Измените фильтр.";
        recipeList.append(empty);
        return;
    }
    for (const recipe of recipes) {
        const card = document.createElement("article");
        card.className = "recipe-card";
        const title = document.createElement("h3");
        title.textContent = recipe.title;
        const meta = document.createElement("p");
        meta.textContent = `${recipe.category} · ${recipe.cookingTime} мин. · ${recipe.servings} порц.`;
        const ingredients = document.createElement("p");
        ingredients.textContent = `Ингредиенты: ${recipe.ingredients.join(", ")}`;
        const instructions = document.createElement("p");
        instructions.textContent = recipe.instructions;
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.dataset.action = "favorite";
        favoriteButton.dataset.id = recipe.id;
        favoriteButton.textContent = recipe.favorite
            ? "★ Убрать из избранного"
            : "☆ В избранное";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = recipe.id;
        deleteButton.textContent = "Удалить";
        card.append(title, meta, ingredients, instructions, favoriteButton, deleteButton);
        recipeList.append(card);
    }
}
