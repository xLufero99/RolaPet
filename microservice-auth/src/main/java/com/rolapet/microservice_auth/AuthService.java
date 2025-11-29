package com.rolapet.microservice_auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        // Validar que el email no exista
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Validar que la identificación no exista
        if (request.getIdentification() != null && 
            userRepository.findByIdentification(request.getIdentification()).isPresent()) {
            throw new RuntimeException("La identificación ya está registrada");
        }

        // Crear usuario - documentType se calculará automáticamente en UserProfile
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .identification(request.getIdentification())
                .birthDate(request.getBirthDate())
                .role(Role.USER)
                .active(true)
                .verified(false)  // Pendiente de verificación/consentimiento
                .build();

        userRepository.save(user);

        // Generar JWT con todos los datos del usuario
        String token = jwtService.generateToken(user);
        return AuthResponse.builder().token(token).build();
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar usuario por email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar contraseña
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        
        // Validar que el usuario esté activo
        if (!user.isActive()) {
            throw new RuntimeException("Usuario desactivado");
        }

        // Generar JWT
        String token = jwtService.generateToken(user);
        return AuthResponse.builder().token(token).build();
    }
}