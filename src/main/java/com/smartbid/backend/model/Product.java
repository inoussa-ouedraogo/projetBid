package com.smartbid.backend.model;

import java.math.BigDecimal;
import java.time.Instant;

//import org.antlr.v4.runtime.misc.NotNull;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;


/**
 * ===========================
 * ENTITE : Product
 * ===========================
 * Représente un produit dans SmartBid.
 * Cette classe stocke les informations de base :
 * - titre, description, prix, catégorie, image, date de création
 * - logic simple pour audit automatique (createdAt / updatedAt)
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    @Column(nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Positive(message = "Base price must be positive")
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @NotNull
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 50)
    private ProductCategory category;

    @NotBlank(message = "Image URL is required")
    @Size(max = 1024)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Size(max = 1024)
    @Column(name = "image_url_2", columnDefinition = "TEXT")
    private String imageUrl2;

    @Size(max = 1024)
    @Column(name = "image_url_3", columnDefinition = "TEXT")
    private String imageUrl3;

    @Positive
    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate; // pourcentage prélevé sur enchère / achat direct

    // Creator of this product (nullable for legacy rows)
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    
    // === Constructeur vide requis par JPA ===
    public Product() {}

    // === Hooks pour audit automatique ===
    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // === Getters / Setters ===
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public ProductCategory getCategory() { return category; }
public void setCategory(ProductCategory category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }

    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
