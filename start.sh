#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🏔️  Alpine Peak Resort Operations Manager  🏔️     ║"
echo "║              Starting All Services...               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load .env
set -a
source .env
set +a

# Kill any processes on our ports
echo -e "${YELLOW}Cleaning up ports...${NC}"
lsof -ti:${BACKEND_PORT:-4001} | xargs kill -9 2>/dev/null
lsof -ti:${FRONTEND_PORT:-3000} | xargs kill -9 2>/dev/null
echo -e "${GREEN}Ports cleaned.${NC}"

# Check PostgreSQL
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install it first.${NC}"
    exit 1
fi

# Create database if not exists
echo -e "${YELLOW}Setting up database...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'skiresort'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE skiresort"
psql -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = 'skiresort'" | grep -q 1 || psql -U postgres -c "CREATE USER skiresort WITH PASSWORD 'skiresort123'"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE skiresort TO skiresort"
psql -U postgres -d skiresort -c "GRANT ALL ON SCHEMA public TO skiresort"
echo -e "${GREEN}Database ready.${NC}"

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend && npm install
echo -e "${GREEN}Backend dependencies installed.${NC}"

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend && npm install
echo -e "${GREEN}Frontend dependencies installed.${NC}"

cd ..

# Run seed
echo -e "${YELLOW}Seeding database...${NC}"
cd backend && node src/seed.js
echo -e "${GREEN}Database seeded successfully.${NC}"
cd ..

# Start backend with nodemon (auto-reload)
echo -e "${BLUE}Starting backend on port ${BACKEND_PORT:-4001}...${NC}"
cd backend && npx nodemon src/server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend with BROWSER=none (React auto-reloads via react-scripts)
echo -e "${BLUE}Starting frontend on port ${FRONTEND_PORT:-3000}...${NC}"
cd frontend && BROWSER=none PORT=${FRONTEND_PORT:-3000} npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗"
echo -e "║              All Services Started! 🎿                ║"
echo -e "╠══════════════════════════════════════════════════════╣"
echo -e "║  Frontend:  http://localhost:${FRONTEND_PORT:-3000}                    ║"
echo -e "║  Backend:   http://localhost:${BACKEND_PORT:-4001}                    ║"
echo -e "║  Login:     admin@alpinepeak.com / admin123         ║"
echo -e "╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Handle Ctrl+C
trap "echo -e '\n${RED}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; lsof -ti:${BACKEND_PORT:-4001} | xargs kill -9 2>/dev/null; lsof -ti:${FRONTEND_PORT:-3000} | xargs kill -9 2>/dev/null; echo -e '${GREEN}All services stopped.${NC}'; exit 0" SIGINT SIGTERM

# Wait for processes
wait
