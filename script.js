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

/* ---------------------- HUB NAVIGATION ------------------- */
function initHeaderButtons(){
  const user = storage.getItem("currentUser");
  if(!user) return;

  const stats = JSON.parse(storage.getItem("userStats"))[user];
  const currentUserObj = USERS.find(u=>u.name===user);

  const btnGame = document.getElementById("btnGame");
  const btnShop = document.getElementById("btnShop");
  const btnHub  = document.getElementById("btnHub");
  const btnUpside = document.getElementById("btnUpsideDown");
  const btnLogout = document.getElementById("btnLogout");

  if(currentUserObj?.isAdmin){
    btnGame.textContent = "Game";
    btnShop.textContent = "Shop";
  }

  btnLogout.addEventListener("click", ()=>{
    storage.removeItem("currentUser");
    window.location.href="index.html";
  });

  btnGame.addEventListener("click", ()=>{
    if(!currentUserObj.isAdmin){ alert("Page locked 🔒"); return; }
    window.location.href="game.html";
  });

  btnShop.addEventListener("click", ()=>{
    if(!currentUserObj.isAdmin){ alert("Page locked 🔒"); return; }
    window.location.href="shop.html";
  });

  btnHub.addEventListener("click", ()=>{ window.location.href="hub.html"; });
  btnUpside.addEventListener("click", ()=>{ window.location.href="upsidedown.html"; });
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
}

/* -------------------- GAME PAGE -------------------- */
function initGamePage(){
  const user = storage.getItem("currentUser");
  if(!user) window.location.href="index.html";

  const currentUserObj = USERS.find(u=>u.name===user);
  if(!currentUserObj.isAdmin){ alert("Game page locked 🔒"); window.location.href="hub.html"; return; }

  const startBtn = document.getElementById("startGameBtn");
  const container = document.getElementById("gameContainer");
  const timerDisplay = document.getElementById("gameTimer");

  let gameInterval, timeLeft=60;

  startBtn.addEventListener("click", ()=>{
    startBtn.disabled=true;
    container.innerHTML="";
    timeLeft=60;
    timerDisplay.textContent=timeLeft;

    const gameStats = JSON.parse(storage.getItem("userStats"))[user];

    gameInterval = setInterval(()=>{
      timerDisplay.textContent=timeLeft;
      if(timeLeft<=0){ clearInterval(gameInterval); endGame(); }
      timeLeft--;
      spawnItem();
    },1000);

    function spawnItem(){
      const types = ["head","coin","bomb"];
      const typeWeights = [0.5,0.4,0.1];
      const rand = Math.random();
      let cum = 0; let type;
      for(let i=0;i
