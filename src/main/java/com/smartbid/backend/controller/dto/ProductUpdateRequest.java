package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ProductUpdateRequest {

    @Size(max = 255)
    private String title;

    private String description;

    @Positive
    private BigDecimal basePrice;

    @Size(max = 100)
    private String category;

    @Size(max = 1024)
    private String imageUrl;

    @Size(max = 1024)
    private String imageUrl2;

    @Size(max = 1024)
    private String imageUrl3;

    @Positive
    private BigDecimal commissionRate;

    // Getters/Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageUrl2() { return imageUrl2; }
    public void setImageUrl2(String imageUrl2) { this.imageUrl2 = imageUrl2; }

    public String getImageUrl3() { return imageUrl3; }
    public void setImageUrl3(String imageUrl3) { this.imageUrl3 = imageUrl3; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
}
