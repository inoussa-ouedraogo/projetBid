package com.smartbid.backend.security;

import com.smartbid.backend.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class UserDetailsConfig {

    @Bean
    public UserDetailsService userDetailsService(UserRepository repo) {
        System.out.println(">>> UserDetailsService bean created"); // debug (optionnel)
        return username -> repo.findByEmail(username)
            .map(u -> {
                // Si ton rôle est un enum (USER, ADMIN), on préfixe :
                String authority = (u.getRole() != null)
                        ? ("ROLE_" + u.getRole().name())
                        : "ROLE_USER";
                return User.withUsername(u.getEmail())
                           .password(u.getPassword())   // déjà hashé BCrypt en base
                           .authorities(authority)
                           .build();
            })
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
