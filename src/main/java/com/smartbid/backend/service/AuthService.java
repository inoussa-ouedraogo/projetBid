package com.smartbid.backend.service;

import java.time.Instant;

import com.smartbid.backend.model.User;

/**
 * Interface du service d'authentification et gestion utilisateur.
 */
public interface AuthService {

    /**
     * Génère un JWT pour l'utilisateur authentifié.
     * @param email Email de l'utilisateur
     * @param role  Rôle de l'utilisateur
     * @return Le token JWT
     */
    String issueJwt(String email, String role);

    /**
     * Ajoute le JWT à la blacklist pour le révoquer.
     * @param token  Le JWT à révoquer
     * @param expiry Date d'expiration du token
     */
    void revokeJwt(String token, Instant expiry);

    /**
     * Vérifie si le token est blacklisté (donc non valide).
     * @param token Le JWT à vérifier
     * @return true si révoqué
     */
    boolean isTokenRevoked(String token);

    /**
     * Vérifie si un utilisateur existe déjà avec cet email.
     * @param email Email à tester
     * @return true si déjà existant
     */
    boolean existsByEmail(String email);

    /**
     * Enregistre un nouvel utilisateur en base.
     * @param user L'utilisateur à créer
     * @return Utilisateur persisté
     */
    User save(User user);

    /**
     * Recherche un utilisateur par email (pour login, etc.).
     * @param email Email à rechercher
     * @return Utilisateur, ou null si inexistant
     */
    User findByEmail(String email);

    // Tu pourras ajouter ici la méthode pour valider le mail, changer mot de passe, etc.
}
