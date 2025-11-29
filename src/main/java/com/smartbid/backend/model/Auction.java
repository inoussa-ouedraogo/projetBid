package com.smartbid.backend.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Entity
@Access(AccessType.FIELD)
@Table(name = "auctions",
       indexes = {
           @Index(name = "idx_auction_status", columnList = "status"),
           @Index(name = "idx_auction_start",  columnList = "start_at"),
           @Index(name = "idx_auction_end",    columnList = "end_at")
       })
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
@JoinColumn(name = "product_id", nullable = false)
private Product product;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Size(max = 150)
    @Column(length = 150)
    private String title;

    @Size(max = 2000)
    @Column(length = 2000)
    private String description;

    @Size(max = 120)
    @Column(length = 120)
    private String city;

    @PositiveOrZero(message = "Participation fee must be >= 0")
    @Column(name = "participation_fee", precision = 15, scale = 2, nullable = false)
    private BigDecimal participationFee = BigDecimal.ZERO;

    @NotBlank
    @Size(min = 3, max = 3)
    @Column(length = 3, nullable = false)
    private String currency = "CFA";

    @Positive(message = "minBid must be > 0")
    @Column(name = "min_bid", precision = 15, scale = 2, nullable = false)
    private BigDecimal minBid = new BigDecimal("0.01");

    @Positive(message = "maxBid must be > 0")
    @Column(name = "max_bid", precision = 15, scale = 2, nullable = false)
    private BigDecimal maxBid = new BigDecimal("999999.99");

    @NotNull
    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @NotNull
    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Positive
    @Column(name = "participant_limit")
    private Integer participantLimit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuctionStatus status = AuctionStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private AuctionType type = AuctionType.REVERSE;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "winner_bid_id")
    private Long winnerBidId;

    @Positive
    @Column(name = "buy_now_price", precision = 15, scale = 2)
    private BigDecimal buyNowPrice;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Auction() {}

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (currency == null || currency.isBlank()) currency = "EUR";
        if (status == null) status = AuctionStatus.DRAFT;
        if (type == null) type = AuctionType.REVERSE;
        if (isActive == null) isActive = Boolean.TRUE;

        if (minBid != null && maxBid != null && minBid.compareTo(maxBid) > 0) {
            throw new IllegalArgumentException("minBid must be <= maxBid");
        }
        if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
            throw new IllegalArgumentException("startAt must be before endAt");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();

        if (type == null) type = AuctionType.REVERSE;
        if (isActive == null) isActive = Boolean.TRUE;

        if (minBid != null && maxBid != null && minBid.compareTo(maxBid) > 0) {
            throw new IllegalArgumentException("minBid must be <= maxBid");
        }
        if (startAt != null && endAt != null && !startAt.isBefore(endAt)) {
            throw new IllegalArgumentException("startAt must be before endAt");
        }
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
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
    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public Integer getParticipantLimit() { return participantLimit; }
    public void setParticipantLimit(Integer participantLimit) { this.participantLimit = participantLimit; }
    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }
    public AuctionType getType() { return type; }
    public void setType(AuctionType type) { this.type = type; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Long getWinnerBidId() { return winnerBidId; }
    public void setWinnerBidId(Long winnerBidId) { this.winnerBidId = winnerBidId; }
    public BigDecimal getBuyNowPrice() { return buyNowPrice; }
    public void setBuyNowPrice(BigDecimal buyNowPrice) { this.buyNowPrice = buyNowPrice; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    
}
