# E-Commerce Microservices Platform

## Architecture Overview

This is a distributed E-Commerce platform built with Spring Boot microservices and event-driven architecture using Apache Kafka.

### Microservices

- **Service Registry** (Port 8761) - Eureka service discovery
- **API Gateway** (Port 8080) - Spring Cloud Gateway for routing
- **Product Service** (Port 8081) - Product catalog management
- **Order Service** (Port 8082) - Order lifecycle management
- **Inventory Service** (Port 8083) - Stock validation and management
- **Payment Service** (Port 8084) - Payment processing simulation

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Apache Kafka
- MySQL
- Docker & Docker Compose
- MapStruct (Object mapping)
- Lombok (Boilerplate reduction)

## Prerequisites

- JDK 17 or higher
- Maven 3.8+
- Docker & Docker Compose
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ajayavula682/E-Commerce-Microservices-Platform.git
cd E-Commerce-Microservices-Platform
```

### 2. Start Infrastructure (Kafka, Zookeeper, MySQL)

```bash
docker-compose up -d
```

This will start:
- MySQL on port 3306
- Zookeeper on port 2181
- Kafka on port 9092

Verify services are running:
```bash
docker-compose ps
```

### 3. Build All Services

From the root directory:

```bash
mvn clean install
```

### 4. Start Services (in order)

**Start Service Registry first:**
```bash
cd service-registry
mvn spring-boot:run
```

Wait for Eureka to start (accessible at http://localhost:8761)

**Start API Gateway:**
```bash
cd api-gateway
mvn spring-boot:run
```

**Start Microservices (can be started in parallel):**

In separate terminals:

```bash
# Terminal 1
cd product-service
mvn spring-boot:run

# Terminal 2
cd order-service
mvn spring-boot:run

# Terminal 3
cd inventory-service
mvn spring-boot:run

# Terminal 4
cd payment-service
mvn spring-boot:run
```

## Service URLs

- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080
- **Product Service**: http://localhost:8081
- **Order Service**: http://localhost:8082
- **Inventory Service**: http://localhost:8083
- **Payment Service**: http://localhost:8084

## API Testing

### Product Service APIs

**Create Product:**
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 50
  }'
```

**Get All Products:**
```bash
curl http://localhost:8080/api/products
```

**Get Product by ID:**
```bash
curl http://localhost:8080/api/products/1
```

### Inventory Service APIs

**Create Inventory:**
```bash
curl -X POST "http://localhost:8080/api/inventory?productId=1&quantity=100"
```

**Check Inventory:**
```bash
curl http://localhost:8080/api/inventory/product/1
```

### Order Service APIs (Triggers Event-Driven Flow)

**Create Order:**
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 1299.99
      }
    ]
  }'
```

**Get Order by ID:**
```bash
curl http://localhost:8080/api/orders/1
```

**Get Orders by User:**
```bash
curl http://localhost:8080/api/orders/user/1
```

### Payment Service APIs

**Get Payment by Order ID:**
```bash
curl http://localhost:8080/api/payments/order/1
```

## Event-Driven Order Flow

```
User creates order
    ↓
Order Service stores order (PENDING)
    ↓
OrderCreatedEvent → Kafka
    ↓
Inventory Service validates & reserves stock
    ↓
InventoryReservedEvent → Kafka
    ↓
Payment Service processes payment
    ↓
PaymentCompletedEvent → Kafka
    ↓
Order Service updates status to COMPLETED
```

### Kafka Topics

- `order-created-topic`
- `inventory-reserved-topic`
- `payment-completed-topic`

## Database Structure

Each service has its own database:
- `product_db` - Product service
- `order_db` - Order service
- `inventory_db` - Inventory service
- `payment_db` - Payment service

## Project Structure

```
E-Commerce-Microservices-Platform/
├── common-lib/              # Shared event contracts
├── service-registry/        # Eureka server
├── api-gateway/            # Spring Cloud Gateway
├── product-service/        # Product management
├── order-service/          # Order management + Kafka producer
├── inventory-service/      # Inventory management + Kafka consumer/producer
├── payment-service/        # Payment processing + Kafka consumer/producer
├── docker-compose.yml      # Infrastructure setup
└── pom.xml                # Parent POM
```

## Development Tips

### View Logs

```bash
# Service logs
tail -f logs/service-name.log

# Docker logs
docker-compose logs -f kafka
docker-compose logs -f mysql
```

### Access MySQL

```bash
docker exec -it ecommerce-mysql mysql -u root -proot
```

### List Kafka Topics

```bash
docker exec -it ecommerce-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Consumer Kafka Messages

```bash
docker exec -it ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-created-topic \
  --from-beginning
```

## Stopping Services

**Stop Spring Boot services:** Ctrl+C in each terminal

**Stop Docker infrastructure:**
```bash
docker-compose down
```

**Remove volumes (caution - deletes data):**
```bash
docker-compose down -v
```

## Testing the Complete Flow

1. Create a product
2. Create inventory for that product
3. Create an order with that product
4. Check order status (should be PENDING initially)
5. Watch logs to see event processing
6. Check order status again (should be COMPLETED)
7. Verify payment was created
8. Check inventory was reduced

## Common Issues

**Port already in use:**
```bash
# Find and kill process on port
lsof -ti:8080 | xargs kill -9
```

**Kafka connection issues:**
- Ensure Kafka and Zookeeper are running
- Check Docker container logs
- Verify `bootstrap-servers` configuration

**Database connection issues:**
- Ensure MySQL is running
- Verify credentials in `application.yml`
- Check if database was auto-created

## Future Enhancements

- [ ] JWT Authentication
- [ ] Saga orchestration
- [ ] Circuit breaker (Resilience4j)
- [ ] Distributed tracing (Zipkin)
- [ ] Centralized logging (ELK)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit & integration tests
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is for educational and demonstration purposes.

## Contact

GitHub: [@ajayavula682](https://github.com/ajayavula682)
