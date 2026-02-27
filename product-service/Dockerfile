# -------- Build Stage --------
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml pom.xml
COPY common-lib/pom.xml common-lib/pom.xml
COPY product-service/pom.xml product-service/pom.xml
COPY common-lib/src common-lib/src
COPY product-service/src product-service/src

RUN mvn -N -f pom.xml clean install -DskipTests
RUN mvn -f common-lib/pom.xml clean install -DskipTests
RUN mvn -f product-service/pom.xml clean package -DskipTests

# -------- Runtime Stage --------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /workspace/product-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]