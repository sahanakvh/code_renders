# Ayur Flow Sutra - Ayurvedic Therapy Management System

A comprehensive web application for managing Ayurvedic therapy sessions, patient records, and therapist schedules.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

### For All Platforms:
- Node.js (v18 or higher)
- npm or bun package manager
- Git
- PostgreSQL (v13 or higher)

## 🚀 Complete Setup Guide

### Step 1: Install Node.js

#### macOS:
```bash
# Using Homebrew (recommended)
brew install node

# Or download from official website
# Visit: https://nodejs.org/
```

#### Windows:
1. Visit [Node.js official website](https://nodejs.org/)
2. Download the Windows Installer (.msi)
3. Run the installer and follow the setup wizard
4. Verify installation:
```cmd
node --version
npm --version
```

### Step 2: Install PostgreSQL

#### macOS:
```bash
# Using Homebrew (recommended)
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create the postgres superuser (required for setup script)
createuser -s postgres

# Set password for postgres user (remember this password!)
psql -U $(whoami) -d postgres -c "ALTER USER postgres PASSWORD 'your_postgres_password';"

# Note: Your system user (vivek.m) will be used for database access
# No additional database user creation is needed

# Verify installation
psql --version
```

#### Windows:
1. Visit [PostgreSQL official website](https://www.postgresql.org/download/windows/)
2. Download the Windows installer
3. Run the installer and follow these steps:
   - Choose installation directory (default is fine)
   - Select components (keep all selected)
   - Set data directory (default is fine)
   - **IMPORTANT**: Set a password for the 'postgres' superuser (remember this!)
   - Use default port 5432
   - Use default locale
4. Add PostgreSQL to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Add `C:\Program Files\PostgreSQL\15\bin` to PATH
5. Verify installation:
```cmd
psql --version
```

### Step 3: Clone the Repository

```bash
git clone <your-repository-url>
cd ayur-flow-sutra
```

### Step 4: Install Bun (Optional but Recommended)

#### macOS/Linux:
```bash
curl -fsSL https://bun.sh/install | bash
```

#### Windows:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Step 5: Set Up the Database

#### Option 1: Use Automated Setup Scripts (Recommended)

**Important**: Before running the setup script, ensure you have:
- PostgreSQL installed and running
- The `postgres` superuser created (see Step 2)
- The password for the `postgres` user

**macOS/Linux:**
```bash
# Navigate to project root
cd /path/to/ayur-flow-sutra

# Run the automated setup script
./setup-database.sh
```

When prompted:
1. Enter the password you set for the `postgres` superuser
   (Note: The script will use your system user `vivek.m` for database access)

**Windows:**
```cmd
# Navigate to project root
cd \path\to\ayur-flow-sutra

# Run the automated setup script
setup-database.bat
```

#### Option 2: Manual Database Setup (if automated script doesn't work)

##### macOS:
```bash
# Connect to PostgreSQL as postgres user
psql -U postgres -h localhost

# In PostgreSQL prompt, run these commands:
CREATE DATABASE ayur_flow_sutra;
GRANT ALL PRIVILEGES ON DATABASE ayur_flow_sutra TO vivek.m;
ALTER USER vivek.m CREATEDB;

# Exit PostgreSQL
\q
```

##### Windows:
```cmd
# Connect to PostgreSQL (you'll be prompted for the postgres password you set during installation)
psql -U postgres -h localhost

# In PostgreSQL prompt, run these commands:
CREATE DATABASE ayur_flow_sutra;
GRANT ALL PRIVILEGES ON DATABASE ayur_flow_sutra TO vivek.m;
ALTER USER vivek.m CREATEDB;

# Exit PostgreSQL
\q
```

#### Initialize Database Schema (if using manual setup)

```bash
# Navigate to project root
cd /path/to/ayur-flow-sutra

# Run the database schema
psql -U vivek.m -d ayur_flow_sutra -f database/schema.sql

# Optional: Load seed data
psql -U vivek.m -d ayur_flow_sutra -f database/seed.sql
```

### Step 6: Configure Environment Variables

#### Backend Configuration

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file:
```bash
# Copy the example (if it exists) or create new
cp .env.example .env
# OR create new file
touch .env
```

3. Add the following configuration to `backend/.env`:
```env
# Environment Configuration
NODE_ENV=development
PORT=3003

# Database Configuration
DATABASE_URL=postgresql://vivek.m:@localhost:5432/ayur_flow_sutra
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ayur_flow_sutra
DB_USER=vivek.m
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:8081
```

#### Frontend Configuration (if needed)

1. Navigate to the frontend directory:
```bash
cd ..  # Go back to project root
```

2. Create a `.env` file in the root directory if API endpoints need configuration:
```bash
touch .env
```

3. Add frontend environment variables (if needed):
```env
VITE_API_BASE_URL=http://localhost:3003
```

### Step 7: Install Dependencies

#### Install Root Dependencies
```bash
# Using npm
npm install

# OR using bun (recommended for faster installation)
bun install
```

#### Install Backend Dependencies
```bash
cd backend
npm install
# OR
bun install
```

### Step 8: Build and Start the Application

#### Option 1: Quick Start (Recommended for development)

**macOS/Linux:**
```bash
# Start both frontend and backend with one command
./start-dev.sh
```

**Windows:**
```cmd
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2 - new window/tab)
cd ..
npm run dev
```

#### Option 2: Manual Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
# OR
bun run dev
```

**Terminal 2 - Start Frontend:**
```bash
# In project root
npm run dev
# OR
bun run dev
```

#### Option 3: Production Mode

**Build Backend:**
```bash
cd backend
npm run build
npm start
# OR
bun run build
bun start
```

**Build Frontend:**
```bash
# In project root
npm run build
npm run preview
# OR
bun run build
bun run preview
```

### Step 9: Verify Installation

1. **Backend API**: Open http://localhost:3003 in your browser
   - You should see a basic API response or "Cannot GET /" message

2. **Frontend**: Open http://localhost:8081 in your browser
   - You should see the Ayur Flow Sutra application login page

3. **Database Connection**: Check backend logs for successful database connection

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

**Error**: "ECONNREFUSED" or "connection refused"
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Windows:
services.msc (look for PostgreSQL service)

# Restart PostgreSQL
# macOS:
brew services restart postgresql

# Windows:
net stop postgresql-x64-15
net start postgresql-x64-15
```

**Error**: "password authentication failed"
- Double-check your database credentials in the `.env` file
- Ensure the user `vivek.m` has proper database permissions
- If needed, reconnect and grant permissions:
```sql
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE ayur_flow_sutra TO vivek.m;
```

#### Port Already in Use

**Error**: "EADDRINUSE: address already in use"
```bash
# Find process using the port
# macOS/Linux:
lsof -i :3003
lsof -i :8081

# Windows:
netstat -ano | findstr :3003
netstat -ano | findstr :8081

# Kill the process
# macOS/Linux:
kill -9 <PID>

# Windows:
taskkill /PID <PID> /F
```

#### Node.js Version Issues

**Error**: Compatibility issues
```bash
# Check Node.js version
node --version

# Update Node.js
# macOS:
brew upgrade node

# Windows: Download latest from nodejs.org
```

#### Missing Dependencies

**Error**: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
ayur-flow-sutra/
├── README.md                 # This file
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── backend/                # Backend API
│   ├── package.json        # Backend dependencies
│   ├── src/                # Source code
│   │   ├── index.ts        # Main server file
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   └── .env                # Backend environment variables
├── database/               # Database files
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── contexts/           # React contexts
└── public/                 # Static files
```

## 🔐 Default Test Accounts

After running the seed data, you can use these test accounts:

### Demo Accounts (Password: `password123`)

#### Patient Account
- **Email**: patient@demo.com
- **Password**: password123

#### Therapist Account
- **Email**: therapist@demo.com
- **Password**: password123

### Additional Test Accounts

#### More Patients
- john.smith@email.com
- priya.sharma@email.com
- rajesh.kumar@email.com
- sarah.johnson@email.com

#### More Therapists  
- dr.meera@ayursutra.com
- dr.anand@ayursutra.com
- dr.kavitha@ayursutra.com

*All test accounts use the password: `password123`*

## 🚀 Available Scripts

### Frontend (Root Directory)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
```

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Update JWT_SECRET** to a strong, random value
3. **Use HTTPS** in production
4. **Set up proper firewall rules**
5. **Regular database backups**

## 📞 Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure environment variables are configured properly
4. Check that all services are running (PostgreSQL, Node.js servers)

## �️ Helpful Scripts

The project includes several automation scripts to make development easier:

### Database Setup Scripts
- **`setup-database.sh`** (macOS/Linux) - Automates PostgreSQL database and user creation
- **`setup-database.bat`** (Windows) - Windows equivalent of the database setup script

### Development Scripts
- **`start-dev.sh`** (macOS/Linux) - Starts both frontend and backend servers simultaneously
- **`backend/.env.example`** - Template for backend environment variables

### Usage Examples

```bash
# First-time setup
./setup-database.sh           # Set up database
cp backend/.env.example backend/.env  # Configure environment
npm install && cd backend && npm install  # Install dependencies

# Daily development
./start-dev.sh               # Start everything at once
```

## �🔄 Regular Development Workflow

Once set up, your daily workflow will be:

### Quick Start (Recommended)
```bash
# Start PostgreSQL (if not running as a service)
brew services start postgresql  # macOS
# OR check Windows services for PostgreSQL

# Start both frontend and backend
./start-dev.sh  # macOS/Linux
# OR manually start both in separate terminals (Windows)
```

### Manual Start
1. **Start PostgreSQL** (if not running as a service)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `npm run dev` (from project root)
4. **Access Application**: http://localhost:8081

### Development URLs
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3003

### Stopping Services
- If using `start-dev.sh`: Press `Ctrl+C` in the terminal
- If running manually: Press `Ctrl+C` in each terminal window

## 📦 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Use a production PostgreSQL instance
3. Set strong JWT secrets
4. Enable HTTPS
5. Use a process manager like PM2 for the backend
6. Build and serve the frontend through a web server like Nginx

---

**Happy Coding! 🚀**
