"use strict";

/* ----------------------- USERS ------------------------- */ const USERS = [ { name: "James", code: "080512", isAdmin: true }, { name: "Mum", code: "2206", isAdmin: false }, { name: "Dad", code: "2085", isAdmin: false }, { name: "Nannan", code: "4213", isAdmin: false }, { name: "Grandad Darren", code: "8765", isAdmin: false }, { name: "Grandma Jean", code: "1357", isAdmin: false }, { name: "Grandad Steve", code: "2468", isAdmin: false }, { name: "Uncle Paul", code: "1122", isAdmin: false } ];

const storage = window.localStorage; const LOCKED_STATUS = "OFF"; const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00");

function isLockedNow() { if (LOCKED_STATUS === "OFF") return false; const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })); return now < UNLOCK_DATE; }

/* ---------------------- LOGIN PAGE ------------------- */ function initLoginPage() { const grid = document.getElementById("loginProfiles"); const keypad = document.getElementById("keypadSection"); const profilesCard = document.getElementById("profilesCard"); const display = document.getElementById("keypadDisplay"); const keypadTitle = document.getElementById("keypadTitle"); const error = document.getElementById("loginError"); const back = document.getElementById("backToProfiles");

let selected = null; let entered = "";

grid.innerHTML = USERS.map(u => <div class="user-card" data-user="${u.name}">${u.name}</div>).join("");

document.querySelectorAll(".user-card").forEach(card => { card.addEventListener("click", () => { selected = USERS.find(u => u.name === card.dataset.user); entered = ""; keypadTitle.textContent = Enter code for ${selected.name}; display.textContent = "----"; keypad.classList.remove("hidden"); profilesCard.classList.add("hidden"); error.textContent = ""; }); });

function updateDisplay() { display.textContent = entered.replace(/./g, "●").padEnd(selected ? selected.code.length : 4, "-"); }

document.querySelectorAll(".key-btn").forEach(btn => { btn.addEventListener("click", () => { if (!selected) return; const n = btn.dataset.num; const action = btn.dataset.action;

if (action === "clear") { entered = ""; updateDisplay(); return; }
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
  if (n && entered.length < selected.code.length) { entered += n; updateDisplay(); }
});

});

back.addEventListener("click", () => { keypad.classList.add("hidden"); profilesCard.classList.remove("hidden"); }); }

/* ---------------------- HUB PAGE ------------------- */ function initHubPage() { const user = storage.getItem("currentUser"); if (!user) { window.location.href = "index.html"; return; }

document.getElementById("hubUserName").textContent = user;

if (!storage.getItem("userStats")) storage.setItem("userStats", JSON.stringify({})); const allStats = JSON.parse(storage.getItem("userStats")); if (!allStats[user]) allStats[user] = { points: 0, coins: 0, gamesPlayed: 0, xp: 0 }; storage.setItem("userStats", JSON.stringify(allStats));

function updateStats() { const s = JSON.parse(storage.getItem("userStats"))[user]; document.getElementById("userPoints").textContent = s.points; document.getElementById("userCoins").textContent = s.coins; document.getElementById("userGamesPlayed").textContent = s.gamesPlayed; document.getElementById("userXP").textContent = s.xp; } updateStats();

const clock = document.getElementById("londonClock"); setInterval(() => clock.textContent = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }), 1000);

initHeaderButtons();

const timerDiv = document.getElementById("unlockTimer"); const btnGame = document.getElementById("btnGame"); const btnShop = document.getElementById("btnShop");

function updateUnlockTimer() { const now = new Date(new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })); const diff = UNLOCK_DATE - now; const locked = LOCKED_STATUS === "ON" && diff > 0;

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
  const days = Math.floor(remaining / 86400000); remaining -= days * 86400000;
  const hours = Math.floor(remaining / 3600000); remaining -= hours * 3600000;
  const minutes = Math.floor(remaining / 60000); remaining -= minutes * 60000;
  const seconds = Math.floor(remaining / 1000);
  timerDiv.textContent = `Locked until 5th Jan: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

}

updateUnlockTimer(); setInterval(updateUnlockTimer, 1000); }

/* ---------------------- GAME PAGE ------------------- */ function initGamePage() { const user = storage.getItem("currentUser"); if (!user) { window.location.href = "index.html"; return; }

const startBtn = document.getElementById("startGameBtn"); const gameContainer = document.getElementById("gameContainer"); const timerEl = document.getElementById("gameTimer");

const bombCount = document.getElementById("bombCount"); const coinCount = document.getElementById("coinCount"); const clockCount = document.getElementById("clockCount"); const xpCount = document.getElementById("xpCount"); const xpLost = document.getElementById("xpLost"); const itemsMissed = document.getElementById("itemsMissed"); const bonusXP = document.getElementById("bonusXP");

// Back button for game page const backBtn = document.createElement("button"); backBtn.textContent = "⬅ Back to Hub"; backBtn.className = "btn ghost full"; backBtn.style.marginBottom = "1rem"; backBtn.addEventListener("click", () => window.location.href = "hub.html"); gameContainer.parentElement.insertBefore(backBtn, gameContainer);

let timerInterval, timeLeft = 60; let stats = { bombs: 0, coins: 0, clocks: 0, xp: 0, xpLost: 0, itemsMissed: 0, bonusXP: 0 };

function resetGame() { timeLeft = 60; timerEl.textContent = timeLeft; stats = { bombs: 0, coins: 0, clocks: 0, xp: 0, xpLost: 0, itemsMissed: 0, bonusXP: 0 }; updateStats(); gameContainer.innerHTML = ""; }

function updateStats() { if (bombCount) bombCount.textContent = stats.bombs.toString().padStart(2, "0"); if (coinCount) coinCount.textContent = stats.coins.toString().padStart(2, "0"); if (clockCount) clockCount.textContent = stats.clocks.toString().padStart(2, "0"); if (xpCount) xpCount.textContent = stats.xp.toString().padStart(4, "0"); if (xpLost) xpLost.textContent = stats.xpLost.toString().padStart(4, "0"); if (itemsMissed) itemsMissed.textContent = stats.itemsMissed.toString().padStart(2, "0"); if (bonusXP) bonusXP.textContent = stats.bonusXP.toString().padStart(4, "0"); }

function spawnItem() { const items = [ { icon: "💣", type: "bomb", value: -10, xp: -10, color: "red" }, { icon: "🪙", type: "coin", value: 25, xp: 50, color: "green" }, { icon: "🕓", type: "clock", value: 0, xp: Math.random() < 0.5 ? 10 : -10, color: "yellow" } ]; const item = items[Math.floor(Math.random() * items.length)]; const btn = document.createElement("button"); btn.textContent = item.icon; btn.style.position = "relative"; btn.style.fontSize = "2rem"; btn.style.margin = "5px"; btn.style.cursor = "pointer"; gameContainer.appendChild(btn);

let clicked = false;
const timeout = setTimeout(() => { if (!clicked) { stats.itemsMissed++; updateStats(); btn.remove(); } }, 5000);

btn.addEventListener("click", () => {
  if (clicked) return; clicked = true; clearTimeout(timeout);
  if (item.type === "bomb") { stats.bombs++; stats.xpLost += Math.abs(item.xp); showFloatingText(btn, "-" + Math.abs(item.xp), item.color); }
  if (item.type === "coin") { stats.coins++; stats.xp += item.xp; showFloatingText(btn, "+" + item.xp, item.color); }
  if (item.type === "clock") { stats.clocks++; stats.xp += item.xp; showFloatingText(btn, (item.xp>0?"+":"") + item.xp, item.color); }
  updateStats(); btn.remove();
});

}

function showFloatingText(parent, text, color) { const span = document.createElement("span"); span.className = "floating-text"; span.textContent = text; span.style.color = color; span.style.position = "absolute"; span.style.top = "0"; span.style.left = "50%"; span.style.transform = "translateX(-50%)"; span.style.fontWeight = "bold"; span.style.animation = "floatUp 1s ease-out forwards"; parent.appendChild(span); setTimeout(() => span.remove(), 1000); }

function startGame() { resetGame(); startBtn.disabled = true; timerInterval = setInterval(() => { timeLeft--; timerEl.textContent = timeLeft; if (timeLeft <= 0) { clearInterval(timerInterval); alert("Game Over!"); startBtn.disabled = false; const allStats = JSON.parse(storage.getItem("userStats") || "{}"); if (!allStats[user]) allStats[user] = { points:0, coins:0, gamesPlayed:0, xp:0 }; allStats[user].gamesPlayed++; allStats[user].xp += stats.xp; allStats[user].coins = (allStats[user].coins || 0) + stats.coins; storage.setItem("userStats", JSON.stringify(allStats)); } else if (Math.random() < 0.3) { spawnItem(); } }, 1000); }

startBtn.addEventListener("click", () => { if (isLockedNow()) { alert("The game is locked!"); return; } startGame(); }); }

/* ---------------------- SHOP PAGE ------------------- */ function initShopPage() { const shopContainer = document.getElementById("shopItems"); if (shopContainer) { shopContainer.innerHTML = "<div class='shop-item'>Sample Item 🪙</div>"; } // Add back button const backBtn = document.createElement("button"); backBtn.textContent = "⬅ Back to Hub"; backBtn.className = "btn ghost full"; backBtn.style.marginBottom = "1rem"; backBtn.addEventListener("click", () => window.location.href = "hub.html"); shopContainer.parentElement.insertBefore(backBtn, shopContainer); }

/* ---------------------- HEADER BUTTONS ------------------- */ function initHeaderButtons() { const btnGame = document.getElementById("btnGame"); const btnShop = document.getElementById("btnShop"); const btnHub = document.getElementById("btnHub"); const btnUpside = document.getElementById("btnUpsideDown"); const btnLogout = document.getElementById("btnLogout");

if (btnLogout) btnLogout.addEventListener("click", () => { storage.removeItem("currentUser"); window.location.href = "index.html"; }); if (btnHub) btnHub.addEventListener("click", () => window.location.href="hub.html"); if (btnUpside) btnUpside.addEventListener("click", () => window.location.href="upsidedown.html"); if (btnGame) btnGame.addEventListener("click", () => { if (isLockedNow()) { alert("Game locked!"); return; } window.location.href="game.html"; }); if (btnShop) btnShop.addEventListener("click", () => { if (isLockedNow()) { alert("Shop locked!"); return; } window.location.href="shop.html"; }); }

/* -------------------- BOOT ------------------------- */ document.addEventListener("DOMContentLoaded", () => { const page = document.body.dataset.page; if (page === "login") initLoginPage(); if (page === "hub") initHubPage(); if (page === "game") initGamePage(); if (page === "shop") initShopPage(); });
