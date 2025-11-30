package com.rolapet.microservice_user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    // CAMBIAR: Hacer la columna nullable para evitar error en BD
    @Builder.Default
    @Column(nullable = true) // ← CAMBIAR a true temporalmente
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    @JsonIgnore
    private UserProfile userProfile;

    @JsonProperty("userProfileId")
    public Long getUserProfileId() {
        return userProfile != null ? userProfile.getId() : null;
    }

    public enum VehicleType {
        SCOOTER, BIKE, MOTORBIKE, ELECTRIC_SCOOTER, ELECTRIC_BIKE
    }
}