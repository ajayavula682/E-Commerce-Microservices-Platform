FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/api-gateway/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]