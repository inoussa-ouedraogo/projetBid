package com.smartbid.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // On dit à Spring où trouver les fichiers statiques uploadés
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");

        // Servir explicitement le répertoire /admin/** depuis classpath:/static/admin/
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Assure que /admin (sans slash final) redirige vers /admin/
        registry.addViewController("/admin").setViewName("forward:/admin/");
        // Et que /admin/ sert l'index de l'app SPA
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permet toutes les origines (pour le développement)
        // En production, remplace par l'URL spécifique de ton app
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Headers autorisés
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permet l'envoi de credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Expose les headers de réponse
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Durée de cache de la configuration CORS (en secondes)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
