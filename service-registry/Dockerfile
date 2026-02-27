<<<<<<< HEAD
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

COPY pom.xml pom.xml
COPY common-lib/pom.xml common-lib/pom.xml
COPY service-registry/pom.xml service-registry/pom.xml
COPY common-lib/src common-lib/src
COPY service-registry/src service-registry/src

RUN mvn -N -f pom.xml clean install -DskipTests
RUN mvn -f common-lib/pom.xml clean install -DskipTests
RUN mvn -f service-registry/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
=======
FROM eclipse-temurin:17-jre-jammy
>>>>>>> main

WORKDIR /app

COPY --from=build /workspace/service-registry/target/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]