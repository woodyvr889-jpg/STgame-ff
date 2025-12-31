"use strict";

/* ----------------------- USERS ------------------------- */
const USERS = [
  { name: "James", code: "080512", isAdmin:true },
  { name: "Mum", code: "1291", isAdmin:false },
  { name: "Dad", code: "5089", isAdmin:false },
  { name: "Nannan", code: "4213", isAdmin:false },
  { name: "Grandad Darren", code: "8765", isAdmin:false },
  { name: "Grandma Jean", code: "1357", isAdmin:false },
  { name: "Grandad Steve", code: "2468", isAdmin:false },
  { name: "Uncle Paul", code: "1122", isAdmin:false }
];

/* ---------------------- STORAGE ----------------------- */
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

  grid.innerHTML = USERS.map(u=>{
    return `<div class="user-card" data-user="${u.name}">${u.name}</div>`;
  }).join("");

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

  // Points, coins, games, XP
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

  document.getElementById("btnLogout").addEventListener("click", ()=>{
    storage.removeItem("currentUser");
    window.location.href="index.html";
  });

  // Buttons navigation
  document.getElementById("btnGame").addEventListener("click", ()=>{window.location.href="game.html";});
  document.getElementById("btnShop").addEventListener("click", ()=>{window.location.href="shop.html";});
  document.getElementById("btnUpsideDown").addEventListener("click", ()=>{window.location.href="upsidedown.html";});

  // London Clock
  const clock = document.getElementById("londonClock");
  setInterval(()=>{
    const d = new Date().toLocaleString("en-GB",{timeZone:"Europe/London"});
    clock.textContent=d;
  },1000);
}

/* -------------------- GAME PAGE -------------------- */
function initGamePage(){
  const user = storage.getItem("currentUser");
  if(!user) window.location.href="index.html";

  const startBtn = document.getElementById("startGameBtn");
  const container = document.getElementById("gameContainer");
  const timerDisplay = document.getElementById("gameTimer");

  let gameInterval, timeLeft=60, activeItems=[];

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
      const type = Math.random()<0.1?"bomb":(Math.random()<0.5?"coin":"head");
      const item = document.createElement("img");
      item.className="game-item";
      item.src = type==="head"?"1680b7659982b09839b2efce1e77cb91.png": type==="coin"?"coin_PNG36871.png":"bomb.png";
      item.style.position="absolute";
      item.style.top = Math.random()*(container.clientHeight-50)+"px";
      item.style.left = Math.random()*(container.clientWidth-50)+"px";
      container.appendChild(item);

      function removeItem(){ if(item.parentNode) item.parentNode.removeChild(item); }

      const timeout = setTimeout(removeItem,5000);

      item.addEventListener("click", ()=>{
        clearTimeout(timeout);
        removeItem();
        if(type==="head"){ gameStats.xp+=10; }
        if(type==="coin"){ gameStats.coins+=5; }
        if(type==="bomb"){ gameStats.xp-=10; if(gameStats.xp<0) gameStats.xp=0;}
        storage.setItem("userStats", JSON.stringify({...JSON.parse(storage.getItem("userStats")),[user]:gameStats}));
      });
    }

    function endGame(){
      clearInterval(gameInterval);
      gameStats.gamesPlayed+=1;
      storage.setItem("userStats", JSON.stringify({...JSON.parse(storage.getItem("userStats")),[user]:gameStats}));
      alert(`Game over! XP: ${gameStats.xp}, Coins: ${gameStats.coins}`);
      startBtn.disabled=false;
    }
  });
}

/* ------------------- SHOP PAGE --------------------- */
function initShopPage(){
  const user = storage.getItem("currentUser");
  if(!user) window.location.href="index.html";

  const shopItems = [
    {name:"Bidding Voucher", type:"points", value:5000},
    {name:"Points Pack 1k", type:"money", value:1000}
  ];

  const container = document.getElementById("shopItems");
  container.innerHTML = shopItems.map(i=>`<div class="shop-item"><h3>${i.name}</h3><p>Cost: ${i.value}</p></div>`).join("");
}

/* ------------------- BOOT ------------------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const page = document.body.dataset.page;
  if(page==="login") initLoginPage();
  if(page==="hub") initHubPage();
  if(page==="game") initGamePage();
  if(page==="shop") initShopPage();
});
