package com.rolapet.microservice_user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String authUserId;

    private String name;
    private String identification;
    private LocalDate birthDate;
    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    @Builder.Default
    private boolean verified = false;

    @OneToMany(mappedBy = "userProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Vehicle> vehicles = new ArrayList<>();

    // CALCULA AUTOMÁTICAMENTE CC/TI SEGÚN EDAD
    public DocumentType calculateDocumentType() {
        if (this.birthDate == null) return DocumentType.CC;
        
        long age = ChronoUnit.YEARS.between(this.birthDate, LocalDate.now());
        return age >= 18 ? DocumentType.CC : DocumentType.TI;
    }

    // SE EJECUTA ANTES DE GUARDAR EN BD
    @PrePersist
    @PreUpdate
    private void setDocumentTypeFromAge() {
        if (this.documentType == null) {
            this.documentType = calculateDocumentType();
        }
    }

    public boolean isAdult() {
        return calculateDocumentType() == DocumentType.CC;
    }

    public void addVehicle(Vehicle vehicle) {
        vehicles.add(vehicle);
        vehicle.setUserProfile(this);
    }
}

enum DocumentType {
    CC, TI
}