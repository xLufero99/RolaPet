package com.rolapet.microservice_auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String identification;
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Builder.Default
    private boolean active = true;
    
    @Builder.Default
    private boolean verified = false;
}