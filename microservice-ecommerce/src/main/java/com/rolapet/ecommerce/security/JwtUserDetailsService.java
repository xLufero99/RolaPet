package com.rolapet.ecommerce.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class JwtUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String email) {
        return User.builder()
            .username(email)
            .password("")
            .authorities(Collections.emptyList())
            .build();
    }
}
