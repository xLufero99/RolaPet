FROM eclipse-temurin:21-jre-alpine
COPY target/microservice-user-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app.jar"]