"use strict";

/* ----------------------- USERS ------------------------- */
const USERS = [
  { name: "James", code: "080512", isAdmin:true },
  { name: "Mum", code: "2206", isAdmin:false },
  { name: "Dad", code: "2085", isAdmin:false },
  { name: "Nannan", code: "4213", isAdmin:false },
  { name: "Grandad Darren", code: "8765", isAdmin:false },
  { name: "Grandma Jean", code: "1357", isAdmin:false },
  { name: "Grandad Steve", code: "2468", isAdmin:false },
  { name: "Uncle Paul", code: "1122", isAdmin:false }
];

const storage = window.localStorage;

/* ---------------------- LOCK OVERRIDE ------------------ */
/*
  ON  = locked until date
  OFF = unlocked immediately (ignores timer)
*/
const LOCKED_STATUS = "OFF"; // Change to "ON" to lock
const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00"); // London time

/* ---------------------- LOCK CHECK HELPER ------------------ */
function isLockedNow() {
  if (LOCKED_STATUS === "OFF") return false;
  const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }));
  return now < UNLOCK_DATE;
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

  let selected = null;
  let entered = "";

  grid.innerHTML = USERS.map(u => `<div class="user-card" data-user="${u.name}">${u.name}</div>`).join("");

  document.querySelectorAll(".user-card").forEach(card => {
    card.addEventListener("click", () => {
      selected = USERS.find(u => u.name === card.dataset.user);
      entered = "";
      keypadTitle.textContent = `Enter code for ${selected.name}`;
      display.textContent = "----";
      keypad.classList.remove("hidden");
      profilesCard.classList.add("hidden");
      error.textContent = "";
    });
  });

  function updateDisplay() {
    display.textContent = entered.replace(/./g, "●").padEnd(4, "-");
  }

  document.querySelectorAll(".key-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!selected) return;
      const n = btn.dataset.num;
      const action = btn.dataset.action;

      if (action === "clear") {
        entered = "";
        updateDisplay();
        return;
      }

      if (action === "enter") {
        if (entered === selected.code) {
          storage.setItem("currentUser", selected.name);
          window.location.href = "hub.html";
        } else {
          error.textContent = "Wrong code";
          entered = "";
          updateDisplay();
        }
        return;
      }

      if (n && entered.length < selected.code.length) {
        entered += n;
        updateDisplay();
      }
    });
  });

  back.addEventListener("click", () => {
    keypad.classList.add("hidden");
    profilesCard.classList.remove("hidden");
  });
}

/* ---------------------- HUB PAGE ------------------- */
function initHubPage() {
  const user = storage.getItem("currentUser");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("hubUserName").textContent = user;

  // Init stats
  if (!storage.getItem("userStats")) storage.setItem("userStats", JSON.stringify({}));
  const stats = JSON.parse(storage.getItem("userStats"));
  if (!stats[user]) stats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 };
  storage.setItem("userStats", JSON.stringify(stats));

  function updateStats() {
    const s = JSON.parse(storage.getItem("userStats"))[user];
    document.getElementById("userPoints").textContent = s.points;
    document.getElementById("userCoins").textContent = s.coins;
    document.getElementById("userGamesPlayed").textContent = s.gamesPlayed;
    document.getElementById("userXP").textContent = s.xp;
  }
  updateStats();

  // London clock
  const clock = document.getElementById("londonClock");
  setInterval(() => {
    clock.textContent = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
  }, 1000);

  initHeaderButtons();

  // Unlock timer
  const timerDiv = document.getElementById("unlockTimer");
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");

  function updateUnlockTimer() {
    const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const diff = UNLOCK_DATE - now;
    const locked = LOCKED_STATUS === "ON" && diff > 0;

    if (!locked) {
      btnGame.textContent = "Game";
      btnShop.textContent = "Shop";
      btnGame.disabled = false;
      btnShop.disabled = false;
      if (timerDiv) timerDiv.textContent = "Pages are unlocked!";
      return;
    }

    btnGame.textContent = "Game 🔒";
    btnShop.textContent = "Shop 🔒";
    btnGame.disabled = true;
    btnShop.disabled = true;

    if (timerDiv) {
      let remaining = diff;
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      remaining -= days * 86400000;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      remaining -= hours * 3600000;
      const minutes = Math.floor(remaining / (1000 * 60));
      remaining -= minutes * 60000;
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
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const startBtn = document.getElementById("startGameBtn");
  const gameContainer = document.getElementById("gameContainer");
  const gameTimerDiv = document.getElementById("gameTimer");

  if (!startBtn || !gameContainer || !gameTimerDiv) return;

  startBtn.addEventListener("click", () => {
    if (isLockedNow()) {
      alert("The game is currently locked.");
      return;
    }

    startBtn.disabled = true;

    let timeLeft = 60; // 60 seconds game
    gameTimerDiv.textContent = timeLeft;

    const timer = setInterval(() => {
      timeLeft--;
      gameTimerDiv.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timer);
        alert("Game Over!");
        startBtn.disabled = false;

        // Update user stats
        const stats = JSON.parse(storage.getItem("userStats"));
        if (!stats[user]) stats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 };
        stats[user].gamesPlayed++;
        stats[user].xp += Math.floor(Math.random() * 20) + 10; // random XP reward
        storage.setItem("userStats", JSON.stringify(stats));
      }
    }, 1000);

    // Example: game interaction - click Demogorgons
    gameContainer.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const demon = document.createElement("div");
      demon.className = "demogorgon";
      demon.textContent = "👹";
      demon.style.cursor = "pointer";
      demon.style.display = "inline-block";
      demon.style.margin = "10px";
      demon.style.fontSize = "2rem";
      demon.addEventListener("click", () => {
        const stats = JSON.parse(storage.getItem("userStats"));
        stats[user].xp += 1; // +1 XP per click
        storage.setItem("userStats", JSON.stringify(stats));
        gameTimerDiv.textContent = timeLeft; // update timer visually
      });
      gameContainer.appendChild(demon);
    }
  });
}

/* ---------------------- HEADER BUTTONS ------------------- */
function initHeaderButtons() {
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");
  const btnHub = document.getElementById("btnHub");
  const btnUpside = document.getElementById("btnUpsideDown");
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout) btnLogout.addEventListener("click", () => {
    storage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  if (btnHub) btnHub.addEventListener("click", () => {
    window.location.href = "hub.html";
  });

  if (btnUpside) btnUpside.addEventListener("click", () => {
    window.location.href = "upsidedown.html";
  });

  if (btnGame) btnGame.addEventListener("click", () => {
    if (isLockedNow()) {
      alert("The game is currently locked.");
      return;
    }
    window.location.href = "game.html";
  });

  if (btnShop) btnShop.addEventListener("click", () => {
    if (isLockedNow()) {
      alert("The shop is currently locked.");
      return;
    }
    window.location.href = "shop.html";
  });
}

/* -------------------- BOOT ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "login") initLoginPage();
  if (page === "hub") initHubPage();
  if (page === "game") initGamePage();
});
