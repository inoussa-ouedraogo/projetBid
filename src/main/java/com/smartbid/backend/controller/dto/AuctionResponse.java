package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.AuctionType;

public class AuctionResponse {

    private Long id;

    // Produit
    private Long productId;
    private String productTitle;
    private String category;
    private String imageUrl;

    // Créateur DU PRODUIT
    private Long productCreatedById;
    private String productCreatedByName;

    // Infos enchère
    private String title;
    private String description;
    private BigDecimal participationFee;
    private String currency;
    private BigDecimal minBid;
    private BigDecimal maxBid;
    private Instant startAt;
    private Instant endAt;
    private Integer participantLimit;

    private String status;

    private Long winnerBidId;
    private BigDecimal myLastBidAmount;
    private Instant myLastBidAt;
    private Integer myRank;
    private Boolean myBidUnique;
    private Integer totalBids;
    private Instant createdAt;
    private Instant updatedAt;

    private AuctionType type;

    private Boolean isActive;

    // Créateur de l’enchère
    private Long createdById;
    private String createdByName;
    private String createdByEmail;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getProductCreatedById() { return productCreatedById; }
    public void setProductCreatedById(Long productCreatedById) { this.productCreatedById = productCreatedById; }

    public String getProductCreatedByName() { return productCreatedByName; }
    public void setProductCreatedByName(String productCreatedByName) { this.productCreatedByName = productCreatedByName; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public void setStatus(AuctionStatus status) { this.status = status.name(); }

    public Long getWinnerBidId() { return winnerBidId; }
    public void setWinnerBidId(Long winnerBidId) { this.winnerBidId = winnerBidId; }

    public BigDecimal getMyLastBidAmount() { return myLastBidAmount; }
    public void setMyLastBidAmount(BigDecimal myLastBidAmount) { this.myLastBidAmount = myLastBidAmount; }

    public Instant getMyLastBidAt() { return myLastBidAt; }
    public void setMyLastBidAt(Instant myLastBidAt) { this.myLastBidAt = myLastBidAt; }

    public Integer getMyRank() { return myRank; }
    public void setMyRank(Integer myRank) { this.myRank = myRank; }

    public Boolean getMyBidUnique() { return myBidUnique; }
    public void setMyBidUnique(Boolean myBidUnique) { this.myBidUnique = myBidUnique; }

    public Integer getTotalBids() { return totalBids; }
    public void setTotalBids(Integer totalBids) { this.totalBids = totalBids; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public AuctionType getType() { return type; }
    public void setType(AuctionType type) { this.type = type; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
}
