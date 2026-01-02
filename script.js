"use strict";

const USERS = [
  { name:"James", code:"080512", isAdmin:true },
  { name:"Mum", code:"2206", isAdmin:false },
  { name:"Dad", code:"2085", isAdmin:false },
  { name:"Nannan", code:"4213", isAdmin:false },
  { name:"Grandad Darren", code:"8765", isAdmin:false },
  { name:"Grandma Jean", code:"1357", isAdmin:false },
  { name:"Grandad Steve", code:"2468", isAdmin:false },
  { name:"Uncle Paul", code:"1122", isAdmin:false }
];

const storage = window.localStorage;
const LOCKED_STATUS = "OFF";
const UNLOCK_DATE = new Date("2026-01-05T00:00:00+00:00");

/* ---------- UTILITIES ---------- */
function isLockedNow(){
  if(LOCKED_STATUS==="OFF") return false;
  const now=new Date(new Date().toLocaleString("en-GB",{timeZone:"Europe/London"}));
  return now<UNLOCK_DATE;
}
function isDoubleTime(){
  const now=new Date(new Date().toLocaleString("en-GB",{timeZone:"Europe/London"}));
  const month=now.getMonth()+1;
  const day=now.getDate();
  const hour=now.getHours();
  return month===1 && day>=5 && day<=31 && hour>=15 && hour<17;
}

/* ---------- LOGIN PAGE ---------- */
function initLoginPage(){
  const grid=document.getElementById("loginProfiles");
  const keypad=document.getElementById("keypadSection");
  const profilesCard=document.getElementById("profilesCard");
  const display=document.getElementById("keypadDisplay");
  const keypadTitle=document.getElementById("keypadTitle");
  const error=document.getElementById("loginError");
  const back=document.getElementById("backToProfiles");

  let selected=null, entered="";

  USERS.forEach(u=>{
    const div=document.createElement("div");
    div.className="user-card";
    div.dataset.user=u.name;
    div.textContent=u.name;
    div.addEventListener("click",()=>{
      selected=u; entered=""; keypadTitle.textContent=`Enter code for ${selected.name}`;
      display.textContent="----"; keypad.classList.remove("hidden"); profilesCard.classList.add("hidden"); error.textContent="";
    });
    grid.appendChild(div);
  });

  function updateDisplay(){ display.textContent=entered.replace(/./g,"●").padEnd(selected?selected.code.length:4,"-"); }

  document.querySelectorAll(".key-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(!selected) return;
      const n=btn.dataset.num, action=btn.dataset.action;
      if(action==="clear"){ entered=""; updateDisplay(); return; }
      if(action==="enter"){
        if(entered===selected.code){ storage.setItem("currentUser",selected.name); window.location.href="hub.html"; }
        else{ error.textContent="Wrong code"; entered=""; updateDisplay(); }
        return;
      }
      if(n && entered.length<selected.code.length){ entered+=n; updateDisplay(); }
    });
  });

  back.addEventListener("click",()=>{ keypad.classList.add("hidden"); profilesCard.classList.remove("hidden"); });
}

/* ---------- HUB PAGE ---------- */
function initHubPage(){
  const user=storage.getItem("currentUser");
  if(!user){ window.location.href="index.html"; return; }

  document.getElementById("hubUserName").textContent=user;
  if(!storage.getItem("userStats")) storage.setItem("userStats",JSON.stringify({}));
  const allStats=JSON.parse(storage.getItem("userStats"));
  if(!allStats[user]) allStats[user]={points:0,coins:0,gamesPlayed:0,xp:0};
  storage.setItem("userStats",JSON.stringify(allStats));

  function updateStats(){
    const s=JSON.parse(storage.getItem("userStats"))[user];
    document.getElementById("userPoints").textContent=s.points;
    document.getElementById("userCoins").textContent=s.coins;
    document.getElementById("userGamesPlayed").textContent=s.gamesPlayed;
    document.getElementById("userXP").textContent=s.xp;
  }
  updateStats();

  const clock=document.getElementById("londonClock");
  setInterval(()=>clock.textContent=new Date().toLocaleString("en-GB",{timeZone:"Europe/London"}),1000);
  initHeader
