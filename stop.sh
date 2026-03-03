#!/bin/bash

echo "🛑 Stopping E-Commerce Microservices Platform..."
echo ""

# Stop Docker containers
echo "📦 Stopping Docker containers and services..."
docker-compose down

echo "✅ All containers stopped!"
echo ""

# Show available options
echo "🧹 Cleanup Options:"
echo ""
echo "To remove ALL data and volumes (WARNING - deletes database):"
echo "  docker-compose down -v"
echo ""
echo "To remove stopped containers and unused images:"
echo "  docker system prune -f"
echo ""
echo "To remove all unused images, containers, and volumes:"
echo "  docker system prune -a -f"
echo ""
echo "To view running containers:"
echo "  docker-compose ps"
echo ""
