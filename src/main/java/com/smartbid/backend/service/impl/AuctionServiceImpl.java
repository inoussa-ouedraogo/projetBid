package com.smartbid.backend.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.controller.dto.AuctionCreateRequest;
import com.smartbid.backend.controller.dto.AuctionResponse;
import com.smartbid.backend.controller.dto.AuctionUpdateRequest;
import com.smartbid.backend.controller.dto.BidResponse;
import com.smartbid.backend.controller.dto.RankResponse;
import com.smartbid.backend.model.Auction;
import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.AuctionType;
import com.smartbid.backend.model.Bid;
import com.smartbid.backend.model.Product;
import com.smartbid.backend.model.ProductCategory;
import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.AuctionRepository;
import com.smartbid.backend.repository.BidRepository;     // ✅ manquait
import com.smartbid.backend.repository.ProductRepository;
import com.smartbid.backend.repository.UserRepository;
import com.smartbid.backend.service.AuctionService;
import com.smartbid.backend.service.RankService;
import com.smartbid.backend.repository.PurchaseRepository;

@Service
@Transactional
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final BidRepository bidRepo;
    private final RankService rankService;
    private final PurchaseRepository purchaseRepository;

    public AuctionServiceImpl(AuctionRepository auctionRepo,
                              ProductRepository productRepo,
                              UserRepository userRepo,
                              BidRepository bidRepo,
                              RankService rankService,
                              PurchaseRepository purchaseRepository) {
        this.auctionRepo = auctionRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.bidRepo = bidRepo;
        this.rankService = rankService;
        this.purchaseRepository = purchaseRepository;
    }



    @Override
    public AuctionResponse create(AuctionCreateRequest req) {
        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) throw new IllegalStateException("Unauthenticated");
        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Creator user not found"));

        Auction a = new Auction();
        a.setProduct(product);
        a.setCreatedBy(creator);

        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        a.setParticipationFee(req.getParticipationFee() != null ? req.getParticipationFee() : BigDecimal.ZERO);
        a.setCurrency(req.getCurrency());
        a.setMinBid(req.getMinBid());
        a.setMaxBid(req.getMaxBid());
        a.setStartAt(req.getStartAt());
        a.setEndAt(req.getEndAt());
        a.setParticipantLimit(req.getParticipantLimit());

        a.setType(req.getType() != null ? req.getType() : AuctionType.REVERSE);

        // Workflow based on creator role:
        // - ADMIN: created as SCHEDULED and active (visible to users)
        // - REPRESENTANT: created as DRAFT and inactive (requires admin approval)
        // - Others: not allowed to create auctions
        User.Role role = creator.getRole();
        if (role == User.Role.ADMIN) {
            a.setIsActive(Boolean.TRUE);
            a.setStatus(AuctionStatus.SCHEDULED);
        } else if (role == User.Role.REPRESENTANT) {
            a.setIsActive(Boolean.FALSE);
            a.setStatus(AuctionStatus.DRAFT);
        } else {
            throw new AccessDeniedException("Only ADMIN or REPRESENTANT can create auctions");
        }

        return toResponse(auctionRepo.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public AuctionResponse getById(Long id) {
        Auction a = auctionRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));
        return toResponse(a);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionResponse> list(Long productId, AuctionStatus status, String category, String search) {
        ProductCategory categoryEnum = parseCategory(category);
        String query = buildLikeSearch(search);
        return auctionRepo
                .search(productId, status, categoryEnum, query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AuctionResponse update(Long id, AuctionUpdateRequest req) {
        Auction a = auctionRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));

        if (req.getProductId() != null) {
            Product p = productRepo.findById(req.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product not found"));
            a.setProduct(p);
        }
        if (req.getTitle() != null) a.setTitle(req.getTitle());
        if (req.getDescription() != null) a.setDescription(req.getDescription());
        if (req.getParticipationFee() != null) a.setParticipationFee(req.getParticipationFee());
        if (req.getCurrency() != null) a.setCurrency(req.getCurrency());
        if (req.getMinBid() != null) a.setMinBid(req.getMinBid());
        if (req.getMaxBid() != null) a.setMaxBid(req.getMaxBid());
        if (req.getStartAt() != null) a.setStartAt(req.getStartAt());
        if (req.getEndAt() != null) a.setEndAt(req.getEndAt());
        if (req.getParticipantLimit() != null) a.setParticipantLimit(req.getParticipantLimit());
        if (req.getType() != null) a.setType(req.getType());
        if (req.getIsActive() != null) a.setIsActive(req.getIsActive());

        return toResponse(auctionRepo.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuctionResponse> listPaged(Pageable pageable, AuctionStatus status, String category, String search) {
        ProductCategory categoryEnum = parseCategory(category);
        String query = buildLikeSearch(search);
        return auctionRepo.searchPaged(status, categoryEnum, query, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionResponse> listMine(AuctionStatus status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) throw new IllegalStateException("Unauthenticated");

        List<Auction> list = (status != null)
                ? auctionRepo.findByCreatedBy_EmailAndStatus(email, status)
                : auctionRepo.findByCreatedBy_Email(email);

        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        if (!auctionRepo.existsById(id)) throw new NoSuchElementException("Auction not found");
        auctionRepo.deleteById(id);
    }

   

    @Override
    @Transactional
    public AuctionResponse closeAndPickWinner(Long auctionId) {
        Auction a = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));

        if (a.getStatus() == AuctionStatus.FINISHED) {
           // return toResponse(a);
             throw new IllegalStateException("Auction already finished");
        }

        a.setStatus(AuctionStatus.FINISHED);
        a.setIsActive(Boolean.FALSE);

        List<BigDecimal> candidates = bidRepo.findLowestUniqueAmounts(auctionId);
        if (!candidates.isEmpty()) {
            BigDecimal winningAmount = candidates.get(0);
            bidRepo.findFirstByAuction_IdAndAmountOrderByCreatedAtAsc(auctionId, winningAmount)
                   .ifPresent(winningBid -> a.setWinnerBidId(winningBid.getId()));
        } else {
            a.setWinnerBidId(null);
        }

        Auction saved = auctionRepo.save(a);
        return toResponse(saved);
    }
@Override
@Transactional(readOnly = true)
public BidResponse getWinner(Long auctionId) {
    Auction a = auctionRepo.findById(auctionId)
            .orElseThrow(() -> new NoSuchElementException("Auction not found"));
    if (a.getWinnerBidId() == null) {
        throw new IllegalStateException("No winner yet for this auction");
    }
    Bid b = bidRepo.findById(a.getWinnerBidId())
            .orElseThrow(() -> new NoSuchElementException("Winner bid not found"));
    return toBidResponse(b);
}
private BidResponse toBidResponse(Bid b) {
    BidResponse r = new BidResponse();
    r.setId(b.getId());
    r.setAuctionId(b.getAuction().getId());
    r.setUserId(b.getUser().getId());
    r.setUserEmail(b.getUser().getEmail());
    r.setAmount(b.getAmount());
    r.setCreatedAt(b.getCreatedAt());
    return r;
}
@Override
@Transactional
    public AuctionResponse startNow(Long auctionId) {
        var a = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));

        // Idempotence: si déjà démarrée ou finie, on ne fait rien
        if (a.getStatus() == AuctionStatus.RUNNING || a.getStatus() == AuctionStatus.FINISHED) {
            return toResponse(a);
        }

        // Démarrage uniquement si la fenêtre est cohérente
        Instant now = Instant.now();
        if (now.isBefore(a.getStartAt())) {
            throw new IllegalStateException("Cannot start before startAt");
        }
        if (!now.isBefore(a.getEndAt())) {
            throw new IllegalStateException("Cannot start after endAt");
        }

        a.setStatus(AuctionStatus.RUNNING);
        a.setIsActive(Boolean.TRUE);
        return toResponse(auctionRepo.save(a));
    }

@Override
@Transactional
public AuctionResponse startAuction(Long auctionId) {
    Auction a = auctionRepo.findById(auctionId)
            .orElseThrow(() -> new NoSuchElementException("Auction not found"));

    if (a.getStatus() == AuctionStatus.RUNNING) {
        throw new IllegalStateException("Auction already running");
    }
        if (a.getStatus() == AuctionStatus.FINISHED) {
            throw new IllegalStateException("Auction already finished");
        }

        a.setStatus(AuctionStatus.RUNNING);
        a.setIsActive(true);

    Auction saved = auctionRepo.save(a);
    return toResponse(saved);
}

@Override
@Transactional
public AuctionResponse approve(Long id) {
    Auction a = auctionRepo.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Auction not found"));

    if (a.getStatus() != AuctionStatus.DRAFT) {
        throw new IllegalStateException("Only DRAFT auctions can be approved");
    }
    if (a.getStartAt() == null || a.getEndAt() == null || !a.getStartAt().isBefore(a.getEndAt())) {
        throw new IllegalStateException("Invalid start/end window");
    }

    a.setStatus(AuctionStatus.SCHEDULED);
    a.setIsActive(Boolean.TRUE);

    return toResponse(auctionRepo.save(a));
}

    @Override
    @Transactional(readOnly = true)
    public List<AuctionResponse> listParticipated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) {
            throw new IllegalStateException("Unauthenticated");
        }

        return bidRepo.findDistinctAuctionsByUserEmailFetchProduct(email).stream()
                .map(a -> {
                    Bid myBid = bidRepo.findTopByAuction_IdAndUser_EmailOrderByCreatedAtDesc(a.getId(), email)
                            .orElse(null);
                    RankResponse rank = rankService.computeUserRank(a.getId(), email);
                    Long totalBids = bidRepo.countByAuction_Id(a.getId());
                    return toResponse(a, myBid, rank, totalBids);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionResponse> listByCategory(String category) {
        ProductCategory enumCategory = parseCategory(category);
        if (enumCategory == null) {
            throw new IllegalArgumentException("Categorie invalide : " + category);
        }

        return auctionRepo.search(null, null, enumCategory, null)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        try {
            return ProductCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Categorie invalide : " + category);
        }
    }

    private String buildLikeSearch(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return "%" + query.trim().toLowerCase() + "%";
    }

    private AuctionResponse toResponse(Auction a) {
        return toResponse(a, null, null, null);
    }

    private AuctionResponse toResponse(Auction a, Bid myBid, RankResponse rank, Long totalBids) {
        AuctionResponse r = new AuctionResponse();
        r.setId(a.getId());

        if (a.getProduct() != null) {
            r.setProductId(a.getProduct().getId());
            r.setProductTitle(a.getProduct().getTitle());
            r.setCategory(a.getProduct().getCategory() != null ? a.getProduct().getCategory().name() : null);
            r.setImageUrl(a.getProduct().getImageUrl());
            r.setImageUrl2(a.getProduct().getImageUrl2());
            r.setImageUrl3(a.getProduct().getImageUrl3());
        }

        r.setTitle(a.getTitle());
        r.setDescription(a.getDescription());
        r.setParticipationFee(a.getParticipationFee());
        r.setCurrency(a.getCurrency());
        r.setMinBid(a.getMinBid());
        r.setMaxBid(a.getMaxBid());
        r.setStartAt(a.getStartAt());
        r.setEndAt(a.getEndAt());
        r.setParticipantLimit(a.getParticipantLimit());
        r.setStatus(a.getStatus());
        r.setWinnerBidId(a.getWinnerBidId());
        r.setType(a.getType());
        r.setIsActive(a.getIsActive());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());

        if (totalBids != null) {
            r.setTotalBids(totalBids.intValue());
        }
        if (myBid != null) {
            r.setMyLastBidAmount(myBid.getAmount());
            r.setMyLastBidAt(myBid.getCreatedAt());
        }
        if (rank != null) {
            r.setMyRank(rank.getMyRank());
            r.setMyBidUnique(rank.isMyBidUnique());
            if (rank.getMyBidAmount() != null && r.getMyLastBidAmount() == null) {
                r.setMyLastBidAmount(rank.getMyBidAmount());
            }
        }

        if (a.getCreatedBy() != null) {
            r.setCreatedById(a.getCreatedBy().getId());
            r.setCreatedByName(a.getCreatedBy().getName());
            r.setCreatedByEmail(a.getCreatedBy().getEmail());
        }

        return r;
    }

    @Override
    @Transactional
    public AuctionResponse buyNow(Long id, com.smartbid.backend.controller.dto.BuyNowRequest req) {
        Auction a = auctionRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));

        if (a.getStatus() == AuctionStatus.FINISHED) {
            throw new IllegalStateException("Auction already finished");
        }

        // Persist purchase
        com.smartbid.backend.model.Purchase purchase = new com.smartbid.backend.model.Purchase();
        purchase.setAuction(a);
        purchase.setFullName(req.getFullName());
        purchase.setPhone(req.getPhone());
        purchase.setAddress(req.getAddress());
        purchase.setCity(req.getCity());
        purchase.setPaymentMethod(req.getPaymentMethod());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            purchase.setBuyerEmail(auth.getName());
        }

        purchaseRepository.save(purchase);

        return toResponse(a);
    }
}
