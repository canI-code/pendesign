# 🚀 Complete Setup Guide - Campus Hive

## 📋 Current Issue: Tailwind CSS Not Loading

**What you're seeing**: Plain HTML without styling (black background, white text, no colors/animations)

**Why**: Tailwind CSS v4 needs proper configuration with Next.js 16

---

## ✅ COMPLETE SETUP STEPS

### Step 1: Stop the Current Server
Press `Ctrl + C` in the terminal where `npm run dev` is running

### Step 2: Clear Next.js Cache
```bash
cd f:\hack-overflow\campus-hive
rmdir /s /q .next
```

### Step 3: Reinstall Dependencies (Clean Install)
```bash
npm install
```

### Step 4: Start the Development Server
```bash
npm run dev
```

### Step 5: Hard Refresh Your Browser
- Open http://localhost:3000
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- This clears the browser cache

---

## 🔧 If Still Not Working: Alternative Fix

If the above doesn't work, we need to switch to Tailwind CSS v3 (more stable):

### Option A: Use Tailwind v3 (Recommended for Stability)

```bash
# Stop the server (Ctrl + C)

# Remove Tailwind v4
npm uninstall @tailwindcss/postcss

# Install Tailwind v3
npm install -D tailwindcss@3 postcss autoprefixer

# Clear cache
rmdir /s /q .next

# Start server
npm run dev
```

Then I'll update the config files for v3.

---

## 📦 Required Dependencies

Here's what MUST be installed:

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^11.15.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0",
    "mongoose": "^8.9.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0-beta.5",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7",
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "16.1.6"
  }
}
```

---

## 🗄️ Database Setup (MongoDB)

### Option 1: Local MongoDB (Simplest)

1. **Install MongoDB**:
   - Download from: https://www.mongodb.com/try/download/community
   - Install with default settings

2. **Start MongoDB**:
   ```bash
   mongod
   ```

3. **Your `.env.local` is already configured**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/campus-hive
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**:
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**:
   - Click "Build a Database"
   - Choose "Free" tier
   - Select region closest to you
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `campus-admin`
   - Password: (generate strong password)
   - Save the password!

4. **Whitelist IP**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://campus-admin:<password>@cluster0.xxxxx.mongodb.net/`

6. **Update `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://campus-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/campus-hive
   ```
   Replace `YOUR_PASSWORD` with your actual password

---

## 🎨 Expected UI After Fix

Once Tailwind loads properly, you should see:

### Landing Page:
- ✨ **Gradient text** "Campus Hive" (white to gray gradient)
- 🌟 **Spotlight effect** (animated light beam)
- 🔄 **Flip words** rotating: Events → Resources → Collaboration
- 📊 **Colorful feature cards** (indigo/violet colors)
- 🎯 **Animated buttons** with gradient borders
- 🎨 **Grid background** pattern

### Colors You Should See:
- **Indigo**: #6366f1 (primary buttons, highlights)
- **Violet**: #8b5cf6 (secondary elements)
- **Black**: #000000 (background)
- **White/Gray**: Text colors

---

## 🐛 Troubleshooting Checklist

### ❌ If you see plain HTML (like your screenshot):
- [ ] Tailwind CSS not loading
- [ ] Run: `rmdir /s /q .next` then `npm run dev`
- [ ] Hard refresh browser: `Ctrl + Shift + R`

### ❌ If you see "Module not found" errors:
- [ ] Missing dependencies
- [ ] Run: `npm install`

### ❌ If MongoDB connection fails:
- [ ] Check if MongoDB is running (local)
- [ ] Verify connection string in `.env.local`
- [ ] For Atlas: Check IP whitelist

### ❌ If port 3000 is busy:
```bash
npx kill-port 3000
npm run dev
```

---

## 📝 Quick Fix Commands (Run These Now)

```bash
# 1. Stop server (Ctrl + C in terminal)

# 2. Navigate to project
cd f:\hack-overflow\campus-hive

# 3. Clear cache
rmdir /s /q .next

# 4. Verify dependencies
npm install

# 5. Start fresh
npm run dev

# 6. Open browser and hard refresh
# http://localhost:3000
# Press Ctrl + Shift + R
```

---

## ✅ What Should Work After Setup

1. **Landing Page** - Full animations and colors
2. **Register** - Glassmorphism card with gradient border
3. **Login** - Matching design
4. **Dashboard** - Colorful Bento Grid
5. **Events** - Event cards with status badges
6. **Resources** - Resource cards with filters
7. **Clubs** - Club cards with role badges

---

## 🎯 Minimal Setup (Just to See It Working)

If you just want to see it work quickly:

1. **MongoDB**: Skip for now (auth will fail but UI will work)
2. **Just run**:
   ```bash
   rmdir /s /q .next
   npm run dev
   ```
3. **Open**: http://localhost:3000
4. **Hard refresh**: Ctrl + Shift + R

The landing page should work without MongoDB!

---

## 📞 Next Steps

**Tell me**:
1. Did you run the commands above?
2. After hard refresh, do you see colors now?
3. Any error messages in the terminal?
4. Do you want to use local MongoDB or Atlas?

I'll help you get it working perfectly! 🚀
