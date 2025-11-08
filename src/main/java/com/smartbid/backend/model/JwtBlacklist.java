package com.smartbid.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
// CODE_V1 – src/main/java/com/smartbid/model/JwtBlacklist.java
/**
 * Entity pour stocker les JWT révoqués (blacklistés).
 */
@Entity
@Table(name = "jwt_blacklist")
public class JwtBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Le token JWT révoqué.
     */
    @Column(nullable = false, unique = true)
    private String token;

    /**
     * Date/heure d’expiration du token (pour pouvoir purger la table).
     */
    @Column(nullable = false)
    private Instant expiry;

    /**
     * Date d’ajout dans la blacklist (audit).
     */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // Getters et setters…

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getExpiry() { return expiry; }
    public void setExpiry(Instant expiry) { this.expiry = expiry; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
