package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.smartbid.backend.model.AuctionType;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class AuctionUpdateRequest {
    private Long productId;
    @Size(max = 150) private String title;
    @Size(max = 2000) private String description;
    @Positive private BigDecimal participationFee;
    @Size(min = 3, max = 3) private String currency;
    @Positive private BigDecimal minBid;
    @Positive private BigDecimal maxBid;
    private Instant startAt;
    private Instant endAt;
    @Positive private Integer participantLimit;
    @Size(max = 120) private String city;
    @Positive private BigDecimal buyNowPrice;
private AuctionType type;

private Boolean isActive;
    public Boolean getIsActive() {
    return isActive;
}
public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
}
    // getters/setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
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
    public BigDecimal getBuyNowPrice() { return buyNowPrice; }
    public void setBuyNowPrice(BigDecimal buyNowPrice) { this.buyNowPrice = buyNowPrice; }
    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public Integer getParticipantLimit() { return participantLimit; }
    public void setParticipantLimit(Integer participantLimit) { this.participantLimit = participantLimit; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public AuctionType getType() {
        return type;
    }

    public void setType(AuctionType type) {
        this.type = type;
    }
}
