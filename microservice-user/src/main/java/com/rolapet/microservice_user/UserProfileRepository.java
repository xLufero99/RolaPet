package com.rolapet.microservice_user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByAuthUserId(String authUserId);
    Optional<UserProfile> findByIdentification(String identification);
}