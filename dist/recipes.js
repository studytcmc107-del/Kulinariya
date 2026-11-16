export function filterRecipes(recipes, filter) {
    const query = filter.query.trim().toLowerCase();
    return recipes.filter((recipe) => {
        const matchesQuery = recipe.title.toLowerCase().includes(query);
        const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
        const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
        return matchesQuery && matchesCategory && matchesFavorite;
    });
}
export function createRecipe(draft) {
    return {
        ...draft,
        id: crypto.randomUUID(),
        favorite: false
    };
}
export function toggleFavorite(recipes, id) {
    return recipes.map((recipe) => recipe.id === id
        ? { ...recipe, favorite: !recipe.favorite }
        : recipe);
}
export function deleteRecipe(recipes, id) {
    return recipes.filter((recipe) => recipe.id !== id);
}
