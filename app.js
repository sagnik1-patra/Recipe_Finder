const API_BASE = "https://www.themealdb.com/api/json/v1/1/";

const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const recipesContainer = document.getElementById('recipes');
const favoritesContainer = document.getElementById('favorites');
const recipeDetailsContainer = document.getElementById('recipeDetails');
const categoryFilter = document.getElementById('categoryFilter');
const cuisineFilter = document.getElementById('cuisineFilter');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function loadFilters() {
  const categoriesRes = await fetch(API_BASE + "list.php?c=list");
  const categories = (await categoriesRes.json()).meals;
  categories.forEach(c => {
    const option = document.createElement('option');
    option.value = c.strCategory;
    option.textContent = c.strCategory;
    categoryFilter.appendChild(option);
  });

  const areasRes = await fetch(API_BASE + "list.php?a=list");
  const areas = (await areasRes.json()).meals;
  areas.forEach(a => {
    const option = document.createElement('option');
    option.value = a.strArea;
    option.textContent = a.strArea;
    cuisineFilter.appendChild(option);
  });
}

async function fetchRecipes(query = "", filterType = "", filterValue = "") {
  let url = API_BASE + "search.php?s=" + query;
  if (filterType === "category") {
    url = API_BASE + "filter.php?c=" + filterValue;
  } else if (filterType === "cuisine") {
    url = API_BASE + "filter.php?a=" + filterValue;
  }

  const res = await fetch(url);
  const data = await res.json();
  displayRecipes(data.meals || []);
}

function displayRecipes(recipes) {
  recipesContainer.innerHTML = recipes.map(recipe => `
    <div class="recipe-card">
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
      <h3>${recipe.strMeal}</h3>
      <button class="favorite-btn ${isFavorite(recipe.idMeal) ? 'active' : ''}" onclick="toggleFavorite('${recipe.idMeal}', '${recipe.strMeal}', '${recipe.strMealThumb}')">❤️</button>
      <button onclick="showRecipeDetails('${recipe.idMeal}')">View Details</button>
    </div>
  `).join('');
}

async function showRecipeDetails(id) {
  const res = await fetch(API_BASE + "lookup.php?i=" + id);
  const meal = (await res.json()).meals[0];

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
    }
  }

  recipeDetailsContainer.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h3>Ingredients:</h3>
    <ul>${ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    <h3>Instructions:</h3>
    <p>${meal.strInstructions}</p>
  `;
}

function toggleFavorite(id, name, img) {
  const exists = favorites.find(f => f.id === id);
  if (exists) {
    favorites = favorites.filter(f => f.id !== id);
  } else {
    favorites.push({ id, name, img });
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
  fetchRecipes(searchInput.value);
}

function isFavorite(id) {
  return favorites.some(f => f.id === id);
}

function displayFavorites() {
  favoritesContainer.innerHTML = favorites.map(fav => `
    <div class="recipe-card">
      <img src="${fav.img}" alt="${fav.name}">
      <h3>${fav.name}</h3>
      <button class="favorite-btn active" onclick="toggleFavorite('${fav.id}', '${fav.name}', '${fav.img}')">❤️</button>
      <button onclick="showRecipeDetails('${fav.id}')">View Details</button>
    </div>
  `).join('');
}

searchBtn.addEventListener('click', () => fetchRecipes(searchInput.value));
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  recipesContainer.innerHTML = '';
  recipeDetailsContainer.innerHTML = '';
});
categoryFilter.addEventListener('change', () => fetchRecipes("", "category", categoryFilter.value));
cuisineFilter.addEventListener('change', () => fetchRecipes("", "cuisine", cuisineFilter.value));

loadFilters();
displayFavorites();
