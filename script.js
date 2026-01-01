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

  grid.innerHTML = USERS.map(u=>`<div class="user-card" data-user="${u.name}">${u.name}</div>`).join("");

  document.querySelectorAll(".user-card").forEach(card=>{
    card.addEventListener("click", ()=>{
      selected = USERS.find(u=>u.name===card.dataset.user);
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
      if(action==="clear"){ entered=""; updateDisplay(); return;}
      if(action==="enter"){
        if(entered===selected.code){
          storage.setItem("currentUser", selected.name);
          window.location.href="hub.html";
        } else {
          error.textContent="Wrong code";
          entered="";
          updateDisplay();
        }
        return;
      }
      if(n && entered.length<selected.code.length){
        entered+=n;
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
  if(!user){ window.location.href="index.html"; return;}
  document.getElementById("hubUserName").textContent = user;

  if(!storage.getItem("userStats")) storage.setItem("userStats", JSON.stringify({}));
  const stats = JSON.parse(storage.getItem("userStats"));
  if(!stats[user]) stats[user]={points:0,coins:0,gamesPlayed:0,xp:0};
  storage.setItem("userStats", JSON.stringify(stats));

  function updateStats(){
    const s = JSON.parse(storage.getItem("userStats"))[user];
    document.getElementById("userPoints").textContent = s.points;
    document.getElementById("userCoins").textContent = s.coins;
    document.getElementById("userGamesPlayed").textContent = s.gamesPlayed;
    document.getElementById("userXP").textContent = s.xp;
  }
  updateStats();

  const clock = document.getElementById("londonClock");
  setInterval(()=>{
    const d = new Date().toLocaleString("en-GB",{timeZone:"Europe/London"});
    clock.textContent=d;
  },1000);

  initHeaderButtons();

  // Explainer section
  const mainShell = document.querySelector(".main-shell");
  const expl = document.createElement("section");
  expl.className="card glass";
  expl.innerHTML=`
    <h2>How it works</h2>
    <p>XP: Earn by clicking Demogorgon heads. Bombs reduce XP.</p>
    <p>Coins: Collect to spend in the shop on points or vouchers.</p>
    <p>Points: Used for bidding events and special items.</p>
    <p>Games Played: Tracks how many times you've played.</p>
    <p>All stats auto-save and update in real-time.</p>
  `;
  mainShell.appendChild(expl);

  // Countdown timer for shop/game unlock
  const unlockDate = new Date("2026-01-05T00:00:00+00:00");
  const timerDiv = document.getElementById("unlockTimer");
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");

  function updateUnlockTimer() {
    const now = new Date(new Date().toLocaleString("en-GB",{timeZone:"Europe/London"}));
    let diff = unlockDate - now;

    if(diff <= 0){
      btnGame.textContent = "Game";
      btnShop.textContent = "Shop";
      btnGame.disabled = false;
      btnShop.disabled = false;
      timerDiv.textContent = "Pages are unlocked!";
      return;
    }

    btnGame.disabled = true;
    btnShop.disabled = true;

    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days*1000*60*60*24;
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours*1000*60*60;
    const minutes = Math.floor(diff / (1000*60));
    diff -= minutes*1000*60;
    const seconds = Math.floor(diff / 1000);

    timerDiv.textContent = `Locked until 5th Jan: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  updateUnlockTimer();
  setInterval(updateUnlockTimer, 1000);
}

/* ---------------------- HEADER BUTTONS ------------------- */
function initHeaderButtons(){
  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");
  const btnHub = document.getElementById("btnHub");
  const btnUpside = document.getElementById("btnUpsideDown");
  const btnLogout = document.getElementById("btnLogout");

  btnLogout.addEventListener("click", ()=>{ storage.removeItem("currentUser"); window.location.href="index.html"; });
  btnHub.addEventListener("click", ()=>{ window.location.href="hub.html"; });
  btnUpside.addEventListener("click", ()=>{ window.location.href="upsidedown.html"; });

  // Game/shop clicks only work if unlocked
  btnGame.addEventListener("click", ()=>{ if(!btnGame.disabled) window.location.href="game.html"; });
  btnShop.addEventListener("click", ()=>{ if(!btnShop.disabled) window.location.href="shop.html"; });
}

/* -------------------- BOOT ------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body.dataset.page;
  if(page==="login") initLoginPage();
  if(page==="hub") initHubPage();
});
