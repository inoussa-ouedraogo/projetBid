package com.smartbid.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbid.backend.model.Product;
import com.smartbid.backend.model.ProductCategory;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByTitleContainingIgnoreCase(String title);

    // ✅ Correct : chercher par la propriété 'category' de Product
    List<Product> findByCategory(ProductCategory category);

    // 🆕 Filtrer par créateur (email) pour limiter la visibilité d'un REPRESENTANT
    List<Product> findByCreatedBy_Email(String email);
    List<Product> findByCreatedBy_EmailAndTitleContainingIgnoreCase(String email, String title);
}
