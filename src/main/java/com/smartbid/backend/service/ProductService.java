package com.smartbid.backend.service;

import java.util.List;

import com.smartbid.backend.controller.dto.ProductCreateRequest;
import com.smartbid.backend.controller.dto.ProductResponse;
import com.smartbid.backend.controller.dto.ProductUpdateRequest;

public interface ProductService {
    ProductResponse create(ProductCreateRequest req);
    ProductResponse getById(Long id);
    List<ProductResponse> list(String q); // q = recherche par titre (optionnel)
    ProductResponse update(Long id, ProductUpdateRequest req);
    void delete(Long id);

    // Gestion des images
    ProductResponse updateImageUrl(Long id, String imageUrl, int slot);
    ProductResponse deleteImageSlot(Long id, int slot);

    // Liste publique (tous les produits, sans restriction de rôle) — utile pour l’app mobile
    List<ProductResponse> listAll(String q);
}
