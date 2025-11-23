package com.smartbid.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbid.backend.controller.dto.AuctionResponse;
import com.smartbid.backend.model.AuctionStatus;
import com.smartbid.backend.model.Auction;
import com.smartbid.backend.model.User;
import com.smartbid.backend.service.AuctionService;
import com.smartbid.backend.repository.AuctionRepository;
import com.smartbid.backend.mapper.AuctionMapper;

/**
 * Admin endpoints for managing auctions requiring validation.
 * Protected by SecurityConfig: /api/admin/** requires role ADMIN.
 */
@RestController
@RequestMapping("/api/admin/auctions")
public class AdminAuctionController {

    private final AuctionService auctionService;
    private final AuctionRepository auctionRepository;
    private final AuctionMapper auctionMapper;

    public AdminAuctionController(AuctionService auctionService,
                                  AuctionRepository auctionRepository,
                                  AuctionMapper auctionMapper) {
        this.auctionService = auctionService;
        this.auctionRepository = auctionRepository;
        this.auctionMapper = auctionMapper;
    }

    // List all DRAFT auctions (submitted by REPRESENTANT and waiting for validation)
    @GetMapping("/drafts")
    public ResponseEntity<List<AuctionResponse>> listDrafts() {
        return ResponseEntity.ok(auctionService.list(null, AuctionStatus.DRAFT, null, null));
    }

    // Approve a DRAFT auction -> SCHEDULED + isActive=true
    @PutMapping("/{id}/approve")
    public ResponseEntity<AuctionResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.approve(id));
    }

    // New: list only DRAFT auctions created by REPRESENTANT (awaiting approval)
    @GetMapping("/rep-drafts")
    public ResponseEntity<List<AuctionResponse>> repDrafts() {
        List<Auction> drafts = auctionRepository.findByStatusAndCreatedBy_Role(
                AuctionStatus.DRAFT, User.Role.REPRESENTANT);
        return ResponseEntity.ok(drafts.stream().map(auctionMapper::toResponse).toList());
    }
}
