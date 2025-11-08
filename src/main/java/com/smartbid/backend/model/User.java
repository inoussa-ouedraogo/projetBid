package com.smartbid.backend.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Entité User : représente un utilisateur de la plateforme.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom complet
    @Column(nullable = false)
    private String name;

    // Email unique
    @Column(nullable = false, unique = true)
    private String email;

    // Mot de passe hashé
    @Column(nullable = false)
    private String password;

    // Téléphone (optionnel)
    private String phone;

    // Rôle de l'utilisateur
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    // Email vérifié ou non
    @Column(nullable = false)
    private Boolean isVerified = false;

    // Solde du portefeuille utilisateur
    @Column(nullable = false)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    // Statut actif ou bloqué
    @Column(nullable = false)
    private Boolean status = true;

    // Date de création
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Date de modification
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
    // Token de validation email
@Column(name = "registration_token")
private String registrationToken;

// Date d’expiration du token
@Column(name = "token_expiry")
private Instant tokenExpiry;

    // Enumération des rôles possibles
    public enum Role {
        VISITOR, USER, ADMIN, REPRESENTANT
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public BigDecimal getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(BigDecimal walletBalance) {
        this.walletBalance = walletBalance;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
    
public String getRegistrationToken() { return registrationToken; }
public void setRegistrationToken(String registrationToken) { this.registrationToken = registrationToken; }
public Instant getTokenExpiry() { return tokenExpiry; }
public void setTokenExpiry(Instant tokenExpiry) { this.tokenExpiry = tokenExpiry; }

    // Getters et Setters...

    // (pour la clarté, ajoute-les automatiquement avec ton IDE)
}
