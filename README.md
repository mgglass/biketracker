# 🚴 Bike Tracker — GitHub Pages Deploy Guide

## How to deploy in ~10 minutes

### Step 1: Create a GitHub account
Go to **https://github.com** and sign up for a free account if you don't have one.

---

### Step 2: Create a new repository
1. From your GitHub dashboard, click the **"+"** button in the top-right corner
2. Select **"New repository"**
3. Give it a name like `bike-tracker`
4. Leave it set to **Public** (required for free GitHub Pages hosting)
5. Click **"Create repository"**

---

### Step 3: Upload your project files
You have two options:

**Option A — Upload via the GitHub website (easiest):**
1. On your new repository page, click **"uploading an existing file"**
2. Drag your entire project folder's contents into the upload area
3. Make sure the folder structure looks like this:
   ```
   .github/
     workflows/
       deploy.yml
   src/
     App.jsx
     main.jsx
   index.html
   package.json
   vite.config.js
   icon.png
   ```
4. Click **"Commit changes"**

**Option B — Use Git from your computer:**
```bash
cd your-bike-tracker-folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bike-tracker.git
git push -u origin main
```

---

### Step 4: Enable GitHub Pages
1. In your repository, go to **Settings** (the gear icon in the top menu)
2. Scroll down to the **"Pages"** section in the left sidebar
3. Under **"Source"**, select **"GitHub Actions"** from the dropdown
4. Click **Save**

---

### Step 5: Wait for the build (~2 minutes)
1. Click the **"Actions"** tab in your repository
2. You'll see a workflow called **"Deploy to GitHub Pages"** running
3. Once it shows a green ✅ checkmark, your app is live!
4. Your URL will be: `https://YOUR-USERNAME.github.io/bike-tracker`

---

### Step 6: Add to your iPhone home screen
1. Open your GitHub Pages URL in **Safari** on your iPhone
2. Tap the **Share button** (the box with an arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Give it a name (e.g. "Bike Tracker") and tap **Add**
5. The app now appears on your home screen and launches fullscreen — just like a native app! 🎉

---

## Making updates in the future
Whenever you change a file and push it to GitHub (or upload a new version via the website), the **Actions workflow runs automatically** and redeploys your app within about 2 minutes. No manual steps needed.

---

## Your data is saved locally
All your ride and repair data is stored in your iPhone's browser storage, so it persists between sessions automatically.

> **Note:** If you ever clear Safari's website data or use a different browser/device, your data will not carry over — it lives only on the device where you use the app.

---

## Optional: Give your app a custom URL
GitHub Pages supports custom domains (e.g. `bike-tracker.yourdomain.com`) if you own a domain. You can configure this under **Settings → Pages → Custom domain**.
