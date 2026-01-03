/*************************
  CONFIG
**************************/
const ADMIN_NAME = "James";

const MEMBERS = [
  "Dad",
  "Grandad Darren",
  "Grandad Steve",
  "Grandma Jean",
  "James",
  "Mum",
  "Nannan",
  "Uncle Paul"
];

const USER_CODES = {
  "James": "080512",
  "Nannan": "4213",
  "Mum": "2206",
  "Grandma Jean": "1357",
  "Dad": "2085",
  "Grandad Steve": "2468",
  "Uncle Paul": "1122",
  "Grandad Darren": "8765"
};

/*************************
  GLOBAL STATE
**************************/
const store = {
  users: JSON.parse(localStorage.getItem("users")) || {},
  currentUser: localStorage.getItem("currentUser") || null,
  settings: JSON.parse(localStorage.getItem("settings")) || {
    onePlayOnly: true,
    gameLocked: false,
    shopLocked: false
  },
  activityLog: JSON.parse(localStorage.getItem("activityLog")) || [],
  tempResult: JSON.parse(localStorage.getItem("tempResult")) || null
};

function saveAll() {
  localStorage.setItem("users", JSON.stringify(store.users));
  localStorage.setItem("settings", JSON.stringify(store.settings));
  localStorage.setItem("activityLog", JSON.stringify(store.activityLog));
  localStorage.setItem("tempResult", JSON.stringify(store.tempResult));
}

/*************************
  ACTIVITY LOGGING
**************************/
function logActivity(type, detail = "") {
  store.activityLog.push({
    user: store.currentUser || "system",
    type,
    detail,
    time: new Date().toISOString()
  });
  saveAll();
}

/*************************
  INIT USERS (ONCE)
**************************/
MEMBERS.forEach(name => {
  if (!store.users[name]) {
    store.users[name] = {
      coins: 0,
      points: 0,
      xp: 0,
      gamesPlayed: 0
    };
  }
});
saveAll();

/*************************
  AUTH
**************************/
function requireLogin() {
  if (!store.currentUser) location.href = "index.html";
}

function requireAdmin() {
  requireLogin();
  if (store.currentUser !== ADMIN_NAME) {
    alert("Admins only");
    location.href = "hub.html";
  }
}

/*************************
  NAVIGATION (GLOBAL)
**************************/
function go(page) {
  location.href = page;
}

/*************************
  LOGIN
**************************/
function loadLogin() {
  const profiles = document.getElementById("loginProfiles");
  const keypad = document.getElementById("keypadSection");
  const display = document.getElementById("keypadDisplay");
  const error = document.getElementById("loginError");

  profiles.innerHTML = "";
  keypad.classList.add("hidden");

  MEMBERS.forEach(name => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.textContent = name;
    card.onclick = () => {
      store.tempUser = name;
      profiles.classList.add("hidden");
      keypad.classList.remove("hidden");
      display.textContent = "--------";
    };
    profiles.appendChild(card);
  });

  let code = "";

  document.querySelectorAll(".key-btn").forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.num && code.length < 8) {
        code += btn.dataset.num;
      }

      if (btn.dataset.action === "clear") {
        code = "";
      }

      if (btn.dataset.action === "enter") {
        if (USER_CODES[store.tempUser] === code) {
          store.currentUser = store.tempUser;
          localStorage.setItem("currentUser", store.currentUser);
          logActivity("login", "User logged in");
          location.href = "hub.html";
        } else {
          error.textContent = "Wrong code";
        }
        code = "";
      }

      display.textContent = code.padEnd(8, "-");
    };
  });

  document.getElementById("backToProfiles").onclick = () => {
    keypad.classList.add("hidden");
    profiles.classList.remove("hidden");
    code = "";
    error.textContent = "";
  };
}

/*************************
  HUB
**************************/
function loadHub() {
  requireLogin();
  const u = store.users[store.currentUser];

  document.getElementById("hubUserName").textContent = store.currentUser;
  document.getElementById("userCoins").textContent = u.coins;
  document.getElementById("userPoints").textContent = u.points;
  document.getElementById("userXP").textContent = u.xp;
  document.getElementById("userGamesPlayed").textContent = u.gamesPlayed;
}

/*************************
  GAME (NO STAT CHANGES)
**************************/
function loadGame() {
  requireLogin();

  if (store.settings.gameLocked) {
    alert("Game locked by admin");
    location.href = "hub.html";
    return;
  }

  const status = document.getElementById("gameStatus");
  const btn = document.getElementById("startGameBtn");

  status.textContent = "Ready to play";

  btn.onclick = () => {
    status.textContent = "Game in progress...";
    btn.disabled = true;

    logActivity("game-start", "Started game");

    // Simulate 60-second gameplay and dynamic rewards
    setTimeout(() => {
      const u = store.users[store.currentUser];

      // Example: dynamically calculate rewards from game session
      const coinsEarned = Math.floor(Math.random() * 50) + 10;   // 10–59 coins
      const pointsEarned = Math.floor(Math.random() * 20) + 5;   // 5–24 points
      const xpEarned = Math.floor(Math.random() * 30) + 10;      // 10–39 XP

      // Save temporary results for results page
      store.tempResult = {
        coins: coinsEarned,
        points: pointsEarned,
        xp: xpEarned
      };
      saveAll();

      // Update user stats
      u.coins += coinsEarned;
      u.points += pointsEarned;
      u.xp += xpEarned;
      u.gamesPlayed += 1;

      saveAll();
      logActivity("game-finish", `Finished game. Coins: ${coinsEarned}, Points: ${pointsEarned}, XP: ${xpEarned}`);

      location.href = "results.html";
    }, 60000); // 60 seconds
  };
}

/*************************
  SHOP (REQUEST ONLY)
**************************/
function loadShop() {
  requireLogin();

  if (store.settings.shopLocked) {
    alert("Shop locked by admin");
    location.href = "hub.html";
    return;
  }

  document.getElementById("shopCoins").textContent =
    store.users[store.currentUser].coins;

  document.querySelectorAll(".request-buy-btn").forEach(btn => {
    btn.onclick = () => {
      logActivity("shop-request", btn.dataset.item);
      alert("Request sent");
    };
  });
}

/*************************
  RESULTS
**************************/
function loadResults() {
  requireLogin();

  const title = document.getElementById("resultTitle");
  const msg = document.getElementById("resultMessage");

  title.textContent = "Well done!";
  msg.textContent = "Your results have been recorded. Please tell James your score.";

  // Get the results from the last game session
  const result = store.tempResult || { coins: 0, points: 0, xp: 0 };

  // Update the results dynamically in the page
  document.getElementById("coinsResult").textContent = `✅ Coins Collected: ${result.coins}`;
  document.getElementById("pointsResult").textContent = `🎯 Points Earned: ${result.points}`;
  document.getElementById("xpResult").textContent = `🌟 XP Gained: ${result.xp}`;

  // Clear temporary results after displaying
  store.tempResult = null;
  saveAll();
}

/*************************
  RECORDS (ADMIN)
**************************/
function loadRecords() {
  requireAdmin();

  const body = document.querySelector("#recordsTable tbody");
  body.innerHTML = "";

  store.activityLog.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.user}</td>
      <td>${r.type}</td>
      <td>${r.detail}</td>
      <td>${new Date(r.time).toLocaleString()}</td>
    `;
    body.appendChild(tr);
  });
}

/*************************
  ADMIN
**************************/
function loadAdmin() {
  requireAdmin();

  document.getElementById("toggleGamePlay").checked =
    store.settings.onePlayOnly;
  document.getElementById("toggleGameLock").checked =
    store.settings.gameLocked;
  document.getElementById("toggleShopLock").checked =
    store.settings.shopLocked;

  document.getElementById("toggleGamePlay").onchange = e => {
    store.settings.onePlayOnly = e.target.checked;
    logActivity("admin-setting", "One play only toggled");
    saveAll();
  };

  document.getElementById("toggleGameLock").onchange = e => {
    store.settings.gameLocked = e.target.checked;
    logActivity("admin-setting", "Game lock toggled");
    saveAll();
  };

  document.getElementById("toggleShopLock").onchange = e => {
    store.settings.shopLocked = e.target.checked;
    logActivity("admin-setting", "Shop lock toggled");
    saveAll();
  };

  const body = document.querySelector("#userStatsTable tbody");
  body.innerHTML = "";

  Object.entries(store.users).forEach(([name, u]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td><input type="number" value="${u.coins}"></td>
      <td><input type="number" value="${u.points}"></td>
      <td><input type="number" value="${u.xp}"></td>
      <td><input type="number" value="${u.gamesPlayed}"></td>
    `;

    const inputs = tr.querySelectorAll("input");
    inputs[0].onchange = e => (u.coins = +e.target.value);
    inputs[1].onchange = e => (u.points = +e.target.value);
    inputs[2].onchange = e => (u.xp = +e.target.value);
    inputs[3].onchange = e => (u.gamesPlayed = +e.target.value);

    inputs.forEach(i => {
      i.onchange = () => {
        logActivity("admin-edit", `${name} stats changed`);
        saveAll();
      };
    });

    body.appendChild(tr);
  });
}

/*************************
  ROUTER
**************************/
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "login") loadLogin();
  if (page === "hub") loadHub();
  if (page === "game") loadGame();
  if (page === "shop") loadShop();
  if (page === "records") loadRecords();
  if (page === "admin") loadAdmin();
  if (page === "results") loadResults();
});
