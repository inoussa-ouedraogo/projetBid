package com.smartbid.backend.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.smartbid.backend.model.RevenueEntry;
import com.smartbid.backend.model.RevenueEntry.RevenueType;

public interface RevenueEntryRepository extends JpaRepository<RevenueEntry, Long> {

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RevenueEntry r")
    BigDecimal sumAll();

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RevenueEntry r WHERE r.type = :type")
    BigDecimal sumByType(RevenueType type);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RevenueEntry r WHERE r.auctionId = :auctionId")
    BigDecimal sumByAuctionId(Long auctionId);
}
