package com.rolapet.microservice_user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileService {
    
    private final UserProfileRepository userProfileRepository;
    private final VehicleRepository vehicleRepository;
    
    public UserProfile createUserProfile(UserProfile userProfile) {
        if (userProfileRepository.findByAuthUserId(userProfile.getAuthUserId()).isPresent()) {
            throw new RuntimeException("Ya existe un perfil para este usuario");
        }
        return userProfileRepository.save(userProfile);
    }
    
    public UserProfile getUserProfileByAuthId(String authUserId) {
        return userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new RuntimeException("Perfil de usuario no encontrado"));
    }
    
    public UserProfile updateUserProfile(String authUserId, UserProfile updatedProfile) {
        UserProfile existingProfile = getUserProfileByAuthId(authUserId);
        
        if (updatedProfile.getName() != null) {
            existingProfile.setName(updatedProfile.getName());
        }
        if (updatedProfile.getPhone() != null) {
            existingProfile.setPhone(updatedProfile.getPhone());
        }
        if (updatedProfile.getAddress() != null) {
            existingProfile.setAddress(updatedProfile.getAddress());
        }
        if (updatedProfile.getBirthDate() != null) {
            existingProfile.setBirthDate(updatedProfile.getBirthDate());
        }
        if (updatedProfile.getIdentification() != null) {
            existingProfile.setIdentification(updatedProfile.getIdentification());
        }
        
        return userProfileRepository.save(existingProfile);
    }
    
    public Vehicle addVehicleToUser(String authUserId, Vehicle vehicle) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        vehicle.setUserProfile(userProfile);
        return vehicleRepository.save(vehicle);
    }
    
    public List<Vehicle> getUserVehicles(String authUserId) {
    UserProfile userProfile = getUserProfileByAuthId(authUserId);
    // CAMBIAR: usar el método corregido
    return vehicleRepository.findByUserProfile_Id(userProfile.getId());
}
    
    public String getDocumentType(String authUserId) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        return userProfile.getDocumentType().name();
    }
    
    public boolean isAdult(String authUserId) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        return userProfile.isAdult();
    }
}