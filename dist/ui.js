function requireElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Не найден элемент: ${selector}`);
    }
    return element;
}
export const searchInput = requireElement("#search");
export const categoryFilter = requireElement("#category-filter");
export const sortBySelect = requireElement("#sort-by");
export const favoritesOnly = requireElement("#favorites-only");
export const fastOnly = requireElement("#fast-only");
export const clearFiltersBtn = requireElement("#clear-filters-btn");
export const recipeForm = requireElement("#recipe-form");
export const editRecipeIdInput = requireElement("#edit-recipe-id");
export const formModeTitle = requireElement(".form-mode-title");
export const formSubmitBtn = requireElement("#form-submit-btn");
export const cancelEditBtn = requireElement("#cancel-edit-btn");
export const recipeList = requireElement("#recipe-list");
export const formMessage = requireElement("#form-message");
export const resultsCount = requireElement("#results-count");
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
export function renderCategoryCounts(recipes) {
    const counts = {
        "Завтрак": 0,
        "Обед": 0,
        "Ужин": 0,
        "Десерт": 0
    };
    for (const r of recipes) {
        if (r.category in counts) {
            counts[r.category]++;
        }
    }
    const select = requireElement("#category-filter");
    const options = select.options;
    for (let i = 0; i < options.length; i++) {
        const val = options[i].value;
        if (val !== "Все") {
            options[i].textContent = `${val} (${counts[val]})`;
        }
    }
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
        if (recipe.imageUrl && isValidUrl(recipe.imageUrl)) {
            const img = document.createElement("img");
            img.src = recipe.imageUrl;
            img.alt = recipe.title;
            img.style.width = "100%";
            img.style.height = "150px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "8px";
            img.style.marginBottom = "10px";
            card.append(img);
        }
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
        favoriteButton.textContent = recipe.favorite ? "★ Из избранного" : "☆ В избранное";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = recipe.id;
        editButton.style.backgroundColor = "#fff9c4";
        editButton.textContent = "Редактировать";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = recipe.id;
        deleteButton.style.backgroundColor = "#ffebee";
        deleteButton.textContent = "Удалить";
        card.append(title, meta, ingredients, instructions, favoriteButton, editButton, deleteButton);
        recipeList.append(card);
    }
}
