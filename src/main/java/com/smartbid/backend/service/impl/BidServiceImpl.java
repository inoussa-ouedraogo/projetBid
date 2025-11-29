package com.smartbid.backend.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.smartbid.backend.controller.dto.BidCreateRequest;
import com.smartbid.backend.controller.dto.BidResponse;
import com.smartbid.backend.model.Auction;
import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.Bid;
import com.smartbid.backend.model.RevenueEntry;
import com.smartbid.backend.model.User;
import com.smartbid.backend.repository.AuctionRepository;
import com.smartbid.backend.repository.BidRepository;
import com.smartbid.backend.repository.RevenueEntryRepository;
import com.smartbid.backend.repository.UserRepository;
import com.smartbid.backend.service.BidService;
import com.smartbid.backend.service.RankService;

@Service
@Transactional
public class BidServiceImpl implements BidService {

        private final BidRepository bidRepo;
    private final AuctionRepository auctionRepo;
    private final UserRepository userRepo;
    private final RankService rankService; // ✅ AJOUT
    private final RevenueEntryRepository revenueRepo;

    public BidServiceImpl(BidRepository bidRepo,
                          AuctionRepository auctionRepo,
                          UserRepository userRepo,
                          RankService rankService,
                          RevenueEntryRepository revenueRepo) {      // ✅ AJOUT
        this.bidRepo = bidRepo;
        this.auctionRepo = auctionRepo;
        this.userRepo = userRepo;
        this.rankService = rankService;                  // ✅ AJOUT
        this.revenueRepo = revenueRepo;
    }

    @Override
    public BidResponse placeBid(Long auctionId, BidCreateRequest req) {
        Auction a = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new NoSuchElementException("Auction not found"));

        // Auth utilisateur
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) throw new IllegalStateException("Unauthenticated");

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        // Vérifs business simples
        Instant now = Instant.now();
        if (Boolean.FALSE.equals(a.getIsActive())) {
            throw new IllegalStateException("Auction is not active");
        }
        if (now.isBefore(a.getStartAt()) || now.isAfter(a.getEndAt())) {
            throw new IllegalStateException("Auction not open");
        }
        if (a.getStatus() == AuctionStatus.FINISHED) {
            throw new IllegalStateException("Auction ended");
        }
        if (req.getAmount().compareTo(a.getMinBid()) < 0 || req.getAmount().compareTo(a.getMaxBid()) > 0) {
            throw new IllegalArgumentException("Bid must be between minBid and maxBid");
        }

        // Participation fee debit + revenue
        if (a.getParticipationFee() != null && a.getParticipationFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
            if (user.getWalletBalance() == null || user.getWalletBalance().compareTo(a.getParticipationFee()) < 0) {
                throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Solde insuffisant pour couvrir les frais de participation. Recharge ton compte.");
            }
            user.setWalletBalance(user.getWalletBalance().subtract(a.getParticipationFee()));
            userRepo.save(user);

            RevenueEntry fee = new RevenueEntry();
            fee.setType(RevenueEntry.RevenueType.PARTICIPATION_FEE);
            fee.setAmount(a.getParticipationFee());
            fee.setAuctionId(a.getId());
            fee.setUserId(user.getId());
            revenueRepo.save(fee);
        }

        // Persist
        Bid b = new Bid();
        b.setAuction(a);
        b.setUser(user);
        b.setAmount(req.getAmount());
        Bid saved = bidRepo.save(b);


// push mon rang (pour l’auteur du bid)
rankService.pushRankUpdate(auctionId, user.getId());

// bonus: on peut aussi pousser au même user après chaque bid d'un autre joueur
// pour "quasi-instantané" côté client, tu peux :
rankService.pushRankUpdate(auctionId, user.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidResponse> listByAuction(Long auctionId) {
        return bidRepo.findByAuction_Id(auctionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BidResponse> listByAuction(Long auctionId, Pageable pageable) {
        return bidRepo.findByAuction_Id(auctionId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BidResponse> listMyBids(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth != null) ? auth.getName() : null;
        if (email == null) throw new IllegalStateException("Unauthenticated");

        Long userId = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"))
                .getId();

        return bidRepo.findByUser_Id(userId, pageable)
                .map(this::toResponse);
    }

    private BidResponse toResponse(Bid b) {
        BidResponse r = new BidResponse();
        r.setId(b.getId());
        r.setAuctionId(b.getAuction().getId());
        r.setUserId(b.getUser().getId());
        r.setUserEmail(b.getUser().getEmail());
        r.setAmount(b.getAmount());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
