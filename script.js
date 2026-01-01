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
const LOCKED_STATUS = "OFF";
const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00");

function isLockedNow() {
  if (LOCKED_STATUS === "OFF") return false;
  const now = new Date(new Date().toLocaleString("en-GB",{timeZone:"Europe/London"}));
  return now < UNLOCK_DATE;
}

/* ---------------------- GAME PAGE ------------------- */
function initGamePage() {
  const user = storage.getItem("currentUser");
  if (!user) window.location.href="index.html";

  const startBtn = document.getElementById("startGameBtn");
  const gameContainer = document.getElementById("gameContainer");
  const timerEl = document.getElementById("gameTimer");

  const bombCount = document.getElementById("bombCount");
  const coinCount = document.getElementById("coinCount");
  const clockCount = document.getElementById("clockCount");
  const xpCount = document.getElementById("xpCount");
  const xpLost = document.getElementById("xpLost");
  const itemsMissed = document.getElementById("itemsMissed");
  const bonusXP = document.getElementById("bonusXP");

  let timerInterval;
  let timeLeft = 60;
  let stats = {bombs:0, coins:0, clocks:0, xp:0, xpLost:0, itemsMissed:0, bonusXP:0};

  function resetGame() {
    timeLeft = 60;
    timerEl.textContent = timeLeft;
    stats = {bombs:0, coins:0, clocks:0, xp:0, xpLost:0, itemsMissed:0, bonusXP:0};
    updateStats();
    gameContainer.innerHTML="";
  }

  function updateStats() {
    bombCount.textContent = stats.bombs.toString().padStart(2,"0");
    coinCount.textContent = stats.coins.toString().padStart(2,"0");
    clockCount.textContent = stats.clocks.toString().padStart(2,"0");
    xpCount.textContent = stats.xp.toString().padStart(4,"0");
    xpLost.textContent = stats.xpLost.toString().padStart(4,"0");
    itemsMissed.textContent = stats.itemsMissed.toString().padStart(2,"0");
    bonusXP.textContent = stats.bonusXP.toString().padStart(4,"0");
  }

  function spawnItem() {
    const items = [
      {icon:"💣", type:"bomb", value:-10, xp:-10, color:"red"},
      {icon:"🪙", type:"coin", value:25, xp:50, color:"green"},
      {icon:"🕓", type:"clock", value:0, xp:Math.random()<0.5?10:-10, color:"yellow"}
    ];

    const item = items[Math.floor(Math.random()*items.length)];
    const btn = document.createElement("button");
    btn.textContent = item.icon;
    btn.style.position = "relative";
    gameContainer.appendChild(btn);

    let clicked = false;
    const timeout = setTimeout(()=>{
      if(!clicked){
        stats.itemsMissed++;
        updateStats();
        btn.remove();
      }
    },5000);

    btn.addEventListener("click", ()=>{
      clicked=true;
      clearTimeout(timeout);
      // apply effect
      if(item.type==="bomb"){
        stats.bombs++;
        stats.xpLost += Math.abs(item.xp);
        showFloatingText(btn,"-"+Math.abs(item.xp),item.color);
      }
      if(item.type==="coin"){
        stats.coins++;
        stats.xp += item.xp;
        showFloatingText(btn,"+"+item.xp,item.color);
      }
      if(item.type==="clock"){
        stats.clocks++;
        stats.xp += item.xp;
        showFloatingText(btn,(item.xp>0?"+":"")+item.xp,item.color);
      }
      updateStats();
      btn.remove();
    });
  }

  function showFloatingText(parent,text,color){
    const span = document.createElement("span");
    span.className="floating-text";
    span.textContent=text;
    span.style.color=color;
    parent.appendChild(span);
    setTimeout(()=>span.remove(),1000);
  }

  function startGame(){
    resetGame();
    startBtn.disabled=true;
    timerInterval = setInterval(()=>{
      timeLeft--;
      timerEl.textContent = timeLeft;
      if(timeLeft<=0){
        clearInterval(timerInterval);
        alert("Game Over!");
        startBtn.disabled=false;
        // save stats to storage
        const allStats = JSON.parse(storage.getItem("userStats")||"{}");
        if(!allStats[user]) allStats[user]={points:0,coins:0,gamesPlayed:0,xp:0};
        allStats[user].gamesPlayed++;
        allStats[user].xp += stats.xp;
        storage.setItem("userStats",JSON.stringify(allStats));
      } else {
        // spawn random item occasionally
        if(Math.random()<0.2) spawnItem();
      }
    },1000);
  }

  startBtn.addEventListener("click", ()=>{
    if(isLockedNow()){
      alert("The game is locked!");
      return;
    }
    startGame();
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  if(document.body.dataset.page==="game") initGamePage();
});
