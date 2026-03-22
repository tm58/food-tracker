document.addEventListener("DOMContentLoaded", () => {
  loadToday();
  document.getElementById("loadHistory").addEventListener("click", loadHistory);
});

const API_URL = "https://script.google.com/macros/s/AKfycbxvpvbBIEz9N3NuZZsceh338EqSDLF5SEDaMOumL4WjGhX5WsA1-1boD3PKMfUfzdQD/exec";


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

async function loadHistory() {
  console.log("History buttong clicked");
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("Data fetched");
    console.log(data);

    const list = document.getElementById("list");
    list.innerHTML = "";

    // Step 1: Group by date
    const grouped = {};

    data.forEach(entry => {
  const date = new Date(entry.Date).toLocaleDateString();

  // 🔥 handle both Meal / meal
  const meal = entry.Meal || entry.meal;
  const person = entry.Person || entry.person;
  const food = entry.Food || entry.food;

  if (!grouped[date]) {
    grouped[date] = {
      "Person 1": {},
      "Person 2": {}
    };
  }

  if (!grouped[date][person][meal]) {
    grouped[date][person][meal] = [];
  }

  grouped[date][person][meal].push({
    id: entry.ID,
    food: food
  });
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

      p1.innerHTML = `<strong>Person 1</strong><br>`;
      p1.appendChild(formatPersonData(grouped[date]["Person 1"]));

      p2.innerHTML = `<strong>Person 2</strong><br>`;
      p2.appendChild(formatPersonData(grouped[date]["Person 2"]));

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

function formatPersonData(personData) {
  const container = document.createElement("div");

  const meals = Object.keys(personData);

  if (meals.length === 0) {
    container.textContent = "No entries";
    return container;
  }

  meals.forEach(meal => {
    const mealTitle = document.createElement("strong");
    mealTitle.textContent = meal;
    container.appendChild(mealTitle);
    container.appendChild(document.createElement("br"));

    personData[meal].forEach(entry => {
      const row = document.createElement("div");

      // Input
      const input = document.createElement("input");
      input.value = entry.food;

      input.addEventListener("blur", () => {
        editEntry(entry.id, input.value);
      });

      // Delete button
      const btn = document.createElement("button");
      btn.textContent = "❌";

      btn.addEventListener("click", () => {
        deleteEntry(entry.id);
      });

      row.appendChild(input);
      row.appendChild(btn);

      container.appendChild(row);
    });

    container.appendChild(document.createElement("br"));
  });

  return container;
}

async function loadToday() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const today = new Date().toDateString();

    const todayData = {
      "Person 1": [],
      "Person 2": []
    };

    data.forEach(entry => {
      const entryDate = new Date(entry.Date).toDateString();

      if (entryDate === today) {
        todayData[entry.Person].push(
          `${entry.Meal}: ${entry.Food}`
        );
      }
    });

    renderToday(todayData, today);

  } catch (err) {
    console.error("Error loading today data:", err);
  }
}

function renderToday(data, date) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const container = document.createElement("div");
  container.className = "card";

  const title = document.createElement("h3");
  title.textContent = "Today • " + date;

  const row = document.createElement("div");
  row.className = "row";

  const p1 = document.createElement("div");
  p1.className = "column";

  const p2 = document.createElement("div");
  p2.className = "column";

  p1.innerHTML = `<h4>Person 1</h4>` +
    (data["Person 1"].join("<br>") || "No entries");

  p2.innerHTML = `<h4>Person 2</h4>` +
    (data["Person 2"].join("<br>") || "No entries");

  row.appendChild(p1);
  row.appendChild(p2);

  container.appendChild(title);
  container.appendChild(row);

  list.appendChild(container);
}

async function deleteEntry(id) {
await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    action: "delete",
    id: id
  })
});

  loadHistory(); // refresh
}

async function editEntry(id, newFood) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "edit",
      id: id,
      food: newFood
    })
  });
  loadHistory();
}
