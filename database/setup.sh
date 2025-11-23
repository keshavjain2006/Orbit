#!/bin/bash
# Database Setup Script
# This script sets up the PostgreSQL database for the proximity app

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PostgreSQL Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed or psql is not in PATH${NC}"
    exit 1
fi

# Get database name (default: proximity_app)
DB_NAME=${1:-proximity_app}

echo -e "${GREEN}Setting up database: ${DB_NAME}${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${BLUE}Database ${DB_NAME} already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Dropping database ${DB_NAME}...${NC}"
        dropdb "$DB_NAME" || true
    else
        echo -e "${BLUE}Using existing database${NC}"
    fi
fi

# Create database if it doesn't exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}Creating database ${DB_NAME}...${NC}"
    createdb "$DB_NAME"
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run migrations in order
echo -e "${GREEN}Running schema migration...${NC}"
psql -d "$DB_NAME" -f "$SCRIPT_DIR/01_schema.sql"

echo -e "${GREEN}Creating indexes...${NC}"
psql -d "$DB_NAME" -f "$SCRIPT_DIR/02_indexes.sql"

echo -e "${GREEN}Creating functions and example queries...${NC}"
psql -d "$DB_NAME" -f "$SCRIPT_DIR/03_example_queries.sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}To connect to the database:${NC}"
echo -e "  psql -d ${DB_NAME}"
echo ""
echo -e "${BLUE}To test the setup:${NC}"
echo -e "  psql -d ${DB_NAME} -c \"SELECT COUNT(*) FROM users;\""

