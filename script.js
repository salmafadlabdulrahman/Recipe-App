const meals = document.getElementById("meals");
const favMealsContainer = document.querySelector(".fav-meals");
const searchField = document.getElementById("search-term");
const search = document.getElementById("search");
const mealPopupContainer = document.getElementById("meal-popup");
const mealInfo = document.getElementById('meal-info')
const closePopup = document.querySelector('.close-popup')

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const response = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const responseData = await response.json();
  const randomMeal = responseData.meals[0];

  displayRandomMeal(randomMeal, true);
}

async function getMealById(id) {
  const respnse = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const responseData = await respnse.json();

  const meal = responseData.meals[0];
  return meal;
}

async function getMealsBySearch(name) {
  const respnse = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
  );
  const responseData = await respnse.json();
  const meals = responseData.meals;
  return meals;
}

function displayRandomMeal(mealData, random = false) {
  const meal = document.createElement("div");

  meal.classList.add("meal");

  meal.innerHTML = `
    <div class="meal-header">
      ${random ? `<span class="random">Random Recipe</span>` : ""}
      <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn">
        <i class="fa-regular fa-heart"></i>
      </button>
    </div>`;

  const btn = meal.querySelector("i");
  btn.addEventListener("click", function (e) {
    if (btn.classList.contains("fa-solid")) {
      removeMealFromLS(mealData.idMeal);
    } else {
      addMealToLS(mealData.idMeal);
    }
    e.target.classList.toggle("fa-solid");

    fetchFavMeals();
  });

  meal.addEventListener('click', function() {
    displayRecipe(mealData)
  })
  meals.appendChild(meal);
}

function addMealToLS(meal) {
  const existingMeals = getMealsFromLS();
  localStorage.setItem("meals", JSON.stringify([...existingMeals, meal]));
}

function getMealsFromLS() {
  const meals = JSON.parse(localStorage.getItem("meals"));
  return meals === null ? [] : meals;
}

function removeMealFromLS(meal) {
  const existingMeals = getMealsFromLS();
  localStorage.setItem(
    "meals",
    JSON.stringify(existingMeals.filter((id) => id !== meal))
  );
}

//This function is to put the favorite meals into the top circles
async function fetchFavMeals() {
  //clean the container and re-display the things again
  favMealsContainer.innerHTML = ``;
  //get the existing meals from the local storage
  const existingMeals = getMealsFromLS();

  //looping through the meals array that we got from the local storage
  for (let i = 0; i < existingMeals.length; i++) {
    const meal = existingMeals[i];

    //with the id's the we got we call this function to get the full object about the meal, and storing the value
    //in a result variable
    const result = await getMealById(meal);

    addMealToFav(result);
  }
}

function addMealToFav(meal) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
  <img
    src="${meal.strMealThumb}"
    alt="${meal.strMeal}"
  /><span>${meal.strMeal}</span>
  <button class="clear"><i class="fa-solid fa-xmark"></i></button>`;

  const deleteBtn = favMeal.querySelector(".clear");

  deleteBtn.addEventListener("click", function () {
    removeMealFromLS(meal.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener('click', function() {
    displayRecipe(meal)
  })

  favMealsContainer.appendChild(favMeal);
}

search.addEventListener("click", async function () {
  meals.innerHTML = ``
  const searchResult = searchField.value;

  const mealsResult = await getMealsBySearch(searchResult);

  if (mealsResult) {
    mealsResult.forEach((meal) => {
      displayRandomMeal(meal);
    });
  }
});

function displayRecipe(mealData) {
  mealInfo.innerHTML = ``
  const mealEl = document.createElement('div')


  const ingredients = []
  //get ingredients and measures and display them 
  for (let i = 1; i <= 20; i++) {
    if (mealData['strIngredient'+ i]) {
      ingredients.push(`${mealData['strIngredient'+ i]} - ${mealData['strMeasure'+ i]}`)
      console.log(ingredients);
    } else {
      break;
    }
  }


  mealEl.innerHTML = `
          <h1>${mealData.strMeal}</h1>
          <div class="recipe-img">
            <img
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
              class="popup-img"
            />
          </div>
          <p class="instructions">
          ${mealData.strInstructions}
          </p>
          <h3>Ingredients: </h3>
          <ul>
            ${ingredients.map(item => `<li>${item}</li>`).join('')}
          </ul>
          
  `
mealInfo.appendChild(mealEl)

  //show the popup
  mealPopupContainer.style.display = 'block'
}

mealPopupContainer.style.display = 'none'
closePopup.addEventListener('click', function() {
  mealPopupContainer.style.display = 'none'
})
