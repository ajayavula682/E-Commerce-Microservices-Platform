#!/bin/bash

echo "🔄 Performing a COMPLETE FRESH RESTART of E-Commerce Platform..."
echo ""
echo "⚠️  WARNING: This will:"
echo "   - Stop all running containers"
echo "   - Remove all Docker volumes (database data will be lost)"
echo "   - Clean Maven artifacts"
echo "   - Rebuild everything from scratch"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restart cancelled."
    exit 1
fi

echo ""
echo "🛑 Stopping all containers..."
docker-compose down -v 2>/dev/null || true

echo "🧹 Cleaning Maven artifacts..."
mvn clean -q

echo "🗑️  Removing unused Docker resources..."
docker system prune -f 2>/dev/null || true

echo "✅ Cleanup completed!"
echo ""
echo "🚀 Starting fresh..."
echo ""

# Now run the normal start sequence
bash start.sh

