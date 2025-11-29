package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.smartbid.backend.model.AuctionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Payload de création d'une enchère.
 * Remarque: type et isActive sont optionnels (valeurs par défaut côté backend).
 */
public class AuctionCreateRequest {

    @NotNull
    private Long productId;

    @Size(max = 150)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 120)
    private String city;

    @PositiveOrZero
    private BigDecimal participationFee = BigDecimal.ZERO;

    @NotBlank
    @Size(min = 3, max = 3)
    private String currency = "EUR";

    @NotNull @Positive
    private BigDecimal minBid;

    @NotNull @Positive
    private BigDecimal maxBid;

    @Positive
    private BigDecimal buyNowPrice;

    @NotNull
    private Instant startAt;

    @NotNull
    private Instant endAt;

    @Positive
    private Integer participantLimit;

    // ✅ Nouveaux champs OPTIONNELS (laisser null = valeur par défaut côté backend)
    private AuctionType type;    // par défaut: REVERSE
    private Boolean isActive;    // par défaut: true

    // Getters / Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
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
    public AuctionType getType() { return type; }
    public void setType(AuctionType type) { this.type = type; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
