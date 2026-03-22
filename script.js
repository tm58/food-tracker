

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

document.getElementById("loadHistory").addEventListener("click", loadHistory);

async function loadHistory() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    // Step 1: Group by date
    const grouped = {};

    data.forEach(entry => {
      const date = new Date(entry.Date).toDateString();

      if (!grouped[date]) {
        grouped[date] = {
          "Person 1": [],
          "Person 2": []
        };
      }

      grouped[date][entry.Person].push(
        `${entry.Meal}: ${entry.Food}`
      );
    });

    // Step 2: Render
    Object.keys(grouped).reverse().forEach(date => {
      const container = document.createElement("div");

      const title = document.createElement("h4");
      title.textContent = date;

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";

      const p1 = document.createElement("div");
      const p2 = document.createElement("div");

      p1.innerHTML = `<strong>Person 1</strong><br>` +
        grouped[date]["Person 1"].join("<br>");

      p2.innerHTML = `<strong>Person 2</strong><br>` +
        grouped[date]["Person 2"].join("<br>");

      row.appendChild(p1);
      row.appendChild(p2);

      container.appendChild(title);
      container.appendChild(row);

      list.appendChild(container);
    });

  } catch (err) {
    console.error("Error loading history:", err);
  }
}
