FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /workspace/product-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]