#!/bin/bash

# =====================================================
# Farlandet.dk Database Setup Script
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Farlandet.dk Database Setup${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env fil ikke fundet. Kopierer fra .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Husk at opdatere database credentials i .env filen!${NC}"
    echo ""
fi

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-farlandet}
DB_USER=${DB_USER:-postgres}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Indtast database password for $DB_USER:${NC}"
    read -s DB_PASSWORD
    export PGPASSWORD=$DB_PASSWORD
else
    export PGPASSWORD=$DB_PASSWORD
fi

echo ""

# Test database connection
echo -e "${YELLOW}🔍 Tester database forbindelse...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database forbindelse OK${NC}"
else
    echo -e "${RED}✗ Kunne ikke forbinde til database${NC}"
    echo -e "${RED}  Tjek venligst dine credentials og at PostgreSQL kører${NC}"
    exit 1
fi

# Check if database exists
echo -e "${YELLOW}🔍 Tjekker om database '$DB_NAME' eksisterer...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${GREEN}✓ Database '$DB_NAME' findes${NC}"
else
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' findes ikke. Opretter...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Database '$DB_NAME' oprettet${NC}"
fi

echo ""

# Ask if user wants to run migrations
echo -e "${YELLOW}Vil du køre database migrations? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[jJ])$ ]]; then
    echo -e "${YELLOW}📦 Kører database migrations...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_initial_schema.sql
    echo -e "${GREEN}✓ Migrations kørt succesfuldt${NC}"
else
    echo -e "${YELLOW}⏭️  Springer migrations over${NC}"
fi

echo ""

# Ask if user wants to run seeds
echo -e "${YELLOW}Vil du køre seed data (kategorier, tags, demo content)? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[jJ])$ ]]; then
    echo -e "${YELLOW}🌱 Kører seed data...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/seeds/001_seed_data.sql
    echo -e "${GREEN}✓ Seed data indsat succesfuldt${NC}"
else
    echo -e "${YELLOW}⏭️  Springer seed data over${NC}"
fi

echo ""

# Verify setup
echo -e "${YELLOW}🔍 Verificerer database setup...${NC}"
echo ""

# Count tables
TABLES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")
echo "  Tabeller oprettet: $TABLES"

# Count categories
CATEGORIES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM categories" 2>/dev/null || echo "0")
echo "  Kategorier: $CATEGORIES"

# Count tags
TAGS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM tags" 2>/dev/null || echo "0")
echo "  Tags: $TAGS"

# Count resources
RESOURCES=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM resources" 2>/dev/null || echo "0")
echo "  Resources: $RESOURCES"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Database setup fuldført!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Næste skridt:"
echo "  1. Opdater .env fil med DATABASE_URL"
echo "  2. Kør 'npm run dev' for at starte serveren"
echo "  3. Tilgå http://localhost:5173"
echo ""
