package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.AuctionType;

public class AuctionResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String title;
    private String description;
    private BigDecimal participationFee;
    private String currency;
    private BigDecimal minBid;
    private BigDecimal maxBid;
    private Instant startAt;
    private Instant endAt;
    private Integer participantLimit;
    private AuctionStatus status;
    private Long winnerBidId;
    private Instant createdAt;
    private Instant updatedAt;
    private AuctionType type;
// 🆕 Ajout pour filtrage par catégorie et affichage image
private String category;
private String imageUrl;
public AuctionType getType() {
        return type;
    }
    public void setType(AuctionType type) {
        this.type = type;
    }
private Boolean isActive;

    public Boolean getIsActive() {
    return isActive;
}
public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
}
    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getParticipationFee() { return participationFee; }
    public void setParticipationFee(BigDecimal participationFee) { this.participationFee = participationFee; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getMinBid() { return minBid; }
    public void setMinBid(BigDecimal minBid) { this.minBid = minBid; }
    public BigDecimal getMaxBid() { return maxBid; }
    public void setMaxBid(BigDecimal maxBid) { this.maxBid = maxBid; }
    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public Integer getParticipantLimit() { return participantLimit; }
    public void setParticipantLimit(Integer participantLimit) { this.participantLimit = participantLimit; }
    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }
    public Long getWinnerBidId() { return winnerBidId; }
    public void setWinnerBidId(Long winnerBidId) { this.winnerBidId = winnerBidId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public String getCategory() {
    return category;
}

public void setCategory(String category) {
    this.category = category;
}

public String getImageUrl() {
    return imageUrl;
}

public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
}

}
