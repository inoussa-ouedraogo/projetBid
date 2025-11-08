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
import com.smartbid.backend.mapper.AuctionMapper;

@Service
@Transactional
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final BidRepository bidRepo;
    private final AuctionMapper mapper; // 👈 ajouté

    public AuctionServiceImpl(AuctionRepository auctionRepo,
                              ProductRepository productRepo,
                              UserRepository userRepo,
                              BidRepository bidRepo,
                              AuctionMapper mapper) { // 👈 ajouté dans le constructeur
        this.auctionRepo = auctionRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.bidRepo = bidRepo;
        this.mapper = mapper; // 👈 ajouté
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
    public List<AuctionResponse> list(Long productId, AuctionStatus status) {
        List<Auction> list;
        if (productId != null) {
            list = auctionRepo.findByProduct_Id(productId);
        } else if (status != null) {
            list = auctionRepo.findByStatus(status);
        } else {
            list = auctionRepo.findAll();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
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
    public Page<AuctionResponse> listPaged(Pageable pageable) {
        return auctionRepo.findAll(pageable).map(this::toResponse);
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
public List<AuctionResponse> listByCategory(String category) {
    try {
        // ✅ Convertir le texte reçu (smartphone, voiture, etc.) en ENUM
        ProductCategory enumCategory = ProductCategory.valueOf(category.toUpperCase());

        // ✅ Appel à la méthode que tu as choisi de garder dans ton repository
        return auctionRepo.findByCategory(enumCategory)
                .stream()
                .map(mapper::toResponse)
                .toList();

    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Catégorie invalide : " + category);
    }
}

    private AuctionResponse toResponse(Auction a) {
    AuctionResponse r = new AuctionResponse();
    r.setId(a.getId());

    if (a.getProduct() != null) {
        r.setProductId(a.getProduct().getId());
        r.setProductTitle(a.getProduct().getTitle());
       // r.set
        // 🧩 Ajoute la catégorie et l’image ici :
        r.setCategory(a.getProduct().getCategory() != null ? a.getProduct().getCategory().name() : null);
        r.setImageUrl(a.getProduct().getImageUrl());
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

    return r;
}


}
