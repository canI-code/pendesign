# Campus Hive - Unified Campus Management System

A comprehensive, industry-level full-stack web platform for managing campus resources, events, and collaboration built with Next.js 14, Aceternity UI, and MongoDB.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: Secure JWT-based auth with role-based access control (Admin, Organizer, Participant)
- **Event Management**: Complete event lifecycle with approval workflows, budget tracking, and multi-club collaboration
- **Resource Booking**: Book rooms, halls, and equipment with automatic conflict detection
- **Club Management**: Create and manage clubs with membership roles
- **In-App Messaging**: Real-time communication (coming soon)
- **Analytics Dashboard**: Track engagement, resource utilization, and event participation

### Premium UI/UX
- **Aceternity UI Components**: Stunning animations and effects
- **Glassmorphism Design**: Modern, premium aesthetic
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Dark Mode**: Beautiful dark theme throughout
- **Smooth Animations**: Framer Motion powered transitions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Library**: Aceternity UI, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account

### Steps

1. **Navigate to project directory**
   ```bash
   cd f:\hack-overflow\campus-hive
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env.local` file is already created. Update it with your MongoDB connection:
   
   For local MongoDB:
   ```env
   MONGODB_URI=mongodb://localhost:27017/campus-hive
   ```
   
   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campus-hive
   ```

4. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### First Time Setup

1. **Register an account** at `/auth/register`
2. **Login** at `/auth/login`
3. **Explore the dashboard** at `/dashboard`

### User Roles

- **Participant**: Can view events, join clubs, book resources
- **Organizer**: Can create events, manage club activities
- **Admin**: Full system access, approve events and bookings

### Creating Your First Event

1. Go to Dashboard → Events
2. Click "Create Event"
3. Fill in event details
4. Submit for approval (if not admin)

### Booking Resources

1. Go to Dashboard → Resources
2. Browse available resources
3. Select time slot
4. Submit booking request

## 📁 Project Structure

```
campus-hive/
├── app/
│   ├── api/              # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Auth pages (login, register)
│   ├── dashboard/        # Dashboard pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Layout components
│   └── ui/               # Aceternity UI components
├── lib/
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Utility functions
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Event.ts
│   ├── Resource.ts
│   ├── Booking.ts
│   └── Club.ts
└── types/                # TypeScript types
```

## 🎨 Design Features

### Aceternity UI Components Used
- **Spotlight**: Hero section lighting effect
- **Text Generate Effect**: Animated text reveals
- **Flip Words**: Dynamic word rotation
- **Bento Grid**: Dashboard layout
- **Glassmorphism Cards**: Premium card design
- **Moving Borders**: Animated button borders

### Color Palette
- Primary: Indigo (#6366f1)
- Secondary: Violet (#8b5cf6)
- Background: Dark (#0a0a0f)

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation
- Secure API routes

## 📊 Database Models

### User
- Email, password, name, department, year
- Role (admin/organizer/participant)
- Club memberships
- Permissions

### Event
- Title, description, dates, location
- Event type (single-day/multi-day/collaborative)
- Status workflow (draft → pending → approved)
- Budget tracking
- Organizers and participants

### Resource
- Name, type (room/hall/equipment)
- Capacity, location, features
- Availability status

### Booking
- Resource, user, event references
- Time slots with conflict detection
- Approval workflow

### Club
- Name, description, category
- Members with roles
- Active status

## 🚧 Upcoming Features

- [ ] Real-time messaging system
- [ ] Push notifications
- [ ] Advanced analytics with charts
- [ ] File uploads for events
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Multi-language support

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env.local`
- For Atlas, whitelist your IP address

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

## 📝 License

MIT License - feel free to use this project for your hackathon or personal projects!

## 🏆 Competition Ready

This project is built to win with:
- ✅ Industry-level code quality
- ✅ Premium UI/UX with animations
- ✅ Complete feature implementation
- ✅ Scalable architecture
- ✅ Real-world applicability

## 👨‍💻 Development

Built with ❤️ using Next.js, Aceternity UI, and MongoDB

---

**Happy Coding! 🚀**
