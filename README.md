# Sydney Event Aggregation Platform

A full-stack MERN application that aggregates events from multiple sources (Eventbrite, TimeOut) for Sydney, Australia.

## Features

- **Event Scraping** - Automated scraping from Eventbrite and TimeOut Sydney
- **Auto Updates** - Scheduled cron jobs refresh events every 6 hours
- **Status Tracking** - Events marked as new, updated, inactive, or imported
- **Public Event Listing** - Beautiful card-based UI for browsing events
- **Ticket Flow** - Email capture with consent before redirecting to tickets
- **Google OAuth** - Secure admin dashboard access
- **Dashboard** - Filter, search, and import events to your platform

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB |
| Auth | Google OAuth (Passport.js) |
| Scraping | Puppeteer, Cheerio |
| Scheduler | node-cron |

---

## Project Structure

```
├── backend/
│   ├── config/         # Passport.js OAuth config
│   ├── jobs/           # Cron scheduler
│   ├── middleware/     # Auth middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── scrapers/       # Eventbrite & TimeOut scrapers
│   ├── utils/          # Diff logic for status tracking
│   └── server.js       # Express app entry
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # Auth context
│   │   └── pages/      # Home, Dashboard, Login
│   └── index.html
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud Console project with OAuth credentials

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sydney-events
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your-random-session-secret
FRONTEND_URL=http://localhost:5173
CRON_SCHEDULE=0 */6 * * *
```

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to your `.env`

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 5. Initial Scrape

Run the scraper manually to populate initial data:

```bash
cd backend
npm run scrape
```

Or trigger via API (when logged in):
```bash
curl -X POST http://localhost:5000/api/scrape/trigger
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events with filters |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/ticket-requests` | Submit email for tickets |

### Protected (requires login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/dashboard` | All events for dashboard |
| POST | `/api/events/:id/import` | Import event to platform |
| POST | `/api/scrape/trigger` | Trigger manual scrape |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Start OAuth flow |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/logout` | Logout |

---

## Event Status Flow

```
Scraped → NEW
           ↓ (data changed)
        UPDATED
           ↓ (admin imports)
        IMPORTED
           
Scraped → (not found for 7 days)
        INACTIVE
```

---

## Deployment

### Railway / Render

1. Create separate services for frontend and backend
2. Set environment variables in dashboard
3. Update `GOOGLE_CALLBACK_URL` to production URL
4. Update `FRONTEND_URL` to production URL

### Vercel (Frontend only)

1. Deploy frontend to Vercel
2. Update `vite.config.js` proxy to point to backend URL
3. Or use environment variable for API base URL

---

## Cron Schedule

Default: Every 6 hours (`0 */6 * * *`)

Customize in `.env`:
```env
CRON_SCHEDULE=0 */12 * * *  # Every 12 hours
CRON_SCHEDULE=0 0 * * *     # Daily at midnight
```

---

## License

MIT
