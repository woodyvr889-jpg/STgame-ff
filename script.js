/*************************
  GLOBAL STATE + STORAGE
**************************/
const ADMIN_NAME = "James";

const USER_CODES = {
  "James": "080512",
  "Nannan": "4213",
  "Mum": "2206",
  "Grandma Jean": "1357",
  "Dad": "2085",
  "Grandad Steve": "2468",
  "Uncle Paul": "1122",
  "Grandad Darren": "8765",
};

const store = {
  users: JSON.parse(localStorage.getItem("users")) || {},
  currentUser: localStorage.getItem("currentUser") || null,
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

// Ensure admin exists
if (!store.users[ADMIN_NAME]) {
  store.users[ADMIN_NAME] = { coins: 1000, points: 500, xp: 0, gamesPlayed: 0 };
  saveAll();
}

/*************************
  AUTH + GUARDS
**************************/
function requireLogin() {
  if (!store.currentUser) window.location.href = "index.html";
}

function requireAdmin() {
  requireLogin();
  if (store.currentUser !== ADMIN_NAME) {
    alert("Admins only.");
    window.location.href = "hub.html";
  }
}

/*************************
  LOGIN PAGE
**************************/
function loadLogin() {
  const profilesDiv = document.getElementById("loginProfiles");
  const keypadSection = document.getElementById("keypadSection");
  const keypadDisplay = document.getElementById("keypadDisplay");
  const loginError = document.getElementById("loginError");

  profilesDiv.innerHTML = "";

  // Alphabetical list of all members
  const members = [
    "Dad",
    "Grandad Darren",
    "Grandad Steve",
    "Grandma Jean",
    "James",
    "Mum",
    "Nannan",
    "Uncle Paul"
  ];

  // Ensure all members exist in store.users
  members.forEach(name => {
    if (!store.users[name]) {
      store.users[name] = { coins: 100, points: 50, xp: 0, gamesPlayed: 0 };
    }
  });

  saveAll();

  // Populate login profiles from all users in alphabetical order
  members.forEach(u => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.textContent = u;
    card.onclick = () => {
      store.tempUser = u;
      profilesDiv.classList.add("hidden");
      keypadSection.classList.remove("hidden");
    };
    profilesDiv.appendChild(card);
  });

  // Keypad functionality
  let code = "";
  document.querySelectorAll(".key-btn").forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.num !== undefined) {
        if (code.length < 8) code += btn.dataset.num;
      } else if (btn.dataset.action === "clear") {
        code = "";
      } else if (btn.dataset.action === "enter") {
        if (USER_CODES[store.tempUser] === code) {
  store.currentUser = store.tempUser;
  saveAll();
  window.location.href = "hub.html";
} else {
  loginError.textContent = "Wrong code!";
        }
      keypadDisplay.textContent = code.padEnd(4, "-");
    };
  });

  document.getElementById("backToProfiles").onclick = () => {
    keypadSection.classList.add("hidden");
    profilesDiv.classList.remove("hidden");
    code = "";
    keypadDisplay.textContent = "----";
    loginError.textContent = "";
  };
}

/*************************
  NAV BUTTONS
**************************/
function wireNav() {
  const go = (id, page) => {
    const b = document.getElementById(id);
    if (b) b.onclick = () => {
      // Check admin locks
      if (page === "game" && store.settings.gameLocked) {
        alert("Game page is locked by admin.");
        return;
      }
      if (page === "shop" && store.settings.shopLocked) {
        alert("Shop page is locked by admin.");
        return;
      }
      window.location.href = page;
    };
  };

  go("btnHub", "hub.html");
  go("btnGame", "game.html");
  go("btnShop", "shop.html");
  go("btnAdmin", "admin.html");
  go("btnUpsideDown", "upsidedown.html");
  go("btnRecords", "records.html");

  const logout = document.getElementById("btnLogout");
  if (logout) logout.onclick = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  };

  const backToHub = document.getElementById("backToHub");
  if (backToHub) backToHub.onclick = () => window.location.href = "hub.html";
}

/*************************
  HUB PAGE
**************************/
function loadHub() {
  requireLogin();
  const u = store.users[store.currentUser];
  document.getElementById("hubUserName").textContent = store.currentUser;
  document.getElementById("userCoins").textContent = u.coins || 0;
  document.getElementById("userPoints").textContent = u.points || 0;
  document.getElementById("userXP").textContent = u.xp || 0;
  document.getElementById("userGamesPlayed").textContent = u.gamesPlayed || 0;
}

/*************************
  GAME PAGE
**************************/
function loadGame() {
  requireLogin();

  if (store.settings.gameLocked) {
    alert("Game page is locked by admin.");
    window.location.href = "hub.html";
    return;
  }

  const u = store.users[store.currentUser];

  if (store.settings.onePlayOnly && u.gamesPlayed > 0) {
    alert("You can only play once.");
    window.location.href = "hub.html";
    return;
  }

  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) startBtn.onclick = () => {
    u.gamesPlayed = (u.gamesPlayed || 0) + 1;
    u.xp = (u.xp || 0) + 50;
    u.coins = (u.coins || 0) + 10;
    saveAll();
    alert("Game finished! Stats saved.");
    window.location.href = "hub.html";
  };
}

/*************************
  SHOP PAGE
**************************/
function loadShop() {
  requireLogin();

  if (store.settings.shopLocked) {
    alert("Shop page is locked by admin.");
    window.location.href = "hub.html";
    return;
  }

  const u = store.users[store.currentUser];
  document.getElementById("shopCoins").textContent = u.coins || 0;

  document.querySelectorAll(".request-buy-btn").forEach(btn => {
    btn.onclick = () => {
      store.purchaseRequests.push({
        user: store.currentUser,
        item: btn.dataset.item,
        price: Number(btn.dataset.price),
        status: "pending"
      });
      saveAll();
      alert("Purchase request sent!");
    };
  });
}

/*************************
  RECORDS PAGE
**************************/
function loadRecords() {
  requireAdmin();
  const tbody = document.querySelector("#purchaseRequestsTable tbody");
  tbody.innerHTML = "";

  store.purchaseRequests.forEach((r, i) => {
    if (r.status !== "pending") return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.user}</td>
      <td>${r.item}</td>
      <td>${r.price}</td>
      <td><button data-i="${i}">Approve</button></td>
    `;
    tr.querySelector("button").onclick = () => approvePurchase(i);
    tbody.appendChild(tr);
  });
}

function approvePurchase(i) {
  const r = store.purchaseRequests[i];
  const u = store.users[r.user];

  if (u.coins < r.price) {
    alert("User lacks coins.");
    return;
  }

  u.coins -= r.price;
  r.status = "approved";
  saveAll();
  loadRecords();
}

/*************************
  ADMIN PANEL
**************************/
function loadAdmin() {
  requireAdmin();

  // One-play toggle
  const togglePlay = document.getElementById("toggleGamePlay");
  if (togglePlay) {
    togglePlay.checked = store.settings.onePlayOnly;
    togglePlay.onchange = () => {
      store.settings.onePlayOnly = togglePlay.checked;
      saveAll();
    };
  }

  // Game page lock
  const toggleGameLock = document.getElementById("toggleGameLock");
  if (toggleGameLock) {
    toggleGameLock.checked = store.settings.gameLocked;
    toggleGameLock.onchange = () => {
      store.settings.gameLocked = toggleGameLock.checked;
      saveAll();
    };
  }

  // Shop page lock
  const toggleShopLock = document.getElementById("toggleShopLock");
  if (toggleShopLock) {
    toggleShopLock.checked = store.settings.shopLocked;
    toggleShopLock.onchange = () => {
      store.settings.shopLocked = toggleShopLock.checked;
      saveAll();
    };
  }

  // Show user stats
  const tbody = document.querySelector("#userStatsTable tbody");
  tbody.innerHTML = "";

  Object.entries(store.users).forEach(([name, u]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td>${u.coins || 0}</td>
      <td>${u.points || 0}</td>
      <td>${u.gamesPlayed || 0}</td>
      <td>${u.xp || 0}</td>
    `;
    tbody.appendChild(tr);
  });
}

/*************************
  PAGE ROUTER
**************************/
document.addEventListener("DOMContentLoaded", () => {
  wireNav();

  const page = document.body.dataset.page;
  if (page === "login") loadLogin();
  if (page === "hub") loadHub();
  if (page === "game") loadGame();
  if (page === "shop") loadShop();
  if (page === "records") loadRecords();
  if (page === "admin") loadAdmin();
});
