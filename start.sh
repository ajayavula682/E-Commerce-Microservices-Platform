#!/bin/bash

echo "🚀 Starting E-Commerce Microservices Platform..."
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo "✅ Existing containers stopped"
echo ""

# Clean Maven build artifacts
echo "🧹 Cleaning Maven build artifacts..."
mvn clean -q
echo "✅ Maven clean completed"
echo ""

# Start infrastructure
echo "📦 Starting Docker infrastructure (MySQL, Kafka, Zookeeper, Redis)..."
docker-compose up -d

echo "⏳ Waiting for infrastructure services to be healthy..."
sleep 15

# Build all services with Docker
echo "🔨 Building Docker images for all microservices..."
docker-compose build --no-cache

echo "✅ Docker images built successfully!"
echo ""

# Start all services
echo "🚀 Starting all microservices..."
docker-compose up -d

echo "⏳ Waiting for all services to start..."
sleep 10

# Verify all services are running
echo ""
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Service URLs:"
echo "   - Eureka Dashboard: http://localhost:8761"
echo "   - API Gateway: http://localhost:8080"
echo "   - Product Service: http://localhost:8081"
echo "   - Order Service: http://localhost:8082"
echo "   - Inventory Service: http://localhost:8083"
echo "   - Payment Service: http://localhost:8084"
echo "   - Auth Service: http://localhost:8085"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs: docker-compose logs -f [service-name]"
echo "   - Stop services: ./stop.sh"
echo "   - View running services: docker-compose ps"
echo ""
