"use strict";

/* ---------------------- USERS ---------------------- */
const USERS = [
  { name: "James", code: "080512", isAdmin: true },
  { name: "Mum", code: "2206", isAdmin: false },
  { name: "Dad", code: "2085", isAdmin: false },
  { name: "Nannan", code: "4213", isAdmin: false },
  { name: "Grandad Darren", code: "8765", isAdmin: false },
  { name: "Grandma Jean", code: "1357", isAdmin: false },
  { name: "Grandad Steve", code: "2468", isAdmin: false },
  { name: "Uncle Paul", code: "1122", isAdmin: false }
];

/* ------------------- STORAGE & LOCKS ------------------ */
const storage = window.localStorage;
const LOCKED_STATUS = "OFF";
const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00");

/* ------------------ UTILITY FUNCTIONS ----------------- */
function isLockedNow() {
  if (LOCKED_STATUS === "OFF") return false;
  const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }));
  return now < UNLOCK_DATE;
}

function isDoubleTime() {
  const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }));
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  return month === 1 && day >= 5 && day <= 31 && hour >= 15 && hour < 17;
}

/* ---------------------- LOGIN PAGE ------------------- */
function initLoginPage() {
  const grid = document.getElementById("loginProfiles");
  const keypad = document.getElementById("keypadSection");
  const profilesCard = document.getElementById("profilesCard");
  const display = document.getElementById("keypadDisplay");
  const keypadTitle = document.getElementById("keypadTitle");
  const error = document.getElementById("loginError");
  const back = document.getElementById("backToProfiles");

  if (!grid) return;

  let selectedUser = null;
  let enteredCode = "";

  // Render profiles
  grid.innerHTML = "";
  USERS.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.textContent = user.name;
    div.dataset.user = user.name;
    div.addEventListener("click", () => {
      selectedUser = user;
      enteredCode = "";
      keypadTitle.textContent = `Enter code for ${selectedUser.name}`;
      display.textContent = "----";
      keypad.classList.remove("hidden");
      profilesCard.classList.add("hidden");
      error.textContent = "";
    });
    grid.appendChild(div);
  });

  function updateDisplay() {
    if (!selectedUser) return;
    display.textContent = enteredCode
      .replace(/./g, "●")
      .padEnd(selectedUser.code.length, "-");
  }

  document.querySelectorAll(".key-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!selectedUser) return;
      const num = btn.dataset.num;
      const action = btn.dataset.action;

      if (action === "clear") {
        enteredCode = "";
        updateDisplay();
        return;
      }
      if (action === "enter") {
        if (enteredCode === selectedUser.code) {
          storage.setItem("currentUser", selectedUser.name);
          window.location.href = "hub.html";
        } else {
          error.textContent = "Wrong code";
          enteredCode = "";
          updateDisplay();
        }
        return;
      }
      if (num && enteredCode.length < selectedUser.code.length) {
        enteredCode += num;
        updateDisplay();
      }
    });
  });

  back.addEventListener("click", () => {
    keypad.classList.add("hidden");
    profilesCard.classList.remove("hidden");
    enteredCode = "";
    selectedUser = null;
    updateDisplay();
    error.textContent = "";
  });
}

/* ---------------------- HUB PAGE ------------------- */
function initHubPage() {
  const user = storage.getItem("currentUser");
  if (!user) { window.location.href = "index.html"; return; }

  document.getElementById("hubUserName").textContent = user;

  if (!storage.getItem("userStats")) storage.setItem("userStats", JSON.stringify({}));
  const allStats = JSON.parse(storage.getItem("userStats"));
  if (!allStats[user]) allStats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 };
  storage.setItem("userStats", JSON.stringify(allStats));

  function updateStats() {
    const s = JSON.parse(storage.getItem("userStats"))[user];
    document.getElementById("userPoints").textContent = s.points;
    document.getElementById("userCoins").textContent = s.coins;
    document.getElementById("userGamesPlayed").textContent = s.gamesPlayed;
    document.getElementById("userXP").textContent = s.xp;
  }
  updateStats();

  const clock = document.getElementById("londonClock");
  if (clock) setInterval(() => clock.textContent = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }), 1000);

  initHeaderButtons();

  const timerDiv = document.getElementById("unlockTimer");
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");

  function updateUnlockTimer() {
    const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const diff = UNLOCK_DATE - now;
    const locked = LOCKED_STATUS === "ON" && diff > 0;

    if (!locked) {
      if (btnGame) { btnGame.textContent = "Game"; btnGame.disabled = false; }
      if (btnShop) { btnShop.textContent = "Shop"; btnShop.disabled = false; }
      if (timerDiv) timerDiv.textContent = "Pages are unlocked!";
      return;
    }

    if (btnGame) { btnGame.textContent = "Game 🔒"; btnGame.disabled = true; }
    if (btnShop) { btnShop.textContent = "Shop 🔒"; btnShop.disabled = true; }

    if (timerDiv) {
      let remaining = diff;
      const days = Math.floor(remaining / 86400000); remaining -= days * 86400000;
      const hours = Math.floor(remaining / 3600000); remaining -= hours * 3600000;
      const minutes = Math.floor(remaining / 60000); remaining -= minutes * 60000;
      const seconds = Math.floor(remaining / 1000);
      timerDiv.textContent = `Locked until 5th Jan: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  updateUnlockTimer();
  setInterval(updateUnlockTimer, 1000);
}

/* ---------------------- GAME PAGE ------------------- */
function initGamePage() {
  const user = storage.getItem("currentUser");
  if (!user) { window.location.href = "index.html"; return; }

  const startBtn = document.getElementById("startGameBtn");
  const gameContainer = document.getElementById("gameContainer");
  const timerEl = document.getElementById("gameTimer");
  const bombCount = document.getElementById("bombCount");
  const coinCount = document.getElementById("coinCount");
  const clockCount = document.getElementById("clockCount");
  const xpCount = document.getElementById("xpCount");
  const xpLost = document.getElementById("xpLost");
  const itemsMissed = document.getElementById("itemsMissed");
  const bonusXP = document.getElementById("bonusXP");

  let timerInterval, timeLeft = 60;
  let stats = { bombs: 0, coins: 0, clocks: 0, xp: 0, xpLost: 0, itemsMissed: 0, bonusXP: 0 };

  function resetGame() {
    timeLeft = 60;
    timerEl.textContent = timeLeft;
    stats = { bombs: 0, coins: 0, clocks: 0, xp: 0, xpLost: 0, itemsMissed: 0, bonusXP: 0 };
    updateStatsDisplay();
    gameContainer.innerHTML = "";
  }

  function updateStatsDisplay() {
    bombCount.textContent = stats.bombs.toString().padStart(2, "0");
    coinCount.textContent = stats.coins.toString().padStart(2, "0");
    clockCount.textContent = stats.clocks.toString().padStart(2, "0");
    xpCount.textContent = stats.xp.toString().padStart(4, "0");
    xpLost.textContent = stats.xpLost.toString().padStart(4, "0");
    itemsMissed.textContent = stats.itemsMissed.toString().padStart(2, "0");
    bonusXP.textContent = stats.bonusXP.toString().padStart(4, "0");
  }

  function spawnItem() {
    const items = [
      { icon: "💣", type: "bomb", value: -10, xp: -10, color: "red" },
      { icon: "🪙", type: "coin", value: 25, xp: 50, color: "green" },
      { icon: "🕓", type: "clock", value: 0, xp: Math.random() < 0.5 ? 10 : -10, color: "yellow" }
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    const btn = document.createElement("button");
    btn.textContent = item.icon;
    btn.style.position = "relative";
    btn.style.fontSize = "2rem";
    btn.style.margin = "5px";
    btn.style.cursor = "pointer";
    gameContainer.appendChild(btn);

    const multiplier = isDoubleTime() ? 2 : 1;

    let clicked = false;
    const timeout = setTimeout(() => {
      if (!clicked) { stats.itemsMissed++; updateStatsDisplay(); btn.remove(); }
    }, 5000);

    btn.addEventListener("click", () => {
      if (clicked) return;
      clicked = true; clearTimeout(timeout);

      if (item.type === "bomb") {
        stats.bombs++; stats.xpLost += Math.abs(item.xp) * multiplier;
        showFloatingText(btn, "-" + Math.abs(item.xp) * multiplier, item.color);
      }
      if (item.type === "coin") {
        stats.coins++; stats.xp += item.xp * multiplier;
        showFloatingText(btn, "+" + item.xp * multiplier, item.color);
      }
      if (item.type === "clock") {
        stats.clocks++; stats.xp += item.xp * multiplier;
        showFloatingText(btn, (item.xp > 0 ? "+" : "") + item.xp * multiplier, item.color);
      }

      updateStatsDisplay();
      btn.remove();
    });
  }

  function showFloatingText(parent, text, color) {
    const span = document.createElement("span");
    span.className = "floating-text";
    span.textContent = text;
    span.style.color = color;
    span.style.position = "absolute";
    span.style.top = "0";
    span.style.left = "50%";
    span.style.transform = "translateX(-50%)";
    span.style.fontWeight = "bold";
    span.style.animation = "floatUp 1s ease-out forwards";
    parent.appendChild(span);
    setTimeout(() => span.remove(), 1000);
  }

  function startGame() {
    resetGame();
    startBtn.disabled = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;

      const spawnCount = Math.floor(Math.random() * 3) + 1; // spawn 1-3 items per second
      for (let i = 0; i < spawnCount; i++) spawnItem();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert("Game Over!");
        startBtn.disabled = false;
        const allStats = JSON.parse(storage.getItem("userStats") || "{}");
        if (!allStats[user]) allStats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 };
        allStats[user].gamesPlayed++;
        allStats[user].xp += stats.xp;
        allStats[user].coins = (allStats[user].coins || 0) + stats.coins;
        storage.setItem("userStats", JSON.stringify(allStats));
      }
    }, 1000);
  }

  startBtn.addEventListener("click", () => {
    if (isLockedNow()) { alert("The game is locked!"); return; }
    startGame();
  });
}

/* ---------------------- SHOP PAGE ------------------- */
function initShopPage() {
  const user = storage.getItem("currentUser");
  if (!user) { window.location.href = "index.html"; return; }

  const shopContainer = document.getElementById("shopContainer");
  const coinDisplay = document.getElementById("shopCoins");
  const backBtn = document.getElementById("backToHub");

  if (!shopContainer || !coinDisplay || !backBtn) return;

  const allStats = JSON.parse(storage.getItem("userStats") || "{}");
  if (!allStats[user]) allStats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 };
  storage.setItem("userStats", JSON.stringify(allStats));

  function updateCoins() {
    const coins = JSON.parse(storage.getItem("userStats"))[user].coins;
    coinDisplay.textContent = coins;
  }

  updateCoins();

  const shopItems = [
    { name: "Extra Life", price: 100 },
    { name: "Double Coins", price: 200 },
    { name: "XP Boost", price: 150 }
  ];

  shopContainer.innerHTML = "";
  shopItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-price">${item.price} coins</span>
      <button class="buy-btn">Buy</button>
    `;
    const btn = div.querySelector(".buy-btn");
    btn.addEventListener("click", () => {
      const stats = JSON.parse(storage.getItem("userStats"));
      const coins = stats[user].coins;
      if (coins >= item.price) {
        stats[user].coins -= item.price;
        storage.setItem("userStats", JSON.stringify(stats));
        alert(`Purchased ${item.name}!`);
        updateCoins();
      } else {
        alert("Not enough coins!");
      }
    });
    shopContainer.appendChild(div);
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "hub.html";
  });
}

/* ------------------ HEADER BUTTONS ------------------ */
function initHeaderButtons() {
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");
  const btnHub = document.getElementById("btnHub");
  const btnUpside = document.getElementById("btnUpsideDown");
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout) btnLogout.addEventListener("click", () => { storage.removeItem("currentUser"); window.location.href = "index.html"; });
  if (btnHub) btnHub.addEventListener("click", () => window.location.href = "hub.html");
  if (btnUpside) btnUpside.addEventListener("click", () => window.location.href = "upsidedown.html");
  if (btnGame) btnGame.addEventListener("click", () => { if (isLockedNow()) { alert("Game locked!"); return; } window.location.href = "game.html"; });
  if (btnShop) btnShop.addEventListener("click", () => { if (isLockedNow()) { alert("Shop locked!"); return; } window.location.href = "shop.html"; });
}

/* ---------------------- BOOT ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "login") initLoginPage();
  if (page === "hub") initHubPage();
  if (page === "game") initGamePage();
  if (page === "shop") initShopPage();
});
