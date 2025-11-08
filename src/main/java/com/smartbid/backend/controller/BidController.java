package com.smartbid.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartbid.backend.controller.dto.BidCreateRequest;
import com.smartbid.backend.controller.dto.BidResponse;
import com.smartbid.backend.service.BidService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class BidController {

    private final BidService service;

    public BidController(BidService service) { 
        this.service = service; 
    }

    // POST /api/auctions/{auctionId}/bids  (auth requis)
    @PostMapping("/auctions/{auctionId}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long auctionId,
            @Valid @RequestBody BidCreateRequest req) {
        return ResponseEntity.ok(service.placeBid(auctionId, req));
    }

    // GET /api/auctions/{auctionId}/bids
    @GetMapping("/auctions/{auctionId}/bids")
    public ResponseEntity<List<BidResponse>> getBidsByAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(service.listByAuction(auctionId));
    }

    // GET /api/auctions/{auctionId}/bids/paged?page=0&size=10&sort=createdAt,DESC
    @GetMapping("/auctions/{auctionId}/bids/paged")
    public ResponseEntity<Page<BidResponse>> listForAuction(
            @PathVariable Long auctionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,DESC") String sort) {

        String[] s = sort.split(",", 2);
        Sort order = Sort.by(Sort.Direction.fromString(s.length > 1 ? s[1] : "DESC"), s[0]);
        return ResponseEntity.ok(service.listByAuction(auctionId, PageRequest.of(page, size, order)));
    }

    // GET /api/me/bids/paged?page=0&size=10&sort=createdAt,DESC
    @GetMapping("/me/bids/paged")
    public ResponseEntity<Page<BidResponse>> myBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,DESC") String sort) {

        String[] s = sort.split(",", 2);
        Sort order = Sort.by(Sort.Direction.fromString(s.length > 1 ? s[1] : "DESC"), s[0]);
        return ResponseEntity.ok(service.listMyBids(PageRequest.of(page, size, order)));
    }
}
