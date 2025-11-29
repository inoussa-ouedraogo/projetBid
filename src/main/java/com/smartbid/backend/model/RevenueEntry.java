package com.smartbid.backend.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "revenue_entries", indexes = {
        @Index(name = "idx_revenue_created_at", columnList = "created_at"),
        @Index(name = "idx_revenue_type", columnList = "type")
})
public class RevenueEntry {
    public enum RevenueType {
        PARTICIPATION_FEE,
        COMMISSION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RevenueType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "auction_id")
    private Long auctionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public RevenueType getType() { return type; }
    public void setType(RevenueType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
