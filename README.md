# EventSphere — Full-Stack Event Discovery & Management Platform

EventSphere is a full-stack event discovery, registration, and management platform built with React 19, Vite, React Router, Node.js, Express, and MySQL (`mysql2`). It features role-based access control (User/Attendee, Organizer, Admin), transaction-safe concurrency locks for event registration, and live database persistence backed by a local MySQL database (`EventSphere_local`).

---

## 1. Project Architecture

The repository is organized into distinct, clean workspaces:

```text
EventSphere/
├── frontend/                          # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/                # Reusable layout & UI cards (Navbar, Sidebar, Topbar, ProtectedRoute)
│   │   ├── context/                   # AuthContext (HTTP-only session) & ToastContext
│   │   ├── pages/                     # Public, Attendee, Organizer, Admin, & Utility pages
│   │   ├── services/                  # Centralized apiClient, authService, eventService, bookingService, userService
│   │   ├── App.jsx                    # Client-side routing, protected guards & entry flow
│   │   └── index.css                  # Core design tokens, gradients, and typography
│   ├── .env.example                   # Frontend environment template
│   └── package.json                   # Frontend scripts and dependencies
│
├── backend/                           # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                    # Environment variables and MySQL connection pooling
│   │   ├── controllers/               # Request handlers for auth, events, registrations, organizer, admin
│   │   ├── database/                  # Migration runner (migrate.js) and seed runner (seed.js)
│   │   ├── middleware/                # JWT authentication, role authorization, rate limiter, errors
│   │   ├── routes/                    # Modular Express routers mounted under /api
│   │   ├── services/                  # Business logic with transaction locks & Zod validation
│   │   ├── validators/                # Zod schema definitions
│   │   ├── app.js                     # Express app with Helmet, CORS, and centralized errors
│   │   └── server.js                  # HTTP server entrypoint
│   ├── migrations/                    # Versioned SQL migrations (001_create_tables.sql)
│   ├── seeds/                         # Dynamic JavaScript seed data (seedData.js)
│   ├── tests/                         # Vitest & Supertest automated test suite (44 tests)
│   ├── .env.example                   # Backend environment template
│   └── package.json                   # Backend scripts and dependencies
│
├── database/                          # Editable SQL Files & Database Administration
│   ├── schema.sql                     # Complete DDL schema to recreate database and tables
│   ├── seed.sql                       # Complete SQL seed dataset (11 users, 25 events, categories)
│   ├── README.md                      # Comprehensive database administration documentation
│   └── migrations/
│       ├── 001_initial_schema.sql     # Versioned incremental migration
│       └── 001_create_tables.sql      # Initial schema table creation
│
├── .gitignore                         # Ignores .env, node_modules, dist, logs, and coverage
├── package.json                       # Root workspace task runner
└── README.md                          # Architecture, setup, API, and troubleshooting guide
```

---

## 2. Prerequisites & Local MySQL Requirements

- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **npm**: v9.0.0 or later
- **MySQL Server**: 8.0+ or MySQL Community Server (e.g. 8.4 or 9.x) running locally on port 3306

To start the local MySQL service:
```bash
# macOS (Homebrew)
brew services start mysql

# Ubuntu / Debian Linux
sudo systemctl start mysql

# Windows
net start MySQL80
```

---

## 3. Environment Variables Setup

### Backend Configuration (`backend/.env`)

Copy the example environment file if not already present:
```bash
cp backend/.env.example backend/.env
```

Configure your local MySQL credentials:
```ini
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Local MySQL Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_NAME=EventSphere_local
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Authentication & Session Security
JWT_SECRET=EventSphere_dev_jwt_secret_replace_in_production_key_12345
JWT_EXPIRES_IN=7d
COOKIE_NAME=eventsphere_token
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### Frontend Configuration (`frontend/.env`)

```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 4. Database Setup, Migrations & Seeds

### Option A: Direct SQL Import (Fastest & Standalone)

You can inspect, edit, and directly import the SQL files using the standard MySQL CLI:

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`EventSphere_local\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Import schema.sql
mysql -u root -p EventSphere_local < database/schema.sql

# 3. Import seed.sql
mysql -u root -p EventSphere_local < database/seed.sql
```

### Option B: Node.js Automated Commands

Alternatively, execute the project migration and seed runners:

```bash
# Run incremental migrations
npm run migrate

# Run development seed script
npm run seed
```

*(Note: `npm run migrate` and `npm run seed` can also be run from the repository root or inside `backend/`).*

---

## 5. Development Accounts & Default Passwords

All 11 seeded development accounts use the unified local development password:
```text
EventSphereLocal!2026
```

### A. Attendees (5 Accounts)
| Name | Email Address | Role | Profile Summary |
|---|---|---|---|
| Aarav Sharma | `attendee1@EventSphere.local` | `attendee` | Software engineer keen on tech conferences & AI summits |
| Diya Patel | `attendee2@EventSphere.local` | `attendee` | UX designer passionate about typography & cultural events |
| Rohan Mehta | `attendee3@EventSphere.local` | `attendee` | Marathon runner, outdoor enthusiast, & tech meetups |
| Ananya Iyer | `attendee4@EventSphere.local` | `attendee` | Classical concert attendee & book reading club organizer |
| Kabir Verma | `attendee5@EventSphere.local` | `attendee` | Entrepreneur & venture community participant |

### B. Organizers (5 Accounts — 5 Events Owned Each)
| Organization / Name | Email Address | Role | Specialization |
|---|---|---|---|
| TechNova Global Pvt Ltd | `organizer1@EventSphere.local` | `organizer` | Cloud, AI, and developer summits |
| CulturePulse Arts Foundation | `organizer2@EventSphere.local` | `organizer` | Contemporary art galas, heritage walks & exhibitions |
| SoundWave Live Entertainment | `organizer3@EventSphere.local` | `organizer` | Acoustic gigs, indie festivals & live concerts |
| Apex Sports Arena & Ventures | `organizer4@EventSphere.local` | `organizer` | Marathons, morning yoga & fitness tournaments |
| Inspire Learning Foundation | `organizer5@EventSphere.local` | `organizer` | Executive speaking, design masterclasses & bootcamps |

### C. Administrator (1 Account)
| Name | Email Address | Role | Scope |
|---|---|---|---|
| EventSphere Platform Admin | `admin@EventSphere.local` | `admin` | System-wide moderation, user toggle, & platform metrics |

---

## 6. Seeded Events Dataset (25 Events)

The database seed provisions **exactly 25 events** with **5 events owned by each organizer**:
- **5 Past Events**: Completed events with historical dates (`evt-org1-1`, `evt-org2-1`, `evt-org3-1`, `evt-org4-1`, `evt-org5-1`).
- **3 Today's Events**: Live events scheduled for the current system date (`evt-org3-2`, `evt-org4-2`, `evt-org5-2`).
- **17 Future Events**: Upcoming events distributed across upcoming weeks.

---

## 7. Authentication, Entry Flow & Session Handling

### A. Application Entry Flow (`/` & `/home`)

When opening the website, the application determines the starting page based on the actual authentication session verified through the backend (`/api/auth/me`):

1. **Unauthenticated Visitor**:
   - The loading spinner briefly displays during session resolution.
   - Session check returns HTTP 401 (no valid cookie).
   - Redirects to the **Sign-In Page** (`/login`).
   - Does not render protected dashboards, user info, or false authorization errors.

2. **Authenticated Attendee**:
   - Session restored and user profile fetched from `/api/auth/me`.
   - Opens the **Public Event Discovery Home Page** (`/`).
   - Does **NOT** redirect the attendee automatically to My Dashboard.
   - Preserves access to permitted attendee features (Browse events, register, view personal bookings, profile).

3. **Authenticated Organizer**:
   - Session restored from `/api/auth/me`.
   - Automatically navigates to **Organizer Home** (`/organizer/events`).
   - Preserves access to authorized organizer features.

4. **Authenticated Administrator**:
   - Session restored from `/api/auth/me`.
   - Automatically navigates to **Admin Dashboard** (`/admin/dashboard`).
   - Preserves access to authorized administrator features.

### B. Route Protection & Authorization

- **Frontend Route Protection (`ProtectedRoute.jsx`)**:
  - Unauthenticated access to protected routes (`/attendee/*`, `/organizer/*`, `/admin/*`, `/notifications`, `/settings`, `/events/:id/register`) redirects to `/login?redirect=...`.
  - Attendees attempting to access organizer or admin routes receive an explicit `403 Access Forbidden` screen with a return link to their home page.
  - After logging in, `isRouteAllowedForRole` validates whether the intended destination is permitted for the authenticated role. If forbidden, the user is safely sent to their role home page instead of getting trapped in a 403 error.
- **Backend API Protection (`authenticate.js` & `authorize.js`)**:
  - Independent server-side enforcement: missing or invalid session cookie/token returns `401 Unauthorized`.
  - Insufficient role permission returns `403 Forbidden`.

### C. Logout Behavior from Every Page

Logout is accessible from every authenticated page via:
- Public header (`Navbar.jsx`) for attendee pages.
- Dashboard topbar (`Topbar.jsx`) and sidebar (`Sidebar.jsx`) for dashboard pages.

When clicking **Logout**:
1. Frontend dispatches `POST /api/auth/logout` to the backend.
2. Backend clears the HTTP-only cookie using matching options (`httpOnly`, `secure`, `sameSite: lax`, `path: '/'`).
3. Local cached data (`eventsphere_auth_user`, `eventsphere_bookings`, `eventsphere_notifications`, `sessionStorage`) is purged.
4. `AuthContext` state is reset (`user = null`, `authStatus = 'unauthenticated'`).
5. A confirmation toast message (*"You have been logged out successfully."*) is displayed.
6. The user is redirected to `/login` using `replace: true`, preventing browser Back button access.

---

## 8. Safe SQL Evolution Workflow

To keep editable `.sql` files and your live MySQL database consistent:

1. **Create an incremental migration**:
   Add a new versioned file in `database/migrations/`, e.g. `database/migrations/002_add_event_tags.sql`.
2. **Review the migration**:
   Ensure non-destructive SQL (`ALTER TABLE ... ADD COLUMN ...`).
3. **Back up the database**:
   ```bash
   mysqldump -u root -p EventSphere_local > database/backup_$(date +%Y%m%d).sql
   ```
4. **Execute migration against local database**:
   ```bash
   npm run migrate
   ```
5. **Update cumulative `database/schema.sql`**:
   Keep `database/schema.sql` up to date with the latest table structures.
6. **Update application code & run tests**:
   ```bash
   npm test
   npm run build
   ```

### Backup & Restore Instructions

```bash
# Backup database
mysqldump -u root -p --single-transaction --quick EventSphere_local > database/backup.sql

# Restore database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`EventSphere_local\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p EventSphere_local < database/backup.sql
```

---

## 9. Application Startup Commands

### Run Everything Concurrently

```bash
# Terminal 1: Backend API (port 5000)
npm run dev:backend

# Terminal 2: Frontend Client (port 5173)
npm run dev:frontend
```

Open your browser at `http://localhost:5173`.

---

## 10. Automated Testing

Run the complete test suite (44 automated tests across API, auth lifecycle, and database verification):

```bash
# Run backend vitest suite
npm test

# Run frontend production build validation
npm run build

# Run frontend linting
npm run lint:frontend
```

---

## 11. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate credentials with role validation & set HTTP-only cookie
- `POST /api/auth/register` — Register Attendee or Organizer
- `POST /api/auth/logout` — Clear authentication cookie and invalidate session
- `GET /api/auth/me` — Return authenticated user profile (401 if unauthenticated)
- `GET /api/auth/demo-accounts` — Return sample development account emails

### Events (`/api/events`)
- `GET /api/events` — List published events with search, category, city, and date filters
- `GET /api/events/:id` — Get single event by ID or slug
- `POST /api/events` — Create event (Organizer & Admin only)
- `PUT /api/events/:id` — Update event (Owner only)
- `PATCH /api/events/:id/status` — Update event status (Draft, Published, Cancelled)
- `DELETE /api/events/:id` — Delete event

### Registrations (`/api/registrations`)
- `POST /api/registrations/events/:id/register` — Register for event with concurrency lock
- `GET /api/registrations/me` — List current attendee's registrations
- `DELETE /api/registrations/:id` — Cancel registration

### Organizer (`/api/organizer`)
- `GET /api/organizer/dashboard` — Live organizer metrics from MySQL
- `GET /api/organizer/events` — List events owned by authenticated organizer
- `GET /api/organizer/events/:id/attendees` — List registered attendees for organizer's event

### Admin (`/api/admin`)
- `GET /api/admin/dashboard` — System-wide metrics (users, events, date distribution, bookings)
- `GET /api/admin/users` — List all platform users with role filters
- `PATCH /api/admin/users/:id/status` — Toggle user status (`active` / `suspended`)
- `GET /api/admin/events` — List all events for platform moderation
