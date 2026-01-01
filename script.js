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

/* ---------------------- LOCK SETTINGS ------------------ */
/*
  ON  = locked until UNLOCK_DATE
  OFF = unlocked immediately
*/
const LOCKED_STATUS = "OFF"; // <<< CHANGE ONLY THIS
const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00");

/* ---------------------- LOCK LOGIC ------------------ */
function isLockedNow(){
  if (LOCKED_STATUS === "OFF") return false;

  const nowLondon = new Date(
    new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })
  );

  return nowLondon < UNLOCK_DATE;
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

  grid.innerHTML = USERS.map(
    u => `<div class="user-card" data-user="${u.name}">${u.name}</div>`
  ).join("");

  document.querySelectorAll(".user-card").forEach(card=>{
    card.addEventListener("click", ()=>{
      selected = USERS.find(u => u.name === card.dataset.user);
      entered = "";
      keypadTitle.textContent = `Enter code for ${selected.name}`;
      display.textContent = "----";
      keypad.classList.remove("hidden");
      profilesCard.classList.add("hidden");
      error.textContent = "";
    });
  });

  function updateDisplay(){
    display.textContent = entered.replace(/./g,"●").padEnd(4,"-");
  }

  document.querySelectorAll(".key-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(!selected) return;

      const n = btn.dataset.num;
      const action = btn.dataset.action;

      if(action === "clear"){
        entered = "";
        updateDisplay();
        return;
      }

      if(action === "enter"){
        if(entered === selected.code){
          storage.setItem("currentUser", selected.name);
          window.location.href = "hub.html";
        } else {
          error.textContent = "Wrong code";
          entered = "";
          updateDisplay();
        }
        return;
      }

      if(n && entered.length < selected.code.length){
        entered += n;
        updateDisplay();
      }
    });
  });

  back.addEventListener("click", ()=>{
    keypad.classList.add("hidden");
    profilesCard.classList.remove("hidden");
  });
}

/* ---------------------- HUB PAGE ------------------- */
function initHubPage(){
  const user = storage.getItem("currentUser");
  if(!user){
    window.location.href = "index.html";
    return;
  }

  document.getElementById("hubUserName").textContent = user;

  // Init stats
  if(!storage.getItem("userStats")){
    storage.setItem("userStats", JSON.stringify({}));
  }

  const stats = JSON.parse(storage.getItem("userStats"));
  if(!stats[user]){
    stats[user] = { points:0, coins:0, gamesPlayed:0, xp:0 };
    storage.setItem("userStats", JSON.stringify(stats));
  }

  function updateStats(){
    const s = JSON.parse(storage.getItem("userStats"))[user];
    document.getElementById("userPoints").textContent = s.points;
    document.getElementById("userCoins").textContent = s.coins;
    document.getElementById("userGamesPlayed").textContent = s.gamesPlayed;
    document.getElementById("userXP").textContent = s.xp;
  }
  updateStats();

  // London clock
  const clock = document.getElementById("londonClock");
  setInterval(()=>{
    clock.textContent = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London"
    });
  }, 1000);

  initHeaderButtons();

  // Lock / timer sync
  const timerDiv = document.getElementById("unlockTimer");
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");

  function updateUnlockUI(){
    const locked = isLockedNow();

    if(!locked){
      btnGame.textContent = "Game";
      btnShop.textContent = "Shop";
      btnGame.disabled = false;
      btnShop.disabled = false;
      timerDiv.textContent = "Pages are unlocked!";
      return;
    }

    btnGame.textContent = "Game 🔒";
    btnShop.textContent = "Shop 🔒";
    btnGame.disabled = true;
    btnShop.disabled = true;

    const now = new Date(
      new Date().toLocaleString("en-GB",{ timeZone:"Europe/London" })
    );
    let diff = UNLOCK_DATE - now;

    const days = Math.floor(diff / 86400000);
    diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000);
    diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);

    timerDiv.textContent =
      `Locked until 5th Jan: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateUnlockUI();
  setInterval(updateUnlockUI, 1000);
}

/* ---------------------- HEADER BUTTONS ------------------- */
function initHeaderButtons(){
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");
  const btnHub = document.getElementById("btnHub");
  const btnUpside = document.getElementById("btnUpsideDown");
  const btnLogout = document.getElementById("btnLogout");

  btnLogout.addEventListener("click", ()=>{
    storage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  btnHub.addEventListener("click", ()=>{
    window.location.href = "hub.html";
  });

  btnUpside.addEventListener("click", ()=>{
    window.location.href = "upsidedown.html";
  });

  btnGame.addEventListener("click", ()=>{
    if(!isLockedNow()) window.location.href = "game.html";
  });

  btnShop.addEventListener("click", ()=>{
    if(!isLockedNow()) window.location.href = "shop.html";
  });
}

/* -------------------- BOOT ------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body.dataset.page;
  if(page === "login") initLoginPage();
  if(page === "hub") initHubPage();
});
