package com.smartbid.backend.service.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.controller.dto.ProductCreateRequest;
import com.smartbid.backend.controller.dto.ProductResponse;
import com.smartbid.backend.controller.dto.ProductUpdateRequest;
import com.smartbid.backend.model.Product;
import com.smartbid.backend.model.ProductCategory;
import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.ProductRepository;
import com.smartbid.backend.repository.UserRepository;
import com.smartbid.backend.service.ProductService;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    
    public ProductServiceImpl(ProductRepository productRepo, UserRepository userRepo) {
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    // === CREATE ===
    @Override
    public ProductResponse create(ProductCreateRequest req) {
        Product p = new Product();
        p.setTitle(req.getTitle());
        p.setDescription(req.getDescription());
        p.setBasePrice(req.getBasePrice());
    
        // ✅ Convertir String → Enum (avec sécurité)
        if (req.getCategory() != null) {
            try {
                p.setCategory(ProductCategory.valueOf(req.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Catégorie invalide : " + req.getCategory());
            }
        }
    
        p.setImageUrl(req.getImageUrl());
        p.setImageUrl2(req.getImageUrl2());
        p.setImageUrl3(req.getImageUrl3());
    
        // 🆕 Lier le créateur pour visibilité côté REPRESENTANT
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String email = auth.getName();
            userRepo.findByEmail(email).ifPresent(p::setCreatedBy);
        }
    
        Product saved = productRepo.save(p);
        return toResponse(saved);
    }

    // === READ by ID ===
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        return toResponse(p);
    }

    // === LIST ===
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> list(String q) {
        String trimmed = (q != null && !q.isBlank()) ? q.trim() : null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false;
        boolean isRepresentant = false;
        String email = null;

        if (auth != null && auth.isAuthenticated()) {
            email = auth.getName();
            var userOpt = userRepo.findByEmail(email);
            if (userOpt.isPresent()) {
                User.Role role = userOpt.get().getRole();
                if (role == User.Role.ADMIN) {
                    isAdmin = true;
                } else if (role == User.Role.REPRESENTANT) {
                    isRepresentant = true;
                }
            }
        }

        List<Product> products;
        if (isAdmin || email == null || !isRepresentant) {
            // Admin ou user normal : tout le catalogue (avec recherche éventuelle)
            products = (trimmed == null)
                    ? productRepo.findAll()
                    : productRepo.findByTitleContainingIgnoreCase(trimmed);
        } else {
            // Représentant : uniquement ses produits
            products = (trimmed == null)
                    ? productRepo.findByCreatedBy_Email(email)
                    : productRepo.findByCreatedBy_EmailAndTitleContainingIgnoreCase(email, trimmed);
        }

        return products.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Liste publique (non restreinte) pour l'app mobile
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> listAll(String q) {
        String trimmed = (q != null && !q.isBlank()) ? q.trim() : null;
        List<Product> products = (trimmed == null)
                ? productRepo.findAll()
                : productRepo.findByTitleContainingIgnoreCase(trimmed);
        return products.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // === UPDATE ===
    @Override
    public ProductResponse update(Long id, ProductUpdateRequest req) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        if (req.getTitle() != null) p.setTitle(req.getTitle());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getBasePrice() != null) p.setBasePrice(req.getBasePrice());

        // ✅ Conversion sécurisée String → Enum
        if (req.getCategory() != null) {
            try {
                p.setCategory(ProductCategory.valueOf(req.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Catégorie invalide : " + req.getCategory());
            }
        }

        if (req.getImageUrl() != null) p.setImageUrl(req.getImageUrl());
        if (req.getImageUrl2() != null) p.setImageUrl2(req.getImageUrl2());
        if (req.getImageUrl3() != null) p.setImageUrl3(req.getImageUrl3());

        Product saved = productRepo.save(p);
        return toResponse(saved);
    }

    // === DELETE ===
    @Override
    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new NoSuchElementException("Product not found");
        }
        productRepo.deleteById(id);
    }

    // === UPDATE IMAGE ONLY ===
    @Override
    public ProductResponse updateImageUrl(Long id, String imageUrl, int slot) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        if (slot == 2) {
            product.setImageUrl2(imageUrl);
        } else if (slot == 3) {
            product.setImageUrl3(imageUrl);
        } else {
            product.setImageUrl(imageUrl);
        }
        Product saved = productRepo.save(product);
        return toResponse(saved);
    }

    // === Mapper ===
    private ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setBasePrice(p.getBasePrice());

        // ✅ Enum → String pour le DTO
        if (p.getCategory() != null) {
            r.setCategory(p.getCategory().name());
        }

        r.setImageUrl(p.getImageUrl());
        r.setImageUrl2(p.getImageUrl2());
        r.setImageUrl3(p.getImageUrl3());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());

        if (p.getCreatedBy() != null) {
            r.setCreatedById(p.getCreatedBy().getId());
            r.setCreatedByName(p.getCreatedBy().getName());
        }
        return r;
    }
}
