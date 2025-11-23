package com.smartbid.backend.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smartbid.backend.model.Auction;
import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.ProductCategory;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    // charge aussi le produit (JOIN FETCH)
    @Query("""
        SELECT a FROM Auction a
        JOIN FETCH a.product
        WHERE a.status = :status
    """)
    List<Auction> findByStatus(@Param("status") AuctionStatus status);

    List<Auction> findByProduct_Id(Long productId);

    // JOIN FETCH aussi si tu veux la catégorie et image
    @Query("""
        SELECT a FROM Auction a
        JOIN FETCH a.product
        WHERE a.product.category = :category
    """)
    List<Auction> findByCategory(@Param("category") ProductCategory category);

    @Query("""
        SELECT a FROM Auction a
        JOIN a.product p
        WHERE (:productId IS NULL OR p.id = :productId)
          AND (:status IS NULL OR a.status = :status)
          AND (:category IS NULL OR p.category = :category)
          AND (
            :qLike IS NULL
            OR LOWER(p.title) LIKE :qLike
            OR LOWER(a.title) LIKE :qLike
            OR LOWER(a.description) LIKE :qLike
          )
    """)
    List<Auction> search(@Param("productId") Long productId,
                         @Param("status") AuctionStatus status,
                         @Param("category") ProductCategory category,
                         @Param("qLike") String qLike);

    @Query("""
        SELECT a FROM Auction a
        JOIN a.product p
        WHERE (:status IS NULL OR a.status = :status)
          AND (:category IS NULL OR p.category = :category)
          AND (
            :qLike IS NULL
            OR LOWER(p.title) LIKE :qLike
            OR LOWER(a.title) LIKE :qLike
            OR LOWER(a.description) LIKE :qLike
          )
    """)
    Page<Auction> searchPaged(@Param("status") AuctionStatus status,
                              @Param("category") ProductCategory category,
                              @Param("qLike") String qLike,
                              Pageable pageable);

    // 🔁 À démarrer
    @Query("""
        SELECT a.id
        FROM Auction a
        WHERE a.status = com.smartbid.backend.model.AuctionStatus.SCHEDULED
          AND a.startAt <= :now
          AND a.endAt > :now
    """)
    List<Long> findIdsToAutoStart(@Param("now") Instant now);

    // 🔁 À clôturer
    @Query("""
        SELECT a.id
        FROM Auction a
        WHERE a.isActive = TRUE
          AND a.status <> com.smartbid.backend.model.AuctionStatus.FINISHED
          AND a.endAt <= :now
    """)
    List<Long> findIdsToAutoClose(@Param("now") Instant now);

    // 🆕 ➕ Trouve toutes les enchères actuellement actives
    List<Auction> findByIsActiveTrue();

    // 🆕 Représentant: lister ses propres enchères
    List<Auction> findByCreatedBy_Email(String email);
    List<Auction> findByCreatedBy_EmailAndStatus(String email, AuctionStatus status);

    // 🆕 Représentant: version paginée
    Page<Auction> findByCreatedBy_Email(String email, Pageable pageable);
    Page<Auction> findByCreatedBy_EmailAndStatus(String email, AuctionStatus status, Pageable pageable);

    // 🆕 Admin: DRAFT créées par un REPRESENTANT (pour page “Rep Drafts”)
    List<Auction> findByStatusAndCreatedBy_Role(AuctionStatus status, com.smartbid.backend.model.User.Role role);
}
