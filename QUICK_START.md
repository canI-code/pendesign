# 🚀 Quick Start Guide - Campus Hive

## ✅ Current Status
**Server Status**: ✅ RUNNING at http://localhost:3000

---

## 📱 How to Access the Application

### 1. Open Your Browser
Navigate to: **http://localhost:3000**

### 2. You'll See the Landing Page
- Stunning hero section with spotlight effect
- Animated text saying "Streamline campus activities..."
- Flip words showing "Events", "Resources", "Collaboration", "Innovation"
- Feature showcase with Bento Grid
- "Get Started" and "Login" buttons

---

## 🎯 Quick Demo Flow

### Step 1: Register an Account
1. Click **"Get Started"** or **"Register"** button
2. Fill in the form:
   - Name: `John Doe`
   - Email: `john@university.edu`
   - Password: `password123`
   - Department: `Computer Science`
   - Year: `2024`
3. Click **"Create Account"**
4. You'll be automatically logged in and redirected to dashboard

### Step 2: Explore the Dashboard
You'll see:
- **Sidebar** on the left with navigation
- **Stats cards** showing:
  - 3 Upcoming Events
  - 2 Active Bookings
  - 4 Club Memberships
  - Recent Activity
  - 85% Engagement Score
- **Quick Action Cards** at the bottom

### Step 3: View Events
1. Click **"Events"** in the sidebar
2. You'll see event cards with:
   - Tech Fest 2024 (Approved)
   - Hackathon 2024 (Pending)
   - Cultural Night (Approved)
3. Each card shows:
   - Status badge
   - Date, location, participants
   - Budget information
4. Try the filter buttons: All Events, Upcoming, My Events, Pending Approval

### Step 4: Browse Resources
1. Click **"Resources"** in the sidebar
2. You'll see 6 resources:
   - Main Auditorium (Hall)
   - Seminar Hall 1 (Room)
   - Computer Lab 3 (Lab - Currently Booked)
   - HD Projector (Equipment)
   - Sound System (Equipment)
   - Conference Room (Room)
3. Try filtering by: All, Halls, Rooms, Labs, Equipment
4. Notice:
   - Green "Available" badges
   - Red "Booked" badge on Computer Lab 3
   - Capacity information
   - Feature tags
   - "Book Now" buttons (disabled for booked resources)

### Step 5: Explore Clubs
1. Click **"Clubs"** in the sidebar
2. You'll see 6 clubs:
   - Tech Club (You're a member)
   - Cultural Committee (You're a coordinator)
   - Sports Committee
   - Photography Club (You're a member)
   - Robotics Club (You're the head)
   - Music Club
3. Notice:
   - Role badges (Head, Coordinator, Member)
   - Member count and event count
   - Category tags
   - "Join Club" vs "View Details" buttons
4. Try filtering: All Clubs, My Clubs, Technical, Cultural, Sports

---

## 🎨 UI Features to Notice

### Animations
- ✨ Spotlight effect on landing page
- ✨ Text generate animation
- ✨ Flip words rotation
- ✨ Card hover effects (cards lift up)
- ✨ Button border animations
- ✨ Smooth page transitions

### Glassmorphism
- 🔮 Login/Register cards have glass effect
- 🔮 Gradient borders that glow on hover
- 🔮 Backdrop blur effects

### Responsive Design
- 📱 Try resizing your browser
- 📱 Sidebar collapses on mobile
- 📱 Grid layouts adapt to screen size

---

## 🔐 Test Accounts

Since you just registered, you can use:
- **Email**: The one you registered with
- **Password**: The password you set

Or register multiple accounts to test different roles!

---

## 🎯 What Works Right Now

### ✅ Fully Functional
- Landing page with all animations
- User registration
- User login
- JWT authentication
- Dashboard overview
- Events page with filtering
- Resources page with filtering
- Clubs page with filtering
- Sidebar navigation
- Logout functionality

### 🚧 Demo Data (Not Connected to Backend Yet)
- Events list (hardcoded demo data)
- Resources list (hardcoded demo data)
- Clubs list (hardcoded demo data)
- Dashboard stats (hardcoded demo data)

### 📝 To Be Connected
- Create event functionality
- Book resource functionality
- Join club functionality
- Real-time data from MongoDB

---

## 💡 Pro Tips

### For Best Experience:
1. **Use Chrome or Edge** for best animation performance
2. **Full screen** to see all animations properly
3. **Dark mode** is enabled by default (looks amazing!)
4. **Hover over cards** to see lift effects
5. **Try all filters** on each page

### For Demo/Presentation:
1. Start at landing page (http://localhost:3000)
2. Show the spotlight and flip words animation
3. Scroll to show Bento Grid features
4. Register a new account (live demo)
5. Show dashboard with stats
6. Navigate through Events, Resources, Clubs
7. Show the responsive sidebar (resize window)
8. Highlight the glassmorphism design

---

## 🐛 Troubleshooting

### If Server Stops:
```bash
cd f:\hack-overflow\campus-hive
npm run dev
```

### If Port 3000 is Busy:
```bash
npx kill-port 3000
npm run dev
```

### If MongoDB Connection Fails:
- Check if MongoDB is running
- Or update `.env.local` with MongoDB Atlas connection string

---

## 📊 Database Setup (Optional)

### Current Setup:
- Using local MongoDB connection
- Database: `campus-hive`
- Connection string in `.env.local`

### To Use MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campus-hive
```
5. Restart server

---

## 🎉 You're All Set!

The application is **fully functional** and ready to demo. Enjoy exploring Campus Hive!

### Quick Links:
- 🏠 Landing: http://localhost:3000
- 📝 Register: http://localhost:3000/auth/register
- 🔐 Login: http://localhost:3000/auth/login
- 📊 Dashboard: http://localhost:3000/dashboard

---

**Need Help?** Check the README.md or PROJECT_SUMMARY.md for more details!
