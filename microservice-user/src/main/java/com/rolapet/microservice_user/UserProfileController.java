package com.rolapet.microservice_user;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserProfileController {
    
    private final UserProfileService userProfileService;
    
    @PostMapping("/profile")
    public UserProfile createProfile(@RequestBody UserProfile userProfile) {
        return userProfileService.createUserProfile(userProfile);
    }
    
    @GetMapping("/profile/{authUserId}")
    public UserProfile getProfile(@PathVariable String authUserId) {
        return userProfileService.getUserProfileByAuthId(authUserId);
    }
    
    @PutMapping("/profile/{authUserId}")
    public UserProfile updateProfile(@PathVariable String authUserId, @RequestBody UserProfile userProfile) {
        return userProfileService.updateUserProfile(authUserId, userProfile);
    }
    
    @PostMapping("/profile/{authUserId}/vehicles")
    public Vehicle addVehicle(@PathVariable String authUserId, @RequestBody Vehicle vehicle) {
        return userProfileService.addVehicleToUser(authUserId, vehicle);
    }
    
    @GetMapping("/profile/{authUserId}/vehicles")
    public List<Vehicle> getUserVehicles(@PathVariable String authUserId) {
        return userProfileService.getUserVehicles(authUserId);
    }
    
    // NUEVO: Endpoint para ver tipo de documento
    @GetMapping("/profile/{authUserId}/document-type")
    public String getDocumentType(@PathVariable String authUserId) {
        return userProfileService.getDocumentType(authUserId);
    }
    
    // NUEVO: Endpoint para verificar mayoría de edad
    @GetMapping("/profile/{authUserId}/is-adult")
    public boolean isAdult(@PathVariable String authUserId) {
        return userProfileService.isAdult(authUserId);
    }
}