#!/bin/bash

echo "🚀 Starting E-Commerce Microservices Platform..."

# Start infrastructure
echo "📦 Starting Docker infrastructure (MySQL, Kafka, Zookeeper)..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 20

# Build all services
echo "🔨 Building all microservices..."
mvn clean install -DskipTests

echo "✅ Build completed!"

echo ""
echo "📋 Next Steps:"
echo "1. Start Service Registry: cd service-registry && mvn spring-boot:run"
echo "2. Start API Gateway: cd api-gateway && mvn spring-boot:run"
echo "3. Start Product Service: cd product-service && mvn spring-boot:run"
echo "4. Start Order Service: cd order-service && mvn spring-boot:run"
echo "5. Start Inventory Service: cd inventory-service && mvn spring-boot:run"
echo "6. Start Payment Service: cd payment-service && mvn spring-boot:run"
echo ""
echo "🌐 Service URLs:"
echo "   - Eureka Dashboard: http://localhost:8761"
echo "   - API Gateway: http://localhost:8080"
echo ""
