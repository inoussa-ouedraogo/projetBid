package com.smartbid.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.controller.dto.ProductCreateRequest;
import com.smartbid.backend.controller.dto.ProductResponse;
import com.smartbid.backend.controller.dto.ProductUpdateRequest;
import com.smartbid.backend.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Endpoints CRUD pour Product.
 * NB: Dans ta SecurityConfig actuelle, tout hors /api/auth/** est protégé.
 *     Donc tu dois être connecté (Bearer token) pour appeler ces endpoints.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest req) {
        ProductResponse created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // READ: by id
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // LIST: optional search ?q=
    @GetMapping
    public ResponseEntity<List<ProductResponse>> list(@RequestParam(value = "q", required = false) String q) {
        return ResponseEntity.ok(service.list(q));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ProductUpdateRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    // UPLOAD LOCAL IMAGE
@PostMapping("/{id}/image")
public ResponseEntity<ProductResponse> uploadImage(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file) throws IOException {

    // Dossier local à la racine du projet
    Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
    if (!Files.exists(uploadDir)) {
        Files.createDirectories(uploadDir);
    }

    // Nom de fichier unique pour éviter les collisions
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    Path filePath = uploadDir.resolve(fileName);

    // Copie du fichier sur ton PC
    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

    // Construction de l’URL accessible
    String imageUrl = "/uploads/" + fileName;

    // Mise à jour du produit existant
    ProductResponse updated = service.updateImageUrl(id, imageUrl);
System.out.println("CHEMIN UPLOAD UTILISÉ : " + uploadDir.toAbsolutePath());

    return ResponseEntity.ok(updated);
}

}
