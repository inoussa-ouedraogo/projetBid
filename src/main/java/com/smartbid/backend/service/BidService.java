package com.smartbid.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.smartbid.backend.controller.dto.BidCreateRequest;
import com.smartbid.backend.controller.dto.BidResponse;

public interface BidService {
    BidResponse placeBid(Long auctionId, BidCreateRequest req);
    Page<BidResponse> listByAuction(Long auctionId, Pageable pageable);
    List<BidResponse> listByAuction(Long auctionId); // version simple
    Page<BidResponse> listMyBids(Pageable pageable);
}
