# Docker Guide - E-Commerce Microservices Platform

This guide explains how to manage the Docker containers for the E-Commerce Microservices Platform.

## Prerequisites

- Docker installed and running
- Docker Compose installed
- Port requirements: 8080-8084, 8761, 3307, 9092, 2181 available

---

## Starting the Application

### Option 1: Quick Start (Recommended)
Start all services using the existing built images:

```bash
docker-compose up -d
```

### Option 2: Fresh Start with Rebuild
Rebuild all images and start services (use after code changes):

```bash
docker-compose up --build -d
```

### Option 3: Complete Fresh Start
Remove all containers/volumes and rebuild from scratch:

```bash
docker-compose down -v && docker-compose up --force-recreate --build -d
```

**Flags Explained:**
- `-d` - Run in detached mode (background)
- `--build` - Rebuild images before starting
- `--force-recreate` - Recreate containers even if config hasn't changed
- `-v` - Remove named volumes

---

## Stopping the Application

### Stop Services (Keep Data)
Stop all containers but preserve data and volumes:

```bash
docker-compose down
```

### Stop Services (Remove Data)
Stop all containers and remove all volumes/data:

```bash
docker-compose down -v
```

**⚠️ Warning:** Using `-v` flag will delete all database data!

---

## Monitoring & Troubleshooting

### Check Service Status
View running containers and their health:

```bash
docker-compose ps
```

### View Logs

**All Services:**
```bash
docker-compose logs -f
```

**Specific Service:**
```bash
docker-compose logs -f product-service
docker-compose logs -f order-service
docker-compose logs -f inventory-service
docker-compose logs -f payment-service
docker-compose logs -f api-gateway
docker-compose logs -f service-registry
```

**Last 100 Lines:**
```bash
docker-compose logs --tail=100 product-service
```

### Restart Specific Service
Restart a single service without affecting others:

```bash
docker-compose restart product-service
```

### Check Container Resource Usage
Monitor CPU, memory, and network usage:

```bash
docker stats
```

---

## Maintenance Commands

### Rebuild Specific Service
Rebuild and restart a single service:

```bash
docker-compose up -d --build product-service
```

### Remove Stopped Containers
Clean up stopped containers:

```bash
docker-compose rm
```

### View Service Networks
List Docker networks:

```bash
docker network ls
```

### Access Service Bash Shell
Enter a running container's shell:

```bash
docker exec -it ecommerce-product-service bash
```

---

## Database Access

### Access MySQL Database
Connect to MySQL container:

```bash
docker exec -it ecommerce-mysql mysql -u root -p
# Password: root
```

### View Database Logs
Check MySQL container logs:

```bash
docker-compose logs -f mysql
```

---

## Cleanup Commands

### Remove All Containers and Networks
Stop and remove all project containers:

```bash
docker-compose down
```

### Remove All Containers, Networks, and Volumes
Complete cleanup (deletes all data):

```bash
docker-compose down -v
```

### Remove Images
Remove all built images for this project:

```bash
docker-compose down --rmi all
```

### Prune Docker System (Global Cleanup)
Remove all unused Docker resources system-wide:

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused (use with caution!)
docker system prune -a --volumes
```

---

## Service URLs

After starting the services, access them at:

| Service | URL | Port |
|---------|-----|------|
| API Gateway | http://localhost:8080 | 8080 |
| Eureka Dashboard | http://localhost:8761 | 8761 |
| Product Service | http://localhost:8081 | 8081 |
| Order Service | http://localhost:8082 | 8082 |
| Inventory Service | http://localhost:8083 | 8083 |
| Payment Service | http://localhost:8084 | 8084 |
| MySQL Database | localhost:3307 | 3307 |
| Kafka | localhost:9092 | 9092 |
| Zookeeper | localhost:2181 | 2181 |

---

## Common Scenarios

### Scenario 1: Application Not Starting
```bash
# Check what's running
docker-compose ps

# View error logs
docker-compose logs

# Complete restart
docker-compose down -v && docker-compose up --build -d
```

### Scenario 2: Port Conflicts
```bash
# Check what's using the ports
lsof -i :8080
lsof -i :3307

# Stop conflicting services or change ports in docker-compose.yml
```

### Scenario 3: Code Changes
```bash
# After making code changes, rebuild Maven project first
mvn clean package

# Then rebuild and restart Docker services
docker-compose up --build -d
```

### Scenario 4: Database Reset
```bash
# Stop services and remove volumes
docker-compose down -v

# Start fresh (database will be auto-created)
docker-compose up -d

# Wait for services to start, then load seed data
docker exec -it ecommerce-mysql mysql -u root -proot < database-seed-data.sql
```

### Scenario 5: Check Service Health
```bash
# Test API Gateway
curl http://localhost:8080/api/products

# Check Eureka registered services
curl http://localhost:8761

# View container stats
docker-compose ps
docker stats --no-stream
```

---

## Startup Order

Services start in this order (managed by `depends_on` in docker-compose.yml):

1. **Zookeeper** (Port 2181)
2. **Kafka** (Port 9092)
3. **MySQL** (Port 3307)
4. **Service Registry/Eureka** (Port 8761)
5. **Microservices** (Ports 8081-8084)
   - Product Service
   - Order Service
   - Inventory Service
   - Payment Service
6. **API Gateway** (Port 8080)

**Note:** Services take 30-60 seconds to fully start and register with Eureka.

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Restart | `docker-compose restart` |
| Rebuild | `docker-compose up --build -d` |
| View Logs | `docker-compose logs -f` |
| Check Status | `docker-compose ps` |
| Clean Reset | `docker-compose down -v && docker-compose up --build -d` |

---

## Tips

1. **Always use `-d` flag** to run services in background
2. **Use `docker-compose logs -f`** to monitor service startup
3. **Wait 30-60 seconds** after startup for all services to register
4. **Check Eureka dashboard** at http://localhost:8761 to verify all services registered
5. **Test via API Gateway** at http://localhost:8080 instead of direct service ports
6. **Backup data** before using `docker-compose down -v`
7. **Use `docker stats`** to monitor resource usage

---

## Need Help?

- Check logs: `docker-compose logs -f [service-name]`
- Verify services: `docker-compose ps`
- Access Eureka: http://localhost:8761
- Test APIs: See `API-Testing-Guide.md`
- Import Postman: Use `Ecommerce-API-Collection.postman_collection.json`
