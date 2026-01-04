/* =========================================================
   GLOBAL STATE
========================================================= */
let currentUser = null;

const ADMIN_NAME = "James";
const ADMIN_CODE = "080512";

/* Temp game results (used between game -> results) */
let tempResult = {
  coins: 0,
  points: 0,
  xp: 0
};

/* Persistent user data */
let users = JSON.parse(localStorage.getItem("users")) || {
  James: { coins: 0, points: 0, xp: 0 },
  Dad: { coins: 0, points: 0, xp: 0 },
  Mum: { coins: 0, points: 0, xp: 0 },
  Nannan: { coins: 0, points: 0, xp: 0 },
  "Grandad Darren": { coins: 0, points: 0, xp: 0 },
  "Grandad Steve": { coins: 0, points: 0, xp: 0 },
  "Grandma Jean": { coins: 0, points: 0, xp: 0 },
  "Uncle Paul": { coins: 0, points: 0, xp: 0 }
};

/* Activity log (records page) */
let activityLog = JSON.parse(localStorage.getItem("activityLog")) || [];

/* =========================================================
   UTILS
========================================================= */
function saveAll() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("activityLog", JSON.stringify(activityLog));
}

function logActivity(text) {
  activityLog.unshift({
    time: new Date().toLocaleString(),
    text
  });
  saveAll();
}

/* =========================================================
   NOTIFICATIONS
========================================================= */
function requestNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

/* =========================================================
   LOGIN LOGIC
========================================================= */
function selectUser(name) {
  if (name === ADMIN_NAME) {
    // Show keypad ONLY for James
    document.getElementById("keypadSection")?.classList.remove("hidden");
    document.getElementById("selectedUserName").innerText = "James (Admin)";
  } else {
    // Instant login for everyone else
    loginSuccess(name);
  }
}

let enteredCode = "";

function pressKey(num) {
  enteredCode += num;
  document.getElementById("codeDisplay").innerText = "*".repeat(enteredCode.length);
}

function clearCode() {
  enteredCode = "";
  document.getElementById("codeDisplay").innerText = "";
}

function submitCode() {
  if (enteredCode === ADMIN_CODE) {
    loginSuccess(ADMIN_NAME);
  } else {
    alert("Wrong code");
    clearCode();
  }
}

function loginSuccess(name) {
  currentUser = name;
  localStorage.setItem("currentUser", name);

  requestNotifications();

  logActivity(`${name} logged in`);
  location.href = "hub.html";
}

/* =========================================================
   HUB
========================================================= */
function loadHub() {
  currentUser = localStorage.getItem("currentUser");
  if (!currentUser) location.href = "index.html";

  document.getElementById("welcomeUser").innerText = currentUser;

  // Hide admin-only buttons
  if (currentUser !== ADMIN_NAME) {
    document.getElementById("adminBtn")?.classList.add("hidden");
    document.getElementById("recordsBtn")?.classList.add("hidden");
  }
}

function go(page) {
  location.href = page;
}

/* =========================================================
   GAME LOGIC
========================================================= */
let gameTime = 60;
let gameInterval = null;
let spawnInterval = null;

function startGame() {
  tempResult = { coins: 0, points: 0, xp: 0 };
  gameTime = 60;

  document.getElementById("timer").innerText = gameTime;

  gameInterval = setInterval(() => {
    gameTime--;
    document.getElementById("timer").innerText = gameTime;

    if (gameTime <= 0) endGame();
  }, 1000);

  spawnInterval = setInterval(spawnItem, 700);
}

function randomValue() {
  return [5, 10, 20, 50][Math.floor(Math.random() * 4)];
}

function spawnItem() {
  const gameArea = document.getElementById("gameArea");
  if (!gameArea) return;

  const item = document.createElement("div");
  item.className = "game-item";

  const types = ["coin", "points", "xp", "bomb"];
  const type = types[Math.floor(Math.random() * types.length)];

  let value = randomValue();

  if (type === "coin") item.innerText = "🪙";
  if (type === "points") item.innerText = "⬆️";
  if (type === "xp") item.innerText = "🕓";
  if (type === "bomb") item.innerText = "💣";

  item.style.left = Math.random() * 85 + "%";
  item.style.top = Math.random() * 85 + "%";

  item.onclick = () => {
    if (type === "coin") tempResult.coins += value;
    if (type === "points") tempResult.points += value;
    if (type === "xp") tempResult.xp += value;
    if (type === "bomb") {
      tempResult.coins -= value;
      tempResult.points -= value;
      tempResult.xp -= value;
    }
    item.remove();
  };

  gameArea.appendChild(item);

  setTimeout(() => item.remove(), 1500);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);

  // Apply results to user
  const u = users[currentUser];
  u.coins += tempResult.coins;
  u.points += tempResult.points;
  u.xp += tempResult.xp;

  logActivity(
    `${currentUser} played game: +${tempResult.coins} coins, +${tempResult.points} points, +${tempResult.xp} XP`
  );

  saveAll();
  localStorage.setItem("lastResult", JSON.stringify(tempResult));
  location.href = "results.html";
}

/* =========================================================
   RESULTS PAGE
========================================================= */
function loadResults() {
  const r = JSON.parse(localStorage.getItem("lastResult"));
  if (!r) return;

  document.getElementById("coinsResult").innerText =
    `🪙 Coins Collected: ${r.coins}`;
  document.getElementById("pointsResult").innerText =
    `🎯 Points Earned: ${r.points}`;
  document.getElementById("xpResult").innerText =
    `🌟 XP Gained: ${r.xp}`;
}

/* =========================================================
   RECORDS (ADMIN ONLY)
========================================================= */
function loadRecords() {
  currentUser = localStorage.getItem("currentUser");
  if (currentUser !== ADMIN_NAME) {
    alert("Admin only");
    location.href = "hub.html";
    return;
  }

  const table = document.getElementById("recordsTableBody");
  table.innerHTML = "";

  activityLog.forEach(entry => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${entry.time}</td><td>${entry.text}</td>`;
    table.appendChild(tr);
  });
}

/* =========================================================
   ADMIN PAGE
========================================================= */
function loadAdmin() {
  currentUser = localStorage.getItem("currentUser");
  if (currentUser !== ADMIN_NAME) {
    alert("Admin only");
    location.href = "hub.html";
    return;
  }

  const table = document.getElementById("adminTableBody");
  table.innerHTML = "";

  Object.keys(users).forEach(name => {
    const u = users[name];
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${name}</td>
      <td><input value="${u.coins}" onchange="users['${name}'].coins=this.value"></td>
      <td><input value="${u.points}" onchange="users['${name}'].points=this.value"></td>
      <td><input value="${u.xp}" onchange="users['${name}'].xp=this.value"></td>
    `;

    table.appendChild(tr);
  });
}

function saveAdmin() {
  saveAll();
  alert("Saved");
}
