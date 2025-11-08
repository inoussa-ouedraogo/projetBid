package com.smartbid.backend.controller;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.smartbid.backend.controller.dto.LoginResponse;
import com.smartbid.backend.model.ConsentHistory;
import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.ConsentHistoryRepository;
import com.smartbid.backend.repository.UserRepository;
import com.smartbid.backend.security.JwtUtil;
import com.smartbid.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Contrôleur d'authentification et de gestion du profil utilisateur
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ConsentHistoryRepository consentHistoryRepository;

    public AuthController(
            UserRepository userRepository,
            AuthService authService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            ConsentHistoryRepository consentHistoryRepository
    ) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.consentHistoryRepository = consentHistoryRepository;
    }

    // ================================
    // 📌 1️⃣ Inscription (register)
    // ================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getEmail() == null || req.getPassword() == null || req.getName() == null || req.getConsentRgpd() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tous les champs requis doivent être fournis.");
        }
        if (!req.getConsentRgpd()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le consentement RGPD est obligatoire.");
        }
        if (!req.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Format d'email invalide.");
        }
        if (authService.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email déjà utilisé.");
        }

        try {
            User user = new User();
            user.setEmail(req.getEmail());
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            user.setName(req.getName());
            user.setPhone(req.getPhone());
            user.setRole(User.Role.USER);
            user.setIsVerified(false);
            user.setStatus(true);
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());

            User saved = authService.save(user);

            // Historiser consentement RGPD
            ConsentHistory consent = new ConsentHistory();
            consent.setUser(saved);
            consent.setConsentGiven(true);
            consentHistoryRepository.save(consent);

            // Générer token de vérification (simulé)
            String token = java.util.UUID.randomUUID().toString();
            user.setRegistrationToken(token);
            user.setTokenExpiry(Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS));
            userRepository.save(user);

            String link = "https://smartbid.com/api/auth/verify?token=" + token;
            System.out.println("=== EMAIL SIMULÉ ===");
            System.out.println("À : " + saved.getEmail());
            System.out.println("Lien de vérification : " + link);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new UserRegisterResponse(saved.getId(), saved.getEmail(), "Inscription réussie. Veuillez vérifier votre email."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'inscription.");
        }
    }

    // ================================
    // 📌 2️⃣ Connexion (login)
    // ================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Email ou mot de passe invalide.");
        }

        var user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Email ou mot de passe invalide.");
        }

        String role = (user.getRole() != null) ? user.getRole().name() : "ROLE_USER";
        long defaultExpiryMs = 3600000L; // 1h
        String token = jwtUtil.generateToken(user.getEmail(), role);

        return ResponseEntity.ok(
    new LoginResponse(token, "Bearer", defaultExpiryMs, user.getName(), user.getEmail())
);

    }

    // ================================
    // 📌 3️⃣ Déconnexion (logout)
    // ================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token manquant ou invalide.");
        }
        String token = header.substring(7);
        Instant expiry;
        try {
            expiry = jwtUtil.getExpiryFromToken(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token invalide.");
        }
        authService.revokeJwt(token, expiry);
        return ResponseEntity.ok("Déconnexion réussie.");
    }

    // ================================
    // 📌 4️⃣ Récupération du profil (/me)
    // ================================
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
        }

        String email;
        var principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User u) {
            email = u.getUsername();
        } else {
            email = auth.getName();
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }

        var udb = userOpt.get();
        return ResponseEntity.ok(new MeResponse(
                udb.getId(),
                udb.getEmail(),
                udb.getName(),
                udb.getPhone(),
                udb.getRole().name(),
                udb.getIsVerified(),
                udb.getWalletBalance(),
                udb.getStatus(),
                udb.getCreatedAt(),
                udb.getUpdatedAt()
        ));
    }

    // ================================
    // 📌 5️⃣ Vérification email
    // ================================
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        var userOpt = userRepository.findByRegistrationToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Token invalide");
        }

        var user = userOpt.get();
        if (user.getTokenExpiry() != null && user.getTokenExpiry().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("Token expiré");
        }

        user.setIsVerified(true);
        user.setRegistrationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Compte vérifié avec succès.");
    }

    // ================================
    // 📌 6️⃣ Mise à jour du profil (/update)
    // ================================
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
        }

        String email;
        var principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User u) {
            email = u.getUsername();
        } else {
            email = auth.getName();
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable");
        }

        var user = userOpt.get();

        if (req.getName() != null && !req.getName().isBlank())
            user.setName(req.getName());
        if (req.getPhone() != null && !req.getPhone().isBlank())
            user.setPhone(req.getPhone());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().length() < 6) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Le mot de passe doit contenir au moins 6 caractères.");
            }
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        return ResponseEntity.ok(new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getRole().name(),
                user.getIsVerified(),
                user.getWalletBalance(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        ));
    }

    // ================================
    // DTOs internes
    // ================================
    public static class RegisterRequest {
        private String email;
        private String password;
        private String name;
        private String phone;
        private Boolean consentRgpd;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Boolean getConsentRgpd() { return consentRgpd; }
        public void setConsentRgpd(Boolean consentRgpd) { this.consentRgpd = consentRgpd; }
    }

    public static class UserRegisterResponse {
        private Long id;
        private String email;
        private String message;
        public UserRegisterResponse(Long id, String email, String message) {
            this.id = id; this.email = email; this.message = message;
        }
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getMessage() { return message; }
    }

    public static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String password;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public record MeResponse(
            Long id,
            String email,
            String name,
            String phone,
            String role,
            Boolean isVerified,
            java.math.BigDecimal walletBalance,
            Boolean status,
            java.time.Instant createdAt,
            java.time.Instant updatedAt
    ) {}
}
