package com.rolapet.microservice_user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserProfileController {
    
    private final UserProfileService userProfileService;
    
    @PostMapping("/profile")
    public UserProfile createProfile(@RequestBody UserProfile userProfile, Authentication authentication) {
        String authUserId = authentication.getName();
        userProfile.setAuthUserId(authUserId);
        return userProfileService.createUserProfile(userProfile);
    }
    
    @GetMapping("/profile/my-profile")
    public UserProfile getMyProfile(Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.getUserProfileByAuthId(authUserId);
    }
    
    @PutMapping("/profile/my-profile")
    public UserProfile updateMyProfile(@RequestBody UserProfile userProfile, Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.updateUserProfile(authUserId, userProfile);
    }
    
    @PostMapping("/profile/my-profile/vehicles")
    public Vehicle addVehicle(@RequestBody Vehicle vehicle, Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.addVehicleToUser(authUserId, vehicle);
    }
    
    @GetMapping("/profile/my-profile/vehicles")
    public List<Vehicle> getMyVehicles(Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.getUserVehicles(authUserId);
    }
    
    @GetMapping("/profile/my-profile/document-type")
    public String getMyDocumentType(Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.getDocumentType(authUserId);
    }
    
    @GetMapping("/profile/my-profile/is-adult")
    public boolean amIAdult(Authentication authentication) {
        String authUserId = authentication.getName();
        return userProfileService.isAdult(authUserId);
    }
}