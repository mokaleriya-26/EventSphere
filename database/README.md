# EventSpear Database Management & SQL Guide

This directory contains the editable SQL files, migrations, and seed scripts for the local EventSpear MySQL database.

---

## Directory Structure

```text
EventSpear/
├── database/
│   ├── schema.sql                     # Complete DDL schema to recreate database and tables
│   ├── seed.sql                       # Complete SQL seed dataset (11 users, 25 events, categories)
│   ├── manage.sql                     # Interactive management SQL workbench for MySQL extension / IDE
│   ├── README.md                      # Comprehensive database administration documentation
│   └── migrations/
│       └── 001_create_tables.sql      # Versioned incremental migration
```

---

## Files Overview

| File | Purpose |
| :--- | :--- |
| `database/schema.sql` | The single editable source of truth for the complete table schema (`users`, `categories`, `events`, `registrations`, `notifications`, `_migrations`). Includes foreign keys, indexes, UTF8MB4 collations, and default constraints. |
| `database/seed.sql` | SQL seed script containing development records: 8 active categories, 11 authenticated accounts (5 attendees, 5 organizers, 1 platform administrator), 25 events (5 past, 3 today, 17 future; 5 owned by each organizer), registrations, and initial notifications. Passwords use bcrypt hashes for `EventSpearLocal!2026`. |
| `database/manage.sql` | Ready-to-run queries for inspecting tables, viewing user roles, filtering events by date, and performing administrative tasks directly in VS Code / MySQL extension. |
| `database/migrations/` | Versioned incremental SQL scripts executed by the automated migration runner (`npm run migrate`). |

---

## Local Development Accounts

All local seed accounts are provisioned with the standard local development password:

> **Development Password:** `EventSpearLocal!2026`

| Role | Account Email | Name / Organization | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eventspear.local` | EventSpear Platform Admin | Master moderation, user management, and ecosystem overview |
| **Attendee 1** | `attendee1@eventspear.local` | Aarav Sharma | Tech enthusiast & conference attendee |
| **Attendee 2** | `attendee2@eventspear.local` | Diya Patel | UX designer & cultural event attendee |
| **Attendee 3** | `attendee3@eventspear.local` | Rohan Mehta | Fitness & marathon participant |
| **Attendee 4** | `attendee4@eventspear.local` | Ananya Iyer | Music gigs & literature attendee |
| **Attendee 5** | `attendee5@eventspear.local` | Kabir Verma | Startup networking participant |
| **Organizer 1** | `organizer1@eventspear.local` | TechNova Global Pvt Ltd | Cloud, AI, and developer summit management |
| **Organizer 2** | `organizer2@eventspear.local` | CulturePulse Arts Foundation | Art galas, heritage walks, and design exhibitions |
| **Organizer 3** | `organizer3@eventspear.local` | SoundWave Live Entertainment | Acoustic concerts, jazz festivals, and live music |
| **Organizer 4** | `organizer4@eventspear.local` | Apex Sports Arena & Ventures | Marathons, morning yoga, and sports tournaments |
| **Organizer 5** | `organizer5@eventspear.local` | Inspire Learning Foundation | Executive speaking and skills workshops |

---

## Step-by-Step Database Setup

### 1. Prerequisites
Ensure MySQL 8.x is running on your machine:
```bash
# macOS (Homebrew)
brew services start mysql
```

### 2. Configure Environment Variables
Verify your connection parameters in `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventspear_local
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 3. Create the Database
Connect using MySQL CLI and initialize the database:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`eventspear_local\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Import the Schema
Import the full schema file:
```bash
mysql -u root -p eventspear_local < database/schema.sql
```
Alternatively, apply migrations through Node.js:
```bash
npm run migrate
```

### 5. Load Seed Data
Import the SQL seed file:
```bash
mysql -u root -p eventspear_local < database/seed.sql
```
Or run the dynamic Node.js seed script (which updates dates relative to current date):
```bash
npm run seed
```

---

## Verifying Database Contents

To verify that all required tables and records exist:

```bash
# Check tables
mysql -u root -p eventspear_local -e "SHOW TABLES;"

# Count users by role
mysql -u root -p eventspear_local -e "SELECT role, COUNT(*) AS count FROM users GROUP BY role;"

# Verify 25 events distribution by organizer and status
mysql -u root -p eventspear_local -e "SELECT organizer_id, status, COUNT(*) AS event_count FROM events GROUP BY organizer_id, status ORDER BY organizer_id;"

# Check categories
mysql -u root -p eventspear_local -e "SELECT id, name, slug FROM categories;"
```

---

## Safe Schema Evolution Workflow

When modifying tables or adding new features:

1. **Create an Incremental Migration:**
   Add a new versioned file in `database/migrations/`, e.g., `002_add_event_tags.sql`.
2. **Review the Migration SQL:**
   Ensure non-destructive queries with safe defaults (`ALTER TABLE ... ADD COLUMN ...`).
3. **Back Up Before Applying:**
   Take a quick dump of your local database:
   ```bash
   mysqldump -u root -p eventspear_local > database/backup_$(date +%Y%m%d_%H%M%S).sql
   ```
4. **Execute Migration:**
   Run:
   ```bash
   npm run migrate
   ```
5. **Update `database/schema.sql`:**
   Keep `schema.sql` updated with the cumulative schema so new environments can bootstrap instantly from a single file.
6. **Update Application Code & Tests:**
   Update frontend models, backend services/validators, and execute tests:
   ```bash
   npm --prefix backend test
   npm --prefix frontend run build
   ```

---

## Backup & Restore Commands

### Database Backup (Dump)
```bash
mysqldump -u root -p \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  eventspear_local > database/backup.sql
```

### Database Restore
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`eventspear_local\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p eventspear_local < database/backup.sql
```

---

## Viewing & Managing via MySQL Extension (VS Code / IDE)

To view and manage the database visually in your IDE using any MySQL Extension (e.g., **Database Client**, **MySQL by Weijan Chen**, or **MySQL Shell**):

### Connection Configuration:
- **Host / Server:** `localhost` (or `127.0.0.1`)
- **Port:** `3306`
- **Username:** `root`
- **Password:** `Chiurm@26` (or the `DB_PASSWORD` set in `backend/.env`)
- **Database / Schema:** `eventspear_local`

### Steps in the Extension:
1. Open the Database extension tab in the sidebar (cylinder/database icon).
2. Click **Create Connection** / **+ Add**.
3. Select **MySQL** and enter the details above.
4. Click **Connect** (or Save).
5. In the schemas list, expand **`eventspear_local`** ➔ **`Tables`**.
   *(If not visible immediately, right-click and select **Refresh**).*
6. Open [`database/manage.sql`](file:///Users/riyamokale/Documents/Riya/CCL%20Project/DonorConnect/database/manage.sql) to run any query directly with `Cmd+Enter` / `Ctrl+Enter`.

---

## One-Command Database Management Tools

You can also inspect, reset, and backup the database anytime using root NPM commands:

```bash
# Check connection and print row counts for all tables
npm run db:status

# Full reset: recreates schema from database/schema.sql and runs seed scripts
npm run db:reset

# Create an automated SQL snapshot dump in database/backups/
npm run db:backup
```
