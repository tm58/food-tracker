document.addEventListener("DOMContentLoaded", () => {
  loadToday();
  document.getElementById("loadHistory").addEventListener("click", loadHistory);
});

const API_URL = "https://script.google.com/macros/s/AKfycbxvpvbBIEz9N3NuZZsceh338EqSDLF5SEDaMOumL4WjGhX5WsA1-1boD3PKMfUfzdQD/exec";

// ➕ Add entry
async function addEntry(person, mealId, foodId) {
  const meal = document.getElementById(mealId).value;
  const foodInput = document.getElementById(foodId);
  const food = foodInput.value;

  if (!food) return;

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ person, meal, food })
  });

  foodInput.value = "";
  loadToday(); // refresh today view
}

// 📜 Load history
async function loadHistory() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    const grouped = {};

    data.forEach(entry => {
      const date = new Date(entry.Date).toLocaleDateString();

      const meal = (entry.Meal || "").trim();
      const person = (entry.Person || "").trim();
      const food = (entry.Food || "").trim();

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

    Object.keys(grouped).reverse().forEach(date => {
      const container = document.createElement("div");

      const title = document.createElement("h4");
      title.textContent = date;

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";

      const p1 = document.createElement("div");
      const p2 = document.createElement("div");

      p1.innerHTML = `<strong>Person 1</strong>`;
      p1.appendChild(formatPersonData(grouped[date]["Person 1"]));

      p2.innerHTML = `<strong>Person 2</strong>`;
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

// 🎨 Format person data (FIXED)
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

    personData[meal].forEach(entry => {
      const row = document.createElement("div");
      row.className = "entry-row";

      // TEXT VIEW
      const text = document.createElement("div");
      text.className = "entry-text";
      text.textContent = entry.food;

      // DELETE
      const btn = document.createElement("button");
      btn.className = "delete-btn";
      btn.textContent = "🗑️";

      btn.addEventListener("click", () => {
        deleteEntry(entry.id);
      });

      // TAP TO EDIT
      text.addEventListener("click", () => {
        const input = document.createElement("input");
        input.className = "entry-input";
        input.value = entry.food;

        row.replaceChild(input, text);
        input.focus();

        input.addEventListener("blur", () => {
          const newValue = input.value.trim();

          if (newValue && newValue !== entry.food) {
            editEntry(entry.id, newValue);
            text.textContent = newValue;
          }

          row.replaceChild(text, input);
        });

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
      });

      row.appendChild(text);
      row.appendChild(btn);
      container.appendChild(row);
    });
  });

  return container;
}

// 📅 Load today
async function loadToday() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const today = new Date().toDateString();

    const todayData = {
      "Person 1": {},
      "Person 2": {}
    };

    data.forEach(entry => {
      const entryDate = new Date(entry.Date).toDateString();

      if (entryDate === today) {
        const person = entry.Person;
        const meal = entry.Meal;
        const food = entry.Food;

        if (!todayData[person][meal]) {
          todayData[person][meal] = [];
        }

        todayData[person][meal].push({
          id: entry.ID,
          food: food
        });
      }
    });

    renderToday(todayData, today);

  } catch (err) {
    console.error("Error loading today data:", err);
  }
}

// 🧾 Render today
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

  p1.innerHTML = `<h4>Person 1</h4>`;
  p1.appendChild(formatPersonData(data["Person 1"]));

  p2.innerHTML = `<h4>Person 2</h4>`;
  p2.appendChild(formatPersonData(data["Person 2"]));

  row.appendChild(p1);
  row.appendChild(p2);

  container.appendChild(title);
  container.appendChild(row);

  list.appendChild(container);
}

// 🗑️ Delete
async function deleteEntry(id) {
  await fetch(`${API_URL}?action=delete&id=${id}`);
  loadHistory();
}

// ✏️ Edit
async function editEntry(id, newFood) {
  const encodedFood = encodeURIComponent(newFood);
  await fetch(`${API_URL}?action=edit&id=${id}&food=${encodedFood}`);
}
