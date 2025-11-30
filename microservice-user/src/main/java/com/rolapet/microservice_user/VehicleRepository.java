package com.rolapet.microservice_user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // CAMBIAR ESTO: usar 'userProfile.id' en lugar de 'userProfileId'
    List<Vehicle> findByUserProfile_Id(Long userProfileId);
}