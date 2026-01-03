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
  currentUser: localStorage.getItem("currentUser"),
  purchaseRequests: JSON.parse(localStorage.getItem("purchaseRequests")) || [],
  settings: JSON.parse(localStorage.getItem("settings")) || {
    onePlayOnly: false,
    gameLocked: false,
    shopLocked: false
  }
};

function saveAll() {
  localStorage.setItem("users", JSON.stringify(store.users));
  localStorage.setItem("purchaseRequests", JSON.stringify(store.purchaseRequests));
  localStorage.setItem("settings", JSON.stringify(store.settings));
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
      if (btn.dataset.num) {
        if (code.length < 8) code += btn.dataset.num;
      }

      if (btn.dataset.action === "clear") code = "";

      if (btn.dataset.action === "enter") {
        if (USER_CODES[store.tempUser] === code) {
          store.currentUser = store.tempUser;
          localStorage.setItem("currentUser", store.currentUser);
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
  GAME
**************************/
function loadGame() {
  requireLogin();

  if (store.settings.gameLocked) {
    alert("Game locked by admin");
    location.href = "hub.html";
    return;
  }

  const u = store.users[store.currentUser];
  const status = document.getElementById("gameStatus");
  const btn = document.getElementById("startGameBtn");

  status.textContent = "Ready to play";

  btn.onclick = () => {
    if (store.settings.onePlayOnly && u.gamesPlayed > 0) {
      alert("You already played");
      return;
    }

    status.textContent = "Playing...";
    btn.disabled = true;

    setTimeout(() => {
      u.gamesPlayed++;
      u.xp += 25;
      u.coins += 15;
      u.points += 5;
      saveAll();

      status.textContent = "Game finished!";
      btn.disabled = false;
    }, 3000);
  };
}

/*************************
  SHOP
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
      store.purchaseRequests.push({
        user: store.currentUser,
        item: btn.dataset.item,
        price: Number(btn.dataset.price),
        status: "pending"
      });
      saveAll();
      alert("Request sent");
    };
  });
}

/*************************
  RECORDS
**************************/
function loadRecords() {
  requireAdmin();
  const body = document.querySelector("#purchaseRequestsTable tbody");
  body.innerHTML = "";

  store.purchaseRequests.forEach((r, i) => {
    if (r.status !== "pending") return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.user}</td>
      <td>${r.item}</td>
      <td>${r.price}</td>
      <td><button>Approve</button></td>
    `;
    tr.querySelector("button").onclick = () => approvePurchase(i);
    body.appendChild(tr);
  });
}

function approvePurchase(i) {
  const r = store.purchaseRequests[i];
  const u = store.users[r.user];

  if (u.coins < r.price) {
    alert("Not enough coins");
    return;
  }

  u.coins -= r.price;
  r.status = "approved";
  saveAll();
  loadRecords();
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
    saveAll();
  };

  document.getElementById("toggleGameLock").onchange = e => {
    store.settings.gameLocked = e.target.checked;
    saveAll();
  };

  document.getElementById("toggleShopLock").onchange = e => {
    store.settings.shopLocked = e.target.checked;
    saveAll();
  };

  const body = document.querySelector("#userStatsTable tbody");
  body.innerHTML = "";

  Object.entries(store.users).forEach(([name, u]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td><input value="${u.coins}"></td>
      <td><input value="${u.points}"></td>
      <td><input value="${u.xp}"></td>
      <td><input value="${u.gamesPlayed}"></td>
    `;

    const inputs = tr.querySelectorAll("input");
    inputs[0].onchange = e => (u.coins = +e.target.value);
    inputs[1].onchange = e => (u.points = +e.target.value);
    inputs[2].onchange = e => (u.xp = +e.target.value);
    inputs[3].onchange = e => (u.gamesPlayed = +e.target.value);

    body.appendChild(tr);
  });

  body.onchange = saveAll;
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
});
