# 🚀 Campus Hive - Production Readiness Guide

This document outlines everything needed to make Campus Hive production-ready.

---

## ✅ Current Status

### Features Implemented
- ✅ User authentication (login/register with OTP)
- ✅ Dashboard with real-time stats
- ✅ Events management (create, view, review, delete, image upload)
- ✅ Resources booking (with cancel functionality)
- ✅ Clubs management (join, leave, edit branding)
- ✅ Messaging system (AI chat, club chats, direct messages, phone search)
- ✅ Store (buy/sell items with purchase limits, cancel requests)
- ✅ Notes/Resources sharing
- ✅ Analytics dashboard
- ✅ Profile management with phone verification
- ✅ Cancel/revoke for all user requests

### Mock Data Status
- ⚠️ All mock data has been removed from `AppContext.tsx`
- ⚠️ Application now starts with empty state (except AI Assistant chat)

---

## 📋 Production Checklist

### 1. Database Setup

**Required Database Tables:**

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    year VARCHAR(20),
    role VARCHAR(50) DEFAULT 'student',
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(255),
    participants INTEGER DEFAULT 0,
    budget DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    organizer_id VARCHAR(36) REFERENCES users(id),
    organizer_name VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event images table
CREATE TABLE event_images (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event reviews table
CREATE TABLE event_reviews (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    user_name VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER DEFAULT 1,
    features TEXT[], -- PostgreSQL array
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource bookings table
CREATE TABLE resource_bookings (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource images table
CREATE TABLE resource_images (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clubs table
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    logo_url TEXT,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Club memberships table
CREATE TABLE club_memberships (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member', -- head, coordinator, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
);

-- Chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'club', 'direct', 'ai'
    club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants table
CREATE TABLE chat_participants (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) REFERENCES users(id),
    sender_name VARCHAR(255),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat requests table
CREATE TABLE chat_requests (
    id SERIAL PRIMARY KEY,
    from_user_id VARCHAR(36) REFERENCES users(id),
    to_user_id VARCHAR(36) REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store items table
CREATE TABLE store_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    quantity INTEGER DEFAULT 1,
    category VARCHAR(100),
    condition VARCHAR(50),
    seller_id VARCHAR(36) REFERENCES users(id),
    seller_name VARCHAR(255),
    pending_requests INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store item images table
CREATE TABLE store_item_images (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES store_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store purchase requests table
CREATE TABLE store_requests (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES store_items(id) ON DELETE CASCADE,
    buyer_id VARCHAR(36) REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- PDF, Document, etc.
    subject VARCHAR(100),
    file_url TEXT NOT NULL,
    file_type VARCHAR(20),
    uploader_id VARCHAR(36) REFERENCES users(id),
    uploader_name VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. API Endpoints Required

Create the following API routes in `/app/api/`:

```
📁 app/api/
├── auth/
│   ├── login/route.ts          ✅ EXISTS (needs production updates)
│   ├── register/route.ts       ✅ EXISTS (needs production updates)
│   ├── verify-otp/route.ts     ❌ CREATE
│   └── logout/route.ts         ❌ CREATE
├── users/
│   ├── route.ts                ❌ CREATE - GET all users, POST new user
│   ├── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE user
│   └── search/route.ts         ❌ CREATE - Search by phone
├── events/
│   ├── route.ts                ❌ CREATE - GET all, POST new
│   ├── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE
│   ├── [id]/reviews/route.ts   ❌ CREATE - GET, POST reviews
│   └── [id]/images/route.ts    ❌ CREATE - GET, POST images
├── resources/
│   ├── route.ts                ❌ CREATE - GET all, POST new
│   ├── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE
│   └── [id]/bookings/route.ts  ❌ CREATE - GET, POST, DELETE bookings
├── clubs/
│   ├── route.ts                ❌ CREATE - GET all, POST new
│   ├── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE
│   ├── [id]/members/route.ts   ❌ CREATE - GET, POST, DELETE members
│   └── [id]/join/route.ts      ❌ CREATE - POST join, DELETE leave
├── chats/
│   ├── route.ts                ❌ CREATE - GET user's chats
│   ├── [id]/route.ts           ❌ CREATE - GET chat details
│   └── [id]/messages/route.ts  ❌ CREATE - GET, POST messages
├── store/
│   ├── route.ts                ❌ CREATE - GET all, POST new item
│   ├── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE
│   └── [id]/request/route.ts   ❌ CREATE - POST request, DELETE cancel
├── notes/
│   ├── route.ts                ❌ CREATE - GET all, POST new
│   └── [id]/route.ts           ❌ CREATE - GET, PUT, DELETE
└── upload/
    └── route.ts                ❌ CREATE - Image upload handler
```

---

### 3. Environment Variables

Create `.env.local` (DO NOT commit to git):

```env
# Database
DATABASE_URL=your_database_connection_string
MONGODB_URI=your_mongodb_connection_string (if using MongoDB)

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OTP Service (e.g., Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Image Storage (e.g., Cloudinary, AWS S3)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OR for AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region

# AI Integration (optional - for enhanced AI assistant)
OPENAI_API_KEY=your_openai_key

# Email Service (e.g., SendGrid, Resend)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
```

---

### 4. Security Implementations

#### Authentication
- [ ] Replace localStorage auth with HTTP-only cookies
- [ ] Implement JWT token refresh mechanism
- [ ] Add rate limiting on login attempts
- [ ] Implement password hashing (bcrypt)
- [ ] Add CSRF protection

#### API Security
- [ ] Add authentication middleware to all protected routes
- [ ] Implement role-based access control (RBAC)
- [ ] Validate and sanitize all inputs
- [ ] Add rate limiting on API endpoints
- [ ] Implement request validation with Zod

#### Data Security
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS in production
- [ ] Implement proper CORS settings
- [ ] Add Content Security Policy headers

---

### 5. File Upload System

Replace client-side URL.createObjectURL with proper file upload:

```typescript
// Example: /app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        { folder: 'campus-hive' }
    );
    
    return Response.json({ url: result.secure_url });
}
```

---

### 6. Real-time Features

For real-time messaging and notifications, implement:

#### Option A: Socket.io
```bash
npm install socket.io socket.io-client
```

#### Option B: Pusher
```bash
npm install pusher pusher-js
```

#### Option C: Supabase Realtime
```bash
npm install @supabase/supabase-js
```

---

### 7. State Management Updates

Update `AppContext.tsx` to fetch from API:

```typescript
// Example: Fetching events from API
useEffect(() => {
    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };
    
    if (user) {
        fetchEvents();
    }
}, [user]);

// Example: Adding event with API
const addEvent = async (event: Event) => {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        const newEvent = await response.json();
        setEvents([...events, newEvent]);
    } catch (error) {
        console.error('Failed to add event:', error);
        throw error;
    }
};
```

---

### 8. Error Handling

Implement global error handling:

```typescript
// lib/api-client.ts
export async function apiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}
```

---

### 9. Performance Optimizations

- [ ] Implement pagination for lists (events, resources, store items)
- [ ] Add image lazy loading
- [ ] Implement data caching (React Query / SWR)
- [ ] Add loading skeletons
- [ ] Optimize bundle size (analyze with `npm run analyze`)
- [ ] Enable ISR (Incremental Static Regeneration) where applicable

---

### 10. Testing

```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress  # For E2E tests
```

Required tests:
- [ ] Unit tests for utility functions
- [ ] Component tests for UI components
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user flows

---

### 11. Deployment Checklist

Before deploying:

1. **Build Test**
   ```bash
   npm run build
   npm run start
   ```

2. **Environment Setup**
   - Set all environment variables on hosting platform
   - Configure database connection
   - Set up file storage service

3. **Database Migration**
   - Run migration scripts
   - Seed initial data if needed

4. **DNS & SSL**
   - Configure custom domain
   - Enable HTTPS

5. **Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Configure analytics (Google Analytics, Plausible)
   - Set up uptime monitoring

---

### 12. Recommended Hosting

| Service | Purpose |
|---------|---------|
| Vercel | Next.js hosting (recommended) |
| PlanetScale / Supabase | Database |
| Cloudinary / Uploadthing | Image storage |
| Upstash | Redis (rate limiting, caching) |
| Twilio / TextLocal | SMS OTP |
| SendGrid / Resend | Email |

---

## 📞 Contact & Support

For questions about production deployment, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** $(date)
**Version:** 1.0.0
