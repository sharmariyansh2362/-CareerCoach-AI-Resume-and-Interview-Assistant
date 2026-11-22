# CareerCoach – AI Resume and Interview Assistant

A complete, production-ready full-stack MERN web application built strictly according to the Capstone Project requirements without unapproved external libraries.

---

## 📌 Project Overview
**CareerCoach** empowers job seekers to input their academic credentials, technical skills, and work history to receive AI-tailored resume summaries, quantified achievement bullet points, and role-specific mock interview question sets with structured answer frameworks.

Key capabilities include:
- **JWT Authentication:** Dual-token mechanism with 15-minute access tokens and 7-day refresh tokens.
- **Candidate Profile Management:** Controlled forms with dynamic arrays for education, skills tags, and work experience validated via Mongoose.
- **AI Generation Engine:** Server-side native `fetch` integration with external AI APIs (Gemini/OpenAI compatible) alongside an intelligent fallback generator.
- **Custom Rate Limiting Middleware:** Enforces a rolling 24-hour limit of 10 requests per user using fast MongoDB index lookups.
- **Admin Analytics:** MongoDB Aggregation Pipeline (`$group`, `$lookup`, `$sort`) producing per-user usage metrics and platform statistics.
- **Pure Vanilla CSS:** Sleek, responsive, and modern UI built without external UI component libraries.

---

## 🏗️ Architectural & Directory Structure

```
WebDevCapStone/
├── .env.example                               # Root environment variable template
├── .gitignore                                 # Git ignore (excludes .env and node_modules)
├── CareerCoach_Postman_Collection.json        # Pre-configured Postman test suite
├── package.json                               # Root convenience scripts
├── README.md                                  # Comprehensive documentation
│
├── server/                                    # Strict MVC Backend
│   ├── config/
│   │   └── db.js                              # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js                  # Register, Login, Refresh, Logout
│   │   ├── profileController.js               # Get and Upsert candidate profile
│   │   ├── generationController.js            # Resume & Interview generation & History
│   │   └── adminController.js                 # Aggregation pipeline usage report
│   ├── middleware/
│   │   ├── authMiddleware.js                  # JWT verification (verifyJWT)
│   │   ├── roleMiddleware.js                  # RBAC authorization (requireRole('admin'))
│   │   ├── rateLimitMiddleware.js             # 24h rolling limit check (generationRateLimiter)
│   │   └── errorMiddleware.js                 # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js                            # User schema with bcrypt pre-save hook
│   │   ├── Profile.js                         # Profile schema with nested arrays & validators
│   │   └── Generation.js                      # Generation schema with compound index
│   ├── routes/
│   │   ├── authRoutes.js                      # /api/auth/*
│   │   ├── profileRoutes.js                   # /api/profile/*
│   │   ├── generationRoutes.js                # /api/generate/*
│   │   └── adminRoutes.js                     # /api/admin/*
│   ├── .env.example                           # Server env template
│   ├── .gitignore                             # Server gitignore
│   ├── package.json                           # Server package metadata
│   └── server.js                              # Express app entry point
│
└── client/                                    # React (Vite) Frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── AdminRoute.jsx                 # RBAC Protected route guard
    │   │   ├── Navbar.jsx                     # Responsive navigation with role indicators
    │   │   └── ProtectedRoute.jsx             # JWT Auth route guard
    │   ├── context/
    │   │   └── AuthContext.jsx                # React Context API + Auto-refresh fetch wrapper
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx             # Aggregated usage report table
    │   │   ├── Dashboard.jsx                  # Generation hub with target role & quick selectors
    │   │   ├── History.jsx                    # Filterable past generation cards
    │   │   ├── Login.jsx                      # Sign in form with demo account quick-fill
    │   │   ├── ProfileForm.jsx                # Dynamic education, skill tags, & experience
    │   │   └── Register.jsx                   # Account creation with role selection
    │   ├── App.jsx                            # Route configuration
    │   ├── index.css                          # Vanilla CSS design system
    │   └── main.jsx                           # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js                         # Vite dev proxy configuration
```

---

## ⚙️ Technology Stack & Library Constraints

| Layer | Approved Technology Baseline |
| :--- | :--- |
| **Backend** | `express`, `mongoose`, `dotenv`, `bcrypt`, `jsonwebtoken` (native `fetch` used for AI API calls) |
| **Frontend** | `react` (Vite), `react-router-dom`, React Context API, native `fetch` |
| **Styling** | Responsive Vanilla CSS with CSS custom properties (no Tailwind, Bootstrap, or component libraries) |
| **Database** | MongoDB with Mongoose ODM |

---

## 🔐 Environment Variables (`.env.example`)

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/careercoach
JWT_ACCESS_SECRET=careercoach_access_token_secret_key_2026_secure
JWT_REFRESH_SECRET=careercoach_refresh_token_secret_key_2026_secure
AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
AI_API_KEY=your_gemini_or_external_ai_api_key_here
```

*(Note: If `AI_API_KEY` is not provided or set to empty, the application automatically uses its built-in rule-based AI engine, ensuring the app works end-to-end immediately without requiring paid external API credentials).*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ recommended, tested on v22)
- MongoDB instance running locally or via MongoDB Atlas

### 2. Install Dependencies
Run in two terminal windows or from root:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run the Servers

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials; returns `accessToken` (15m) & `refreshToken` (7d) |
| `POST` | `/api/auth/refresh` | Public | Exchange `refreshToken` for a new access token |
| `POST` | `/api/auth/logout` | Protected/Public | Invalidate refresh token in database |

### Candidate Profile (`/api/profile`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Protected | Fetch current user's profile |
| `POST` | `/api/profile` | Protected | Create or update profile (`skills`, `education`, `experience`) |
| `PUT` | `/api/profile` | Protected | Alias to upsert profile |

### AI Generation (`/api/generate`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/generate/resume` | Protected + Rate-Limited | Generate tailored summary and XYZ bullet points |
| `POST` | `/api/generate/interview` | Protected + Rate-Limited | Generate 5 mock interview questions with STAR answer frameworks |
| `GET` | `/api/generate/history` | Protected | Fetch user's generation history sorted newest first |

### Admin Analytics (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/usage-report` | Protected (`admin` role) | Execute aggregation pipeline on `Generation` collection |

---

## 🧪 Postman Collection

The file `CareerCoach_Postman_Collection.json` is located in the root directory.

### How to use:
1. Open Postman.
2. Click **Import** and select `CareerCoach_Postman_Collection.json`.
3. The collection includes 4 folders:
   - `1. Authentication`: Register User/Admin, Login User/Admin, Refresh Token, Logout.
   - `2. Candidate Profile`: Upsert Profile, Get Profile.
   - `3. AI Generation (Rate-Limited)`: Generate Resume, Generate Interview, Get History.
   - `4. Admin Analytics (RBAC Protected)`: Admin Usage Report.
4. The login requests include **Test Scripts** that automatically capture `accessToken` and `refreshToken` and save them into the collection variables for subsequent requests.

---

## 🛡️ Database Indexing & Aggregation Details

### Compound Index on `Generation`
```javascript
generationSchema.index({ userId: 1, createdAt: -1 });
```
- Accelerates the `/api/generate/history` query (`.sort({ createdAt: -1 })`).
- Optimizes the 24-hour rate limiter query (`Generation.countDocuments({ userId, createdAt: { $gte: past24Hours } })`).

### Aggregation Pipeline in `adminController.js`
```javascript
[
  {
    $group: {
      _id: '$userId',
      totalGenerations: { $sum: 1 },
      resumeCount: { $sum: { $cond: [{ $eq: ['$type', 'resume'] }, 1, 0] } },
      interviewCount: { $sum: { $cond: [{ $eq: ['$type', 'interview'] }, 1, 0] } },
      lastGeneratedAt: { $max: '$createdAt' }
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'userInfo'
    }
  },
  { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      userId: '$_id',
      name: { $ifNull: ['$userInfo.name', 'Deleted / Inactive User'] },
      email: { $ifNull: ['$userInfo.email', 'N/A'] },
      role: { $ifNull: ['$userInfo.role', 'user'] },
      totalGenerations: 1,
      resumeCount: 1,
      interviewCount: 1,
      lastGeneratedAt: 1
    }
  },
  { $sort: { totalGenerations: -1 } }
]
```
