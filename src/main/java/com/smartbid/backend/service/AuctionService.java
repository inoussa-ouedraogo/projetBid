package com.smartbid.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smartbid.backend.controller.dto.AuctionCreateRequest;
import com.smartbid.backend.controller.dto.AuctionResponse;
import com.smartbid.backend.controller.dto.AuctionUpdateRequest;
import com.smartbid.backend.controller.dto.BidResponse;
import com.smartbid.backend.model.AuctionStatus;

public interface AuctionService {
    AuctionResponse create(AuctionCreateRequest req);
    AuctionResponse getById(Long id);
    List<AuctionResponse> list(Long productId, AuctionStatus status, String category, String search);
    AuctionResponse update(Long id, AuctionUpdateRequest req);
    void delete(Long id);
    Page<AuctionResponse> listPaged(Pageable pageable, AuctionStatus status, String category, String search);
    AuctionResponse closeAndPickWinner(Long auctionId);
    AuctionResponse startNow(Long auctionId);
 AuctionResponse startAuction(Long id);
    AuctionResponse approve(Long id);
    List<AuctionResponse> listMine(AuctionStatus status);
 
     // AuctionService.java
 BidResponse getWinner(Long auctionId);
 List<AuctionResponse> listByCategory(String category);
 List<AuctionResponse> listParticipated();
 
 
}
