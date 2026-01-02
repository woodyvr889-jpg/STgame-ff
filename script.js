/*************************
  GLOBAL STATE + STORAGE
**************************/
const ADMIN_NAME = "James";

const store = {
  users: JSON.parse(localStorage.getItem("users")) || {},
  currentUser: localStorage.getItem("currentUser") || null,
  purchaseRequests: JSON.parse(localStorage.getItem("purchaseRequests")) || [],
  settings: JSON.parse(localStorage.getItem("settings")) || {
    onePlayOnly: false
  }
};

function saveAll() {
  localStorage.setItem("users", JSON.stringify(store.users));
  localStorage.setItem("purchaseRequests", JSON.stringify(store.purchaseRequests));
  localStorage.setItem("settings", JSON.stringify(store.settings));
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
  NAV BUTTONS
**************************/
function wireNav() {
  const go = (id, page) => {
    const b = document.getElementById(id);
    if (b) b.onclick = () => (window.location.href = page);
  };

  go("btnHub", "hub.html");
  go("btnGame", "game.html");
  go("btnShop", "shop.html");
  go("btnAdmin", "admin.html");

  const logout = document.getElementById("btnLogout");
  if (logout) {
    logout.onclick = () => {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    };
  }

  const back = document.getElementById("backToHub");
  if (back) back.onclick = () => (window.location.href = "hub.html");
}

/*************************
  HUB
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
  GAME
**************************/
function loadGame() {
  requireLogin();
  const u = store.users[store.currentUser];

  if (store.settings.onePlayOnly && u.gamesPlayed > 0) {
    alert("You can only play once.");
    window.location.href = "hub.html";
    return;
  }

  document.getElementById("startGameBtn").onclick = () => {
    u.gamesPlayed = (u.gamesPlayed || 0) + 1;
    u.xp = (u.xp || 0) + 50;
    u.coins = (u.coins || 0) + 10;
    saveAll();
    alert("Game finished! Stats saved.");
    window.location.href = "hub.html";
  };
}

/*************************
  SHOP
**************************/
function loadShop() {
  requireLogin();
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
  RECORDS (ADMIN)
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

  const toggle = document.getElementById("toggleGamePlay");
  toggle.checked = store.settings.onePlayOnly;
  toggle.onchange = () => {
    store.settings.onePlayOnly = toggle.checked;
    saveAll();
  };

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

  if (page === "hub") loadHub();
  if (page === "game") loadGame();
  if (page === "shop") loadShop();
  if (page === "records") loadRecords();
  if (page === "admin") loadAdmin();
});
