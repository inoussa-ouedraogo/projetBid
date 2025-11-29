package com.smartbid.backend.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.UserRepository;

/**
 * Admin endpoints for managing users.
 * Protected via SecurityConfig: /api/admin/** requires role ADMIN.
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // DTOs
    public static class RoleUpdateRequest {
        public String role;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class StatusUpdateRequest {
        public Boolean status;
        public Boolean getStatus() { return status; }
        public void setStatus(Boolean status) { this.status = status; }
    }

    public static class AdminUserResponse {
        public Long id;
        public String name;
        public String email;
        public String phone;
        public String role;
        public Boolean isVerified;
        public java.math.BigDecimal walletBalance;
        public Boolean status;
        public java.time.Instant createdAt;
        public java.time.Instant updatedAt;
    }

    public static class CreditRequest {
        public java.math.BigDecimal amount;
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
    }

    private static AdminUserResponse map(User u) {
        AdminUserResponse r = new AdminUserResponse();
        r.id = u.getId();
        r.name = u.getName();
        r.email = u.getEmail();
        r.phone = u.getPhone();
        r.role = u.getRole() != null ? u.getRole().name() : "USER";
        r.isVerified = u.getIsVerified();
        r.walletBalance = u.getWalletBalance();
        r.status = u.getStatus();
        r.createdAt = u.getCreatedAt();
        r.updatedAt = u.getUpdatedAt();
        return r;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> list(@RequestParam(name = "q", required = false) String q) {
        List<User> all = userRepository.findAll();
        List<User> filtered = (q == null || q.isBlank()) ? all
                : all.stream()
                     .filter(u -> {
                         String needle = q.toLowerCase();
                         return (u.getEmail() != null && u.getEmail().toLowerCase().contains(needle))
                             || (u.getName() != null && u.getName().toLowerCase().contains(needle))
                             || (u.getPhone() != null && u.getPhone().toLowerCase().contains(needle));
                     })
                     .collect(Collectors.toList());
        return ResponseEntity.ok(filtered.stream().map(AdminUserController::map).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        return ResponseEntity.ok(map(opt.get()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        if (req == null || req.getStatus() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Field 'status' is required");
        }
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User u = opt.get();
        u.setStatus(req.getStatus());
        userRepository.save(u);
       return ResponseEntity.ok(map(u));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody RoleUpdateRequest req) {
        if (req == null || req.getRole() == null || req.getRole().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Field 'role' is required");
        }
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User u = opt.get();
        try {
            User.Role newRole = User.Role.valueOf(req.getRole().toUpperCase());
            u.setRole(newRole);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid role. Allowed: VISITOR, USER, ADMIN, REPRESENTANT");
        }
        userRepository.save(u);
        return ResponseEntity.ok(map(u));
    }

    @PutMapping("/{id}/credit")
    public ResponseEntity<?> credit(@PathVariable Long id, @RequestBody CreditRequest req) {
        if (req == null || req.getAmount() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Field 'amount' is required");
        }
        if (req.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Amount must be > 0");
        }
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User u = opt.get();
        u.setWalletBalance(u.getWalletBalance().add(req.getAmount()));
        userRepository.save(u);
        return ResponseEntity.ok(map(u));
    }
}
