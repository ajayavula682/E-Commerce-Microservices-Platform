# E-Commerce-Microservices-Platform
Distributed E-Commerce system designed with Spring Boot microservices and Kafka-based asynchronous communication, implementing API Gateway, Service Discovery, and database-per-service architecture.

🛒 E-Commerce Microservices Platform (Event-Driven with Kafka)
📌 Overview

This project is a distributed E-Commerce platform built using:

Spring Boot (Microservices Architecture)

Apache Kafka (Event-Driven Communication)

React (Frontend SPA)

MySQL / PostgreSQL (Database per service)

Docker & Docker Compose

The system follows an asynchronous event-driven workflow to process orders, manage inventory, and simulate payment processing.

🏗 Architecture
Microservices

Service Registry – Service discovery using Eureka

API Gateway – Centralized routing

Product Service – Product catalog management

Order Service – Order lifecycle management

Inventory Service – Stock validation and deduction

Payment Service – Payment simulation

Common Library – Shared event contracts

Frontend (React) – User interface

🔄 Event-Driven Order Flow

Order lifecycle:

PENDING 
   ↓
OrderCreatedEvent
   ↓
InventoryReservedEvent
   ↓
PaymentCompletedEvent
   ↓
COMPLETED
Flow Explanation

User places order.

Order Service stores order (PENDING).

Order Service publishes OrderCreatedEvent.

Inventory Service consumes event and reserves stock.

Inventory Service publishes InventoryReservedEvent.

Payment Service consumes event and simulates payment.

Payment Service publishes PaymentCompletedEvent.

Order Service updates order status to COMPLETED.

This design ensures:

Loose coupling

Scalability

Fault tolerance

Asynchronous processing

📁 Project Structure
ecommerce-microservices/
│
├── service-registry
├── api-gateway
├── product-service
├── order-service
├── inventory-service
├── payment-service
├── common-lib
├── frontend
└── docker-compose.yml

Each microservice contains:

controller/
service/
repository/
entity/
dto/
mapper/
event/
config/
exception/
🛠 Technology Stack
Backend

Java 17

Spring Boot

Spring Data JPA

Spring Cloud (Eureka, Gateway)

Spring Kafka

Lombok

MapStruct

Frontend

React

Axios

React Router

Infrastructure

Apache Kafka

Zookeeper

MySQL / PostgreSQL

Docker

Docker Compose

🔐 Security (Optional Phase)

JWT Authentication

Role-Based Access Control (ADMIN / USER)

API Gateway filtering

Input validation

🚀 How to Run the Project
Prerequisites

Java 17+

Maven 3.8+

Docker & Docker Compose

Node.js (for frontend)

Quick Start (Automated)

Use the provided start script:

./start.sh

This will:
- Start Docker infrastructure (MySQL, Kafka, Zookeeper)
- Build all microservices
- Display next steps

Manual Start (Step-by-Step)
Step 1: Start Infrastructure

From root directory:

docker-compose up -d

This starts:
- MySQL (port 3307)
- Kafka (port 9092)
- Zookeeper (port 2181)

Verify services:

docker-compose ps

Step 2: Build All Services

mvn clean install -DskipTests

Step 3: Start Microservices (in this order)

Open 6 separate terminal windows:

Terminal 1 - Service Registry:
cd service-registry && mvn spring-boot:run

Terminal 2 - API Gateway (wait for Eureka to start):
cd api-gateway && mvn spring-boot:run

Terminal 3 - Product Service:
cd product-service && mvn spring-boot:run

Terminal 4 - Inventory Service:
cd inventory-service && mvn spring-boot:run

Terminal 5 - Order Service:
cd order-service && mvn spring-boot:run

Terminal 6 - Payment Service:
cd payment-service && mvn spring-boot:run

Step 4: Verify All Services

Access Eureka Dashboard:
http://localhost:8761

All 5 services should be registered:
- API-GATEWAY
- PRODUCT-SERVICE
- ORDER-SERVICE
- INVENTORY-SERVICE
- PAYMENT-SERVICE

Step 5: Run Frontend (Optional)
cd frontend
npm install
npm start

Frontend runs at http://localhost:3000

🧪 How to Test the API

All requests go through the API Gateway (http://localhost:8080)

Test 1: Create a Product

curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "Apple M2 Pro, 16GB RAM, 512GB SSD",
    "price": 2499.99,
    "category": "Electronics",
    "stock": 25
  }'

Test 2: Get All Products

curl http://localhost:8080/api/products

Test 3: Get Product by ID

curl http://localhost:8080/api/products/1

Test 4: Create Inventory

curl -X POST "http://localhost:8080/api/inventory?productId=1&quantity=100"

Test 5: Check Inventory

curl http://localhost:8080/api/inventory/product/1

Test 6: Create Order (Triggers Event Flow)

curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 2499.99
      }
    ]
  }'

Response: Returns order with PENDING status

Test 7: Check Order Status

curl http://localhost:8080/api/orders/1

After a few seconds, status should change to COMPLETED

Test 8: View Payment Details

curl http://localhost:8080/api/payments/order/1

Test 9: Get All Orders for User

curl http://localhost:8080/api/orders/user/1

🔍 Testing Event-Driven Flow

To see the complete event flow in action:

Watch Kafka Messages:
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-created-topic \
  --from-beginning

Check Service Logs:

Watch all service consoles to see:
- Order Service: Order created and published event
- Inventory Service: Stock reserved and event published
- Payment Service: Payment processed and event published
- Order Service: Order status updated to COMPLETED

Full End-to-End Test:

# 1. Create product
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","description":"Latest iPhone","price":999.99,"category":"Electronics","stock":50}'

# 2. Create inventory
curl -X POST "http://localhost:8080/api/inventory?productId=1&quantity=50"

# 3. Create order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"orderItems":[{"productId":1,"quantity":2,"price":999.99}]}'

# 4. Check order status (wait 2-3 seconds)
curl http://localhost:8080/api/orders/1

# 5. Verify inventory was reduced
curl http://localhost:8080/api/inventory/product/1

# 6. Check payment
curl http://localhost:8080/api/payments/order/1

🛑 Stopping Services

Stop Spring Boot Services:
Press Ctrl+C in each terminal

Stop Docker Infrastructure:
docker-compose down

Remove All Data:
docker-compose down -v
📊 Database Design

Each service has its own database.

Product Table
Product
- id
- name
- description
- price
- category
- stock
Order Table
Order
- id
- userId
- totalAmount
- status
- createdAt
OrderItem Table
OrderItem
- id
- orderId
- productId
- quantity
- price
📍 Service URLs

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Service Registry (Eureka) | 8761 | http://localhost:8761 | Service discovery dashboard |
| API Gateway | 8080 | http://localhost:8080 | Main entry point for all APIs |
| Product Service | 8081 | http://localhost:8081 | Direct access (bypasses gateway) |
| Order Service | 8082 | http://localhost:8082 | Direct access (bypasses gateway) |
| Inventory Service | 8083 | http://localhost:8083 | Direct access (bypasses gateway) |
| Payment Service | 8084 | http://localhost:8084 | Direct access (bypasses gateway) |
| MySQL | 3307 | localhost:3307 | Database (user: root, pass: root) |
| Kafka | 9092 | localhost:9092 | Message broker |
| Zookeeper | 2181 | localhost:2181 | Kafka coordination |

⚡ API Endpoints Reference

Product Service
- `POST /api/products` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

Inventory Service
- `POST /api/inventory?productId={id}&quantity={qty}` - Create inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/{id}` - Get inventory by ID
- `GET /api/inventory/product/{productId}` - Get inventory by product

Order Service
- `POST /api/orders` - Create order (triggers event flow)
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/user/{userId}` - Get orders by user

Payment Service
- `GET /api/payments` - Get all payments
- `GET /api/payments/{id}` - Get payment by ID
- `GET /api/payments/order/{orderId}` - Get payment by order

🧪 Testing Strategy

Unit testing for service layer

Integration testing for REST APIs

Kafka event flow testing

Manual API testing using curl/Postman

End-to-end flow validation via UI

📦 Production Improvements (Future Enhancements)

Saga orchestration

Dead Letter Topics

Retry mechanisms

Circuit Breaker (Resilience4j)

Distributed tracing (Zipkin)

Centralized logging

CI/CD pipeline

Kubernetes deployment

👥 Team Structure

This project was developed using a service ownership model:

Platform & DevOps

Product & Inventory

Order & Kafka

Frontend & Security

All features follow:

Feature branching

Pull request review

Merge to develop before main

🎯 Key Learning Outcomes

Designing distributed microservices

Implementing event-driven architecture

Kafka producer/consumer configuration

Handling asynchronous workflows

Database per service pattern

Dockerized deployment

Real-world backend system design

⚠️ Troubleshooting

Port Already in Use

# Find and kill process
lsof -ti:8080 | xargs kill -9

# Or use a different port in application.properties
server.port=8085

Services Not Registering with Eureka

- Ensure Service Registry is running first
- Wait 30-60 seconds for registration
- Check if http://localhost:8761 shows all services

Kafka Connection Failed

# Check Kafka is running
docker-compose ps

# View Kafka logs
docker-compose logs kafka

# Restart Kafka if needed
docker-compose restart kafka

Database Connection Issues

# Access MySQL
docker exec -it ecommerce-mysql mysql -u root -proot

# Check databases exist
SHOW DATABASES;

Order Status Stuck at PENDING

- Check all services are running (especially Inventory and Payment)
- View service logs for errors
- Check Kafka topics have messages:

docker exec -it ecommerce-kafka kafka-topics --list --bootstrap-server localhost:9092

View Real-time Kafka Messages

# Order events
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-created-topic \
  --from-beginning

# Inventory events
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic inventory-reserved-topic \
  --from-beginning

# Payment events
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic payment-completed-topic \
  --from-beginning

📌 Future Scope

Payment gateway integration

Recommendation engine

Admin analytics dashboard

Multi-region deployment

Performance optimization

📜 License

This project is for educational and demonstration purposes.
