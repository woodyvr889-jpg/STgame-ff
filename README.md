# 🎮 Stranger Things Game — Developer Guide (Annotated)

This guide explains **where to change things**, **what each section controls**, and **what NOT to touch**, using **exact references to `script.js`**.

---

## 📦 GLOBAL STATE + STORAGE  
📍 **Lines ~1–25**

### 🔑 Admin identity
**"const ADMIN_NAME = \"James\";"**  
📍 *Line ~4*

➡ Change this **ONLY if the admin changes**.  
⚠️ Controls **admin + records access**.

---

### 💾 Stored data structure
**"const store = { … }"**  
📍 *Lines ~6–17*

Stores:
- **users**
- **currentUser**
- **purchaseRequests**
- **settings**

⚠️ **Do NOT rename these keys** — used everywhere.

---

### 💾 Saving data
**"function saveAll() { … }"**  
📍 *Lines ~19–24*

➡ Saves all changes to LocalStorage  
⚠️ If broken → nothing saves

---

## 🔐 AUTH + GUARDS  
📍 **Lines ~28–45**

### 🔒 Login protection
**"function requireLogin()"**  
📍 *Line ~29*

➡ Redirects to **index.html** if not logged in  
⚠️ Used on **every protected page**

---

### 👑 Admin-only protection
**"function requireAdmin()"**  
📍 *Line ~33*

Checks:
- Logged in
- **currentUser === ADMIN_NAME**

➡ Non-admins redirected to hub  
⚠️ Removing this removes all admin security

---

## 🧭 NAVIGATION BUTTONS  
📍 **Lines ~48–78**

### 🔘 Button wiring
**"function wireNav()"**  
📍 *Line ~49*

Controls:
- **"btnHub" → hub.html**
- **"btnGame" → game.html**
- **"btnShop" → shop.html**
- **"btnAdmin" → admin.html**
- **Logout**
- **Back to Hub**

➡ Broken button? Check its **ID matches here**

---

## 🏠 HUB PAGE  
📍 **Lines ~81–94**

### 📊 Loading user stats
**"function loadHub()"**  
📍 *Line ~82*

Updates:
- **hubUserName**
- **userCoins**
- **userPoints**
- **userXP**
- **userGamesPlayed**

➡ Adding a stat requires:
- HTML update
- This function update
- Admin table update

---

## 🎮 GAME PAGE  
📍 **Lines ~97–121**

### 🚫 One-play-only system
**"if (store.settings.onePlayOnly && u.gamesPlayed > 0)"**  
📍 *Line ~101*

➡ Blocks replay if enabled  
➡ Controlled from **Admin Panel**

---

### ▶ Game rewards
**Inside "startGameBtn.onclick"**  
📍 *Lines ~107–114*

Current rewards:
- **+1 gamesPlayed**
- **+50 XP**
- **+10 coins**

➡ Change rewards here

---

## 🛒 SHOP PAGE  
📍 **Lines ~124–145**

### 💰 Display coins
**"document.getElementById(\"shopCoins\")"**  
📍 *Line ~126*

---

### 📤 Purchase requests
**".request-buy-btn" click handler**  
📍 *Lines ~128–141*

Creates:
```js
{
  user,
  item,
  price,
  status: "pending"
}
