/* -------------------------
   Global Helpers & Data
------------------------- */
const usersKey = "strangerThingsUsers";
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let allUsers = JSON.parse(localStorage.getItem(usersKey)) || [];

// Utility: Save all users
function saveUsers() {
  localStorage.setItem(usersKey, JSON.stringify(allUsers));
}

// Utility: Get user by name
function getUser(username) {
  return allUsers.find(u => u.username === username);
}

// Utility: Update current user stats
function updateCurrentUserStats(stats) {
  if (!currentUser) return;
  const user = getUser(currentUser.username);
  Object.assign(user, stats);
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  saveUsers();
}

// Utility: Check if user played today
function hasPlayedToday(user) {
  if (!user.lastGameDate) return false;
  const last = new Date(user.lastGameDate);
  const today = new Date();
  return last.toDateString() === today.toDateString();
}

// Utility: Check if daily spin available
function canSpin(user) {
  if (!user.lastSpin) return true;
  const last = new Date(user.lastSpin);
  const today = new Date();
  return last.toDateString() !== today.toDateString();
}

// Log actions for records page
function logAction(action) {
  let logs = JSON.parse(localStorage.getItem("records")) || [];
  logs.push({ user: currentUser.username, action, time: new Date().toLocaleString() });
  localStorage.setItem("records", JSON.stringify(logs));
}

/* -------------------------
   INDEX.HTML (Login)
------------------------- */
if (document.getElementById("login-btn")) {
  document.getElementById("login-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const passcode = document.getElementById("passcode").value.trim();
    let user = getUser(username);

    if (!user) {
      alert("User not found. Creating new user...");
      user = { 
        username, passcode, coins:0, points:0, xp:0, gamesPlayed:0, lastGameDate:null, lastSpin:null, notifications:[] 
      };
      allUsers.push(user);
      saveUsers();
    }

    if (user.passcode !== passcode) return alert("Incorrect passcode!");

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    logAction("Logged in");
    window.location.href = "hub.html";
  });
}

/* -------------------------
   HUB.HTML
------------------------- */
if (document.getElementById("welcome")) {
  document.getElementById("welcome").textContent = `Welcome, ${currentUser.username}`;
  logAction("Opened hub");

  // Buttons
  document.getElementById("game-btn")?.addEventListener("click", () => {
    if (hasPlayedToday(currentUser)) {
      window.location.href = "played.html";
    } else {
      window.location.href = "game.html";
    }
  });

  // Daily Spin
  const spinBtn = document.getElementById("daily-spin-btn");
  if (spinBtn) {
    spinBtn.addEventListener("click", () => {
      if (!canSpin(currentUser)) return alert("You already spun today!");
      const rewards = [
        {type:"coins", amount:10},
        {type:"coins", amount:50},
        {type:"coins", amount:100},
        {type:"points", amount:100},
        {type:"multiplier", amount:2},
        {type:"multiplier", amount:5},
        {type:"extraSpin", amount:1},
        {type:"nothing", amount:0}
      ];
      const reward = rewards[Math.floor(Math.random()*rewards.length)];

      switch(reward.type){
        case "coins": updateCurrentUserStats({coins:currentUser.coins+reward.amount}); break;
        case "points": updateCurrentUserStats({points:currentUser.points+reward.amount}); break;
        case "multiplier": alert(`Next game rewards x${reward.amount}`); break;
        case "extraSpin": alert("You got 1 extra spin tomorrow!"); break;
        case "nothing": alert("Nothing!"); break;
      }

      currentUser.lastSpin = new Date();
      saveUsers();
      logAction("Daily spin");
      alert(`You got: ${reward.type} ${reward.amount}`);
    });
  }

  // Leaderboards
  const leaderboardTypes = ["coins","points","xp","gamesPlayed"];
  leaderboardTypes.forEach(type => {
    const container = document.getElementById(`${type}-leaderboard`);
    if (!container) return;
    allUsers.sort((a,b)=>b[type]-a[type]);
    container.innerHTML = allUsers.map(u=>`<li>${u.username}: ${u[type]}</li>`).join("");
  });
}

/* -------------------------
   GAME.HTML
------------------------- */
if (document.getElementById("game-map")) {
  const gameMap = document.getElementById("game-map");
  const viewResultsBtn = document.getElementById("view-results");
  const backToHub = document.getElementById("back-to-hub");

  // Hide back button during gameplay
  function startGame() { backToHub.style.display="none"; logAction("Started game"); }

  // Simple PAC-MAN placeholder
  let gameState = { score:0, coins:0, xp:0, timer:60 };

  function updateStatus() {
    gameMap.innerHTML = `Score: ${gameState.score} | Coins: ${gameState.coins} | XP: ${gameState.xp} | Time: ${gameState.timer}s`;
  }

  // Start game buttons
  document.getElementById("game1-btn")?.addEventListener("click",()=>{
    startGame();
    gameInterval();
  });
  document.getElementById("new-game-btn")?.addEventListener("click",()=>{
    startGame();
    gameInterval();
  });

  // Game loop (placeholder)
  function gameInterval() {
    updateStatus();
    const interval = setInterval(()=>{
      gameState.timer--;
      updateStatus();
      if (gameState.timer <=0){
        clearInterval(interval);
        endGame();
      }
    },1000);
  }

  function endGame() {
    viewResultsBtn.style.display="block";
    updateCurrentUserStats({
      gamesPlayed: currentUser.gamesPlayed+1,
      coins: currentUser.coins + gameState.coins,
      points: currentUser.points + gameState.score,
      xp: currentUser.xp + gameState.xp,
      lastGameDate: new Date()
    });
    logAction("Finished game");
  }

  viewResultsBtn.addEventListener("click",()=>window.location.href="results.html");
}

/* -------------------------
   RESULTS.HTML
------------------------- */
if (document.getElementById("results-container")) {
  document.getElementById("results-container").innerHTML = `
    <h2>Well Done, ${currentUser.username}!</h2>
    <p>Score: ${currentUser.points}</p>
    <p>Coins: ${currentUser.coins}</p>
    <p>XP: ${currentUser.xp}</p>
    <p>Games Played: ${currentUser.gamesPlayed}</p>
    <button onclick="window.location.href='hub.html'">Back to Hub</button>
  `;
  logAction("Viewed results");
}

/* -------------------------
   PLAYED.HTML
------------------------- */
if (document.getElementById("played-message")) {
  document.getElementById("played-message").textContent = "Uh oh! Looks like you've already played today! Come back tomorrow!";
  document.getElementById("back-to-hub-btn")?.addEventListener("click",()=>window.location.href="hub.html");
}

/* -------------------------
   ADMIN.HTML
------------------------- */
if (document.getElementById("admin-controls")) {
  // Example toggles for locking pages
  document.querySelectorAll(".toggle-lock").forEach(toggle=>{
    toggle.addEventListener("change", (e)=>{
      const page = e.target.dataset.page;
      const locked = e.target.checked;
      localStorage.setItem(`lock-${page}`, locked);
      logAction(`Admin set lock on ${page} to ${locked}`);
    });
  });

  // Modify stats
  document.getElementById("update-stats-btn")?.addEventListener("click",()=>{
    const username = document.getElementById("admin-username").value;
    const coins = parseInt(document.getElementById("admin-coins").value)||0;
    const points = parseInt(document.getElementById("admin-points").value)||0;
    const xp = parseInt(document.getElementById("admin-xp").value)||0;
    const user = getUser(username);
    if(user){
      Object.assign(user,{coins,points,xp});
      saveUsers();
      alert("Updated stats!");
      logAction(`Admin updated stats for ${username}`);
    }
  });

  // Send notifications
  document.getElementById("send-notif-btn")?.addEventListener("click",()=>{
    const username = document.getElementById("notif-username").value;
    const message = document.getElementById("notif-message").value;
    const user = getUser(username);
    if(user){
      user.notifications.push({msg: message, time: new Date().toLocaleString()});
      saveUsers();
      alert("Notification sent!");
      logAction(`Admin sent notification to ${username}`);
    }
  });
}

/* -------------------------
   RECORDS.HTML
------------------------- */
if (document.getElementById("records-container")) {
  const logs = JSON.parse(localStorage.getItem("records")) || [];
  document.getElementById("records-container").innerHTML = logs.map(l=>`<li>${l.time} - ${l.user}: ${l.action}</li>`).join("");
}

/* -------------------------
   NOTIFICATIONS.HTML
------------------------- */
if (document.getElementById("notifications-list")) {
  const notes = currentUser.notifications || [];
  const list = notes.map(n=>`<li>${n.time} - ${n.msg}</li>`).join("");
  document.getElementById("notifications-list").innerHTML = list;
}
