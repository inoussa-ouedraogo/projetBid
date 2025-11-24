package com.smartbid.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartbid.backend.model.Purchase;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("""
        SELECT p FROM Purchase p
        JOIN FETCH p.auction a
        JOIN FETCH a.product prod
        WHERE a.createdBy.email = :email
    """)
    List<Purchase> findByAuctionCreator(@Param("email") String email);

    List<Purchase> findByBuyerEmail(String buyerEmail);
}
