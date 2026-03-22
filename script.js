

const API_URL = "https://script.google.com/macros/s/AKfycby61yqgzMhYJ3oWDV4TX2thTgh_QUgTLoJ7bTj9WVyL_tu5ney40qRJdVjLBmpcQHAU/exec";


async function addEntry(person, mealId, foodId) {
  const meal = document.getElementById(mealId).value;
  const foodInput = document.getElementById(foodId);
  const food = foodInput.value;

  if (!food) return;

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ person, meal, food })
  });

  addToList(person, meal, food);
  foodInput.value = "";
}

function addToList(person, meal, food) {
  const list = document.getElementById("list");
  const li = document.createElement("li");
  li.textContent = `${person} - ${meal}: ${food}`;
  list.appendChild(li);
}
