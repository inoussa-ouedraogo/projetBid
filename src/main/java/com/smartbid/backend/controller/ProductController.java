package com.smartbid.backend.controller;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.UUID;

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
import org.springframework.web.multipart.MultipartFile;

import com.smartbid.backend.controller.dto.ProductCreateRequest;
import com.smartbid.backend.controller.dto.ProductResponse;
import com.smartbid.backend.controller.dto.ProductUpdateRequest;
import com.smartbid.backend.service.ProductService;

import jakarta.validation.Valid;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;

/**
 * Endpoints CRUD pour Product.
 * NB: dans la SecurityConfig actuelle, tout hors /api/auth/** est protégé.
 * Il faut donc être authentifié (Bearer token) pour appeler ces endpoints.
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

    // LIST PUBLIC: sans restriction de rôle (utile pour l'app mobile)
    @GetMapping("/public")
    public ResponseEntity<List<ProductResponse>> listPublic(@RequestParam(value = "q", required = false) String q) {
        return ResponseEntity.ok(service.listAll(q));
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

    // UPLOAD LOCAL IMAGE avec redimensionnement
    @PostMapping("/{id}/image")
    public ResponseEntity<ProductResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Nom de fichier unique et format fixe (JPEG)
        String fileName = UUID.randomUUID() + ".jpg";
        Path filePath = uploadDir.resolve(fileName);

        // Redimensionnement + conversion en JPEG 1080x1080 (crop centre)
        try (InputStream in = file.getInputStream();
             OutputStream out = Files.newOutputStream(filePath, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
            Thumbnails.of(in)
                    .size(1080, 1080)
                    .crop(Positions.CENTER)
                    .outputQuality(0.82)
                    .outputFormat("jpg")
                    .toOutputStream(out);
        }

        String imageUrl = "/uploads/" + fileName;
        ProductResponse updated = service.updateImageUrl(id, imageUrl);
        System.out.println("CHEMIN UPLOAD UTILISE : " + uploadDir.toAbsolutePath());

        return ResponseEntity.ok(updated);
    }
}
