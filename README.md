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

Maven

Docker

Node.js (for frontend)

Step 1: Start Infrastructure

From root directory:

docker-compose up

This starts:

Kafka

Zookeeper

Databases

All microservices (if configured)

Step 2: Access Services

Eureka Dashboard:
http://localhost:8761

API Gateway:
http://localhost:8080

Step 3: Run Frontend
cd frontend
npm install
npm start

Frontend runs at:

http://localhost:3000
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
🧪 Testing Strategy

Unit testing for service layer

Integration testing for REST APIs

Kafka event flow testing

Manual API testing using Postman

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

📌 Future Scope

Payment gateway integration

Recommendation engine

Admin analytics dashboard

Multi-region deployment

Performance optimization

📜 License

This project is for educational and demonstration purposes.
