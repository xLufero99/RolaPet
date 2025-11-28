package com.rolapet.microservice_auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Deshabilitar CSRF para APIs REST
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()  // Endpoints de autenticación públicos
                .requestMatchers("/api/public/**").permitAll()  // Otros endpoints públicos
                .requestMatchers("/").permitAll()  // Raíz pública
                .anyRequest().authenticated()  // El resto requiere autenticación
            )
            .formLogin(form -> form.disable())  // ← DESHABILITADO para API REST
            .httpBasic(basic -> basic.disable())  // ← DESHABILITADO Basic Auth
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // Sin sesiones para JWT
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Usamos BCrypt para encriptar contraseñas
    }
}