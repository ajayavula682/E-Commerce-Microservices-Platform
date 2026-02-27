# -------- Build Stage --------
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml pom.xml
COPY common-lib/pom.xml common-lib/pom.xml
COPY inventory-service/pom.xml inventory-service/pom.xml
COPY common-lib/src common-lib/src
COPY inventory-service/src inventory-service/src

RUN mvn -N -f pom.xml clean install -DskipTests
RUN mvn -f common-lib/pom.xml clean install -DskipTests
RUN mvn -f inventory-service/pom.xml clean package -DskipTests

# -------- Runtime Stage --------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /workspace/inventory-service/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]