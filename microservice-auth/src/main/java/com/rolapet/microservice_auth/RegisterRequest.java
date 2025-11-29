package com.rolapet.microservice_auth;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String identification;
    private LocalDate birthDate;  // ← Con esto se calcula documentType automáticamente
}