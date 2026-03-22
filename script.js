const form = document.getElementById("foodForm");
const list = document.getElementById("list");

const API_URL = "TBD_WEB_APP_URL";

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
