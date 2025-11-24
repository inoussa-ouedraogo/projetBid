package com.smartbid.backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartbid.backend.model.Bid;

public interface BidRepository extends JpaRepository<Bid, Long> {
    // montant gagnant = plus bas montant dont la fréquence == 1
@Query("""
   select b.amount 
   from Bid b 
   where b.auction.id = :auctionId 
   group by b.amount 
   having count(b.id) = 1 
   order by b.amount asc
""")
List<BigDecimal> findLowestUniqueAmounts(@Param("auctionId") Long auctionId);

// récupérer le Bid qui correspond à ce montant (si plusieurs même montant unique, on prend le plus ancien par sécurité)
Optional<Bid> findFirstByAuction_IdAndAmountOrderByCreatedAtAsc(Long auctionId, BigDecimal amount);

    List<Bid> findByAuction_Id(Long auctionId);

    Page<Bid> findByAuction_Id(Long auctionId, Pageable pageable);

    Page<Bid> findByUser_Id(Long userId, Pageable pageable);
    // pratique pour récupérer déjà trié par montant
List<Bid> findByAuction_IdOrderByAmountAsc(Long auctionId);

// pratique pour récupérer directement la dernière mise d'un user
Optional<Bid> findTopByAuction_IdAndUser_EmailOrderByCreatedAtDesc(Long auctionId, String email);

    List<Long> findDistinctAuctionIdsByUser_Email(String email);

    long countByAuction_Id(Long auctionId);

    @Query("""
        SELECT DISTINCT a FROM Bid b
        JOIN b.auction a
        JOIN FETCH a.product
        WHERE b.user.email = :email
    """)
    List<com.smartbid.backend.model.Auction> findDistinctAuctionsByUserEmailFetchProduct(@Param("email") String email);

}
