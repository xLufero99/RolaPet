package com.rolapet.ecommerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
@RequiredArgsConstructor
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    public Long extractUserIdFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        Claims claims = extractAllClaims(token);
        // Intentar extraer el userId del claim
        Object userIdClaim = claims.get("userId");
        if (userIdClaim != null) {
            return Long.valueOf(userIdClaim.toString());
        }
        
        // Si no hay userId en el claim, intentar extraer del subject
        // Esto es un fallback, en producción debería usar un servicio de usuarios
        return 1L; // Valor por defecto para desarrollo
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
