#!/bin/bash

echo "🛑 Stopping all services..."

# Stop Docker containers
echo "📦 Stopping Docker infrastructure..."
docker-compose down

echo "✅ All services stopped!"
echo ""
echo "To remove volumes (database data), run:"
echo "docker-compose down -v"
