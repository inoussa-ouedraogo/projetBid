package com.smartbid.backend.service.impl;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.controller.dto.ProductCreateRequest;
import com.smartbid.backend.controller.dto.ProductResponse;
import com.smartbid.backend.controller.dto.ProductUpdateRequest;
import com.smartbid.backend.model.Product;
import com.smartbid.backend.model.ProductCategory;
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false;
        String email = null;
        if (auth != null && auth.isAuthenticated()) {
            email = auth.getName();
            for (GrantedAuthority ga : auth.getAuthorities()) {
                if ("ROLE_ADMIN".equals(ga.getAuthority())) { isAdmin = true; break; }
            }
        }
    
        List<Product> products;
        if (isAdmin || email == null) {
            products = (q == null || q.isBlank())
                    ? productRepo.findAll()
                    : productRepo.findByTitleContainingIgnoreCase(q.trim());
        } else {
            // REPRESENTANT (ou autre rôle non admin) ne voit que ses produits
            products = (q == null || q.isBlank())
                    ? productRepo.findByCreatedBy_Email(email)
                    : productRepo.findByCreatedBy_EmailAndTitleContainingIgnoreCase(email, q.trim());
        }
    
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
    public ProductResponse updateImageUrl(Long id, String imageUrl) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        product.setImageUrl(imageUrl);
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
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }
}
