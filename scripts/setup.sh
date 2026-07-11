#!/bin/bash
echo "Installing dependencies via pnpm..."
pnpm install
echo "Starting local MySQL via Docker..."
docker-compose -f docker/docker-compose.yml up -d
echo "Setup complete. Database is running on port 3306."
