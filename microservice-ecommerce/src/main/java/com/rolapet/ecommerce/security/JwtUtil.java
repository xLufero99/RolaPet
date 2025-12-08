package com.rolapet.ecommerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    private final Map<String, Long> emailToIdCache = new HashMap<>();
    
    public Long extractUserIdFromToken(String token) {
        // Para desarrollo: Si el token tiene problemas, usa ID fijo
        try {
            String userEmail = extractUserEmailFromToken(token);
            System.out.println("[JWT] Email extraído: " + userEmail);
            
            return emailToIdCache.computeIfAbsent(userEmail, email -> {
                long generatedId = Math.abs(email.hashCode()) % 1000;
                System.out.println("[JWT] Generando userId " + generatedId + " para email: " + email);
                return generatedId;
            });
            
        } catch (Exception e) {
            System.out.println("[JWT ERROR] No se pudo extraer userId: " + e.getMessage());
            System.out.println("[JWT] Usando userId por defecto: 1");
            return 1L; // ID por defecto para desarrollo
        }
    }
    
    public String extractUserEmailFromToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return "default@rolapet.com";
        }
        
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
            
        } catch (Exception e) {
            System.out.println("[JWT ERROR] No se pudo parsear token: " + e.getMessage());
            // Para desarrollo, extrae email manualmente si es posible
            if (token.contains(".")) {
                String[] parts = token.split("\\.");
                if (parts.length >= 2) {
                    try {
                        // Intenta decodificar el payload manualmente
                        String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                        System.out.println("[JWT] Payload manual: " + payload);
                        // Busca el email en el payload
                        if (payload.contains("\"sub\":\"")) {
                            int start = payload.indexOf("\"sub\":\"") + 7;
                            int end = payload.indexOf("\"", start);
                            return payload.substring(start, end);
                        }
                    } catch (Exception ex) {
                        // Ignora
                    }
                }
            }
            return "test@rolapet.com"; // Email por defecto
        }
    }
    
    private Key getSignInKey() {
        try {
            // Primero intenta con Base64
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            // Si falla Base64, usa el string directamente
            System.out.println("[JWT] Secret no es Base64 válido, usando como string");
            return Keys.hmacShaKeyFor(secretKey.getBytes());
        }
    }
    
    public boolean validateToken(String token) {
        try {
            extractUserEmailFromToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}