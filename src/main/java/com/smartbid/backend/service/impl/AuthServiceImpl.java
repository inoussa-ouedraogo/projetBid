package com.smartbid.backend.service.impl;

import java.time.Instant;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.model.JwtBlacklist;
import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.JwtBlacklistRepository;
import com.smartbid.backend.repository.UserRepository;
import com.smartbid.backend.security.JwtUtil;
import com.smartbid.backend.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtBlacklistRepository blacklistRepo;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration.ms}")
    private Long jwtExpirationMs;

    public AuthServiceImpl(UserRepository userRepository, JwtBlacklistRepository blacklistRepo, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.blacklistRepo = blacklistRepo;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Génère un JWT pour un utilisateur.
     */
    @Override
    public String issueJwt(String email, String role) {
        Objects.requireNonNull(email, "L'email ne peut pas être null");
        Objects.requireNonNull(role, "Le rôle ne peut pas être null");
        return jwtUtil.generateToken(email, role, jwtExpirationMs);
    }

    /**
     * Ajoute le token à la blacklist (révocation).
     */
    @Override
    @Transactional
    public void revokeJwt(String token, Instant expiry) {
        Objects.requireNonNull(token, "Le token ne peut pas être null");
        JwtBlacklist entry = new JwtBlacklist();
        entry.setToken(token);
        entry.setExpiry(expiry);
        entry.setCreatedAt(Instant.now());
        blacklistRepo.save(entry);
    }

    /**
     * Vérifie si le token est blacklisté.
     */
    @Override
    public boolean isTokenRevoked(String token) {
        Objects.requireNonNull(token, "Le token ne peut pas être null");
        return blacklistRepo.findByToken(token).isPresent();
    }

    /**
     * Vérifie si un utilisateur existe avec cet email.
     */
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Crée un utilisateur en base.
     */
    @Override
    @Transactional
    public User save(User user) {
        Objects.requireNonNull(user, "L'utilisateur ne peut pas être null");
        return userRepository.save(user);
    }

    /**
     * Recherche un utilisateur par email.
     */
    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'email : " + email));
    }
}
