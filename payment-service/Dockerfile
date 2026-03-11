FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/payment-service/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]