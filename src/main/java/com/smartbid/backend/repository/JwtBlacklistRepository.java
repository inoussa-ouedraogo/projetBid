// CODE_V2 – src/main/java/com/smartbid/repository/JwtBlacklistRepository.java


package com.smartbid.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbid.backend.model.JwtBlacklist;

/**
 * Repository pour interagir avec la table jwt_blacklist.
 */
public interface JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Long> {
    /**
     * Cherche un token dans la blacklist.
     */
    Optional<JwtBlacklist> findByToken(String token);
}