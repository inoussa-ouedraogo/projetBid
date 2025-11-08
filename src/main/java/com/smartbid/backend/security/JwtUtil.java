package com.smartbid.backend.security;

import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Utilitaire JWT : génération, parsing, validation.
 */
@Component
public class JwtUtil {

    // Clé secrète pour signer les tokens (injectée via application.properties)
    @Value("${jwt.secret}")
    private String secret;

    // Durée de validité des tokens en millisecondes (ex: 3600000 = 1h)
    @Value("${jwt.expiration.ms}")
    private Long expirationMs;

    /**
     * Génère un JWT pour un utilisateur, avec email et rôle.
     */
    public String generateToken(String email, String role, Long customExpiry) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (customExpiry != null ? customExpiry : expirationMs));
        return Jwts.builder()
                .setSubject(email) // le “username” ou l’identifiant unique
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Surcharge pour générer avec expiration par défaut
    public String generateToken(String email, String role) {
        return generateToken(email, role, null);
    }

    /**
     * Récupère le subject (email) à partir du token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Récupère le rôle stocké dans le token.
     */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Récupère la date d'expiration à partir du token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Méthode utilisée dans le filtre pour parser les claims.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parse les claims depuis le token, lève une exception si signature invalide ou expiré.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valide la signature, la date d'expiration, et que le token correspond à l'utilisateur.
     */
    public boolean validateToken(String token, String email) {
        try {
            final String username = extractUsername(token);
            return (username.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Vérifie si le token est expiré.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extrait la date d'expiration du token (Instant).
     */
    public java.time.Instant getExpiryFromToken(String token) {
        return extractExpiration(token).toInstant();
    }

    /**
     * Génére la clé de signature à partir du secret de l'application.
     */
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
//CODE_V8 – src/main/java/com/smartbid/security/JwtUtil.java