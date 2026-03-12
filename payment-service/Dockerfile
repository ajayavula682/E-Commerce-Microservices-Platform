# -------- Build Stage --------
FROM maven:3.9-amazoncorretto-17-alpine AS build

WORKDIR /workspace

COPY pom.xml pom.xml
COPY common-lib/pom.xml common-lib/pom.xml
COPY payment-service/pom.xml payment-service/pom.xml
COPY common-lib/src common-lib/src
COPY payment-service/src payment-service/src

RUN mvn -N -f pom.xml clean install -DskipTests
RUN mvn -f common-lib/pom.xml clean install -DskipTests
RUN mvn -f payment-service/pom.xml clean package -DskipTests

# -------- Runtime Stage --------
FROM amazoncorretto:17-alpine-jdk

WORKDIR /app

COPY --from=build /workspace/payment-service/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]