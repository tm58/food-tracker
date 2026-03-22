document.addEventListener("DOMContentLoaded", loadToday);

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

window.onload = () => {
  document.getElementById("loadHistory").addEventListener("click", loadHistory);
};

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

      if (!grouped[date]) {
        grouped[date] = {
          "Person 1": {},
          "Person 2": {}
        };
      }

      if (!grouped[date][entry.Person][entry.Meal]) {
        grouped[date][entry.Person][entry.Meal] = [];
      }

       grouped[date][entry.Person][entry.Meal].push(entry.Food);
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
        formatPersonData(grouped[date]["Person 1"]);

      p2.innerHTML = `<strong>Person 2</strong><br>` +
        formatPersonData(grouped[date]["Person 1"]);

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
  let html = "";

  Object.keys(personData).forEach(meal => {
    html += `<strong>${meal}</strong><br>`;
    personData[meal].forEach(food => {
      html += `- ${food}<br>`;
    });
    html += "<br>";
  });

  return html || "No entries";
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
