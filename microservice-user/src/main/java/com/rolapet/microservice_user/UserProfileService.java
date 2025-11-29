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
        return userProfileRepository.save(userProfile);
    }
    
    public UserProfile getUserProfileByAuthId(String authUserId) {
        return userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new RuntimeException("Perfil de usuario no encontrado"));
    }
    
    public UserProfile updateUserProfile(String authUserId, UserProfile updatedProfile) {
        UserProfile existingProfile = getUserProfileByAuthId(authUserId);
        
        existingProfile.setName(updatedProfile.getName());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setVerified(updatedProfile.isVerified());
        
        return userProfileRepository.save(existingProfile);
    }
    
    public Vehicle addVehicleToUser(String authUserId, Vehicle vehicle) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        userProfile.addVehicle(vehicle);
        userProfileRepository.save(userProfile);
        return vehicle;
    }
    
    public List<Vehicle> getUserVehicles(String authUserId) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        return userProfile.getVehicles();
    }
    
    // NUEVO: Obtener tipo de documento calculado
    public String getDocumentType(String authUserId) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        return userProfile.getDocumentType().name();
    }
    
    // NUEVO: Verificar si es mayor de edad
    public boolean isAdult(String authUserId) {
        UserProfile userProfile = getUserProfileByAuthId(authUserId);
        return userProfile.isAdult();
    }
}