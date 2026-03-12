FROM maven:3.9-amazoncorretto-17-alpine AS build

WORKDIR /workspace

COPY pom.xml pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY auth-service/src auth-service/src

RUN mvn -N -f pom.xml clean install -DskipTests
RUN mvn -f auth-service/pom.xml clean package -DskipTests

FROM amazoncorretto:17-alpine-jdk

WORKDIR /app

COPY --from=build /workspace/auth-service/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]