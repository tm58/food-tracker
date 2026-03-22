const form = document.getElementById("foodForm");
const list = document.getElementById("list");

const API_URL = "https://script.google.com/macros/s/AKfycby61yqgzMhYJ3oWDV4TX2thTgh_QUgTLoJ7bTj9WVyL_tu5ney40qRJdVjLBmpcQHAU/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const person = document.getElementById("person").value;
  const meal = document.getElementById("meal").value;
  const food = document.getElementById("food").value;

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ person, meal, food })
  });

  addToList(person, meal, food);
  form.reset();
});

function addToList(person, meal, food) {
  const li = document.createElement("li");
  li.textContent = `${person} - ${meal}: ${food}`;
  list.appendChild(li);
}
