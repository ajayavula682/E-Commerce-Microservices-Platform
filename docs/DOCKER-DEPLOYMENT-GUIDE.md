# Docker Deployment Guide

## Quick Start

### Start Everything (with clean build)
```bash
./start.sh
```

This script will:
1. ✅ Stop any existing containers
2. ✅ Clean Maven artifacts (`mvn clean`)
3. ✅ Start infrastructure (MySQL, Kafka, Zookeeper, Redis)
4. ✅ Build Docker images for all microservices
5. ✅ Start all 8 microservices
6. ✅ Display service URLs and status

### Stop Everything
```bash
./stop.sh
```

This script will:
1. ✅ Stop all running containers
2. ✅ Show cleanup options for volumes and images

### Complete Fresh Restart (with data wipe)
```bash
./restart.sh
```

This script will:
1. ✅ Stop all containers
2. ✅ Remove all volumes (database data deleted)
3. ✅ Clean Maven artifacts
4. ✅ Remove unused Docker resources
5. ✅ Rebuild everything from scratch
6. ✅ Start all services fresh

---

## What Changed?

### Updated `start.sh`
**Before:**
- Only started infrastructure
- Required manual Maven build
- Required manual service startup
- Didn't handle existing containers

**After:**
- ✅ Stops existing containers automatically
- ✅ Runs `mvn clean` to remove old artifacts
- ✅ Starts infrastructure with health checks
- ✅ Builds Docker images with `docker-compose build --no-cache`
- ✅ Starts all 8 services automatically
- ✅ Displays comprehensive status and URLs
- ✅ Shows useful commands for troubleshooting

### Updated `stop.sh`
**Before:**
- Basic shutdown only
- Limited cleanup options

**After:**
- ✅ Clear shutdown messages
- ✅ Shows advanced cleanup options
- ✅ Helpful commands reference

### New `restart.sh`
**Purpose:** Complete fresh start with full cleanup
- ✅ Stops containers and removes volumes
- ✅ Cleans Maven build artifacts
- ✅ Removes unused Docker resources
- ✅ Restarts everything from scratch
- ✅ Useful for troubleshooting stubborn issues

---

## Services Running

After `./start.sh`, you'll have these 8 microservices running:

| Service | Port | Status |
|---------|------|--------|
| **Service Registry (Eureka)** | 8761 | Discovery server |
| **API Gateway** | 8080 | Request routing |
| **Product Service** | 8081 | Product management |
| **Order Service** | 8082 | Order processing |
| **Inventory Service** | 8083 | Stock management |
| **Payment Service** | 8084 | Payment handling |
| **Auth Service** | 8085 | Authentication |

Plus Infrastructure:
- **MySQL** - Port 3307 (mapped from 3306)
- **Kafka** - Port 9092
- **Zookeeper** - Port 2181
- **Redis** - Port 6379

---

## Common Workflows

### Workflow 1: Normal Development Cycle
```bash
# First time setup
./start.sh

# Work on your code...

# Stop services when done
./stop.sh

# Next day, start again
./start.sh
```

### Workflow 2: Restart After Code Changes
```bash
# Stop services
./stop.sh

# Start with fresh build (Maven clean)
./start.sh
```

### Workflow 3: Fix Issues with Fresh Build
```bash
# Complete restart with full cleanup
./restart.sh

# This handles stubborn issues like:
# - Lingering containers
# - Old cached layers
# - Corrupted database data
# - Orphaned volumes
```

### Workflow 4: Check Logs
```bash
# All services logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f product-service
docker-compose logs -f order-service
```

### Workflow 5: Rebuild Specific Service
```bash
# Rebuild specific service image
docker-compose build --no-cache product-service

# Restart that service
docker-compose up -d product-service
```

---

## Docker Image Optimization

All Dockerfiles have been optimized to use Alpine Linux:

**Size Benefits:**
- ✅ Build stage: ~800MB → ~200MB (75% reduction)
- ✅ Runtime stage: ~500MB → ~100-150MB (70-80% reduction)
- ✅ Per service: ~600-800MB → ~100-150MB (70-80% reduction)
- ✅ Total platform: ~4.2-5.6GB → ~700-1050MB (80% reduction!)

**Build Stage:** `maven:3.9.9-eclipse-temurin-17-alpine`
**Runtime Stage:** `eclipse-temurin:17-jre-alpine`

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:8080 | xargs kill -9

# Or restart with fresh build
./restart.sh
```

### Database Connection Issues
```bash
# Check MySQL container
docker-compose logs mysql

# Verify MySQL is healthy
docker-compose exec mysql mysqladmin ping -u root -proot
```

### Kafka Connection Issues
```bash
# Check Kafka logs
docker-compose logs kafka

# List topics
docker exec ecommerce-kafka kafka-topics --list --bootstrap-server localhost:9092
```

### Services Won't Start
```bash
# Try complete restart
./restart.sh

# Check for orphaned containers
docker ps -a

# Remove specific container if needed
docker rm container-name
```

### Clean Build Cache
```bash
# Remove build cache
docker system prune -a

# Then run
./restart.sh
```

---

## Advanced Commands

### Interact with MySQL
```bash
docker-compose exec mysql mysql -u root -proot

# Or view specific database
docker-compose exec mysql mysql -u root -proot -e "SHOW DATABASES;"
docker-compose exec mysql mysql -u root -proot -D product_db -e "SHOW TABLES;"
```

### Consume Kafka Messages
```bash
docker exec ecommerce-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-created-topic \
  --from-beginning
```

### View Service Metrics
```bash
# Eureka dashboard
curl http://localhost:8761

# Health check
curl http://localhost:8080/actuator/health
```

### Rebuild All Images
```bash
docker-compose build --no-cache
```

### Remove Everything (Nuclear Option)
```bash
docker-compose down -v
docker system prune -a -f
mvn clean
```

---

## Performance Tips

1. **Use `.dockerignore`** ✅ Already configured
   - Prevents unnecessary files from Docker build context
   - Speeds up builds

2. **Use Alpine Base Images** ✅ Already implemented
   - Reduces image sizes by 70-80%
   - Faster image pulls

3. **Multi-stage Builds** ✅ Already configured
   - Separates build tools from runtime
   - Only runtime files included in final image

4. **Layer Caching**
   - POM files copied first (don't change often)
   - Source files copied second (change frequently)
   - Maven runs in separate RUN commands
   - Allows Docker to cache layers efficiently

---

## Environment Variables

Services automatically receive these environment variables:

**All Services:**
- `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE`: Service registry location

**Product Service:**
- `CACHE_TYPE: redis`
- `SPRING_DATA_REDIS_HOST: redis`
- `SPRING_DATA_REDIS_PORT: 6379`

**Order/Inventory/Payment Services:**
- `SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092`

**Auth Service:**
- `APP_JWT_SECRET`: JWT signing key
- `APP_JWT_EXPIRATION_MS`: Token expiration (24 hours)

---

## Useful Aliases (Optional)

Add to your `.zshrc` or `.bash_profile`:

```bash
alias ecom-start='cd ~/Developer/E-Commerce-Microservices-Platform && ./start.sh'
alias ecom-stop='cd ~/Developer/E-Commerce-Microservices-Platform && ./stop.sh'
alias ecom-restart='cd ~/Developer/E-Commerce-Microservices-Platform && ./restart.sh'
alias ecom-logs='cd ~/Developer/E-Commerce-Microservices-Platform && docker-compose logs -f'
alias ecom-ps='cd ~/Developer/E-Commerce-Microservices-Platform && docker-compose ps'
```

Then use:
```bash
ecom-start
ecom-logs
ecom-ps
```

---

## Docker Compose Commands Cheat Sheet

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Build images
docker-compose build --no-cache

# Execute command in container
docker-compose exec [service] [command]

# Scale a service
docker-compose up -d --scale product-service=3

# Remove volumes
docker-compose down -v
```

---

## Next Steps

1. Run `./start.sh` to start everything
2. Visit http://localhost:8761 to see Eureka dashboard
3. Visit http://localhost:8080/swagger-ui.html for API documentation
4. Test APIs using Postman collection or curl

---

**Happy coding! 🚀**

