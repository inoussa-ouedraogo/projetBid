package com.smartbid.backend.mapper;

import org.springframework.stereotype.Component;
import com.smartbid.backend.controller.dto.AuctionResponse;
import com.smartbid.backend.model.Auction;
import com.smartbid.backend.model.Product;

@Component
public class AuctionMapper {

    public AuctionResponse toResponse(Auction auction) {
        if (auction == null) return null;

        Product product = auction.getProduct();

        AuctionResponse dto = new AuctionResponse();
        dto.setId(auction.getId());
        dto.setTitle(auction.getTitle());
        dto.setDescription(auction.getDescription());
        dto.setParticipationFee(auction.getParticipationFee());
        dto.setCurrency(auction.getCurrency());
        dto.setMinBid(auction.getMinBid());
        dto.setMaxBid(auction.getMaxBid());
        dto.setStartAt(auction.getStartAt());
        dto.setEndAt(auction.getEndAt());
        dto.setParticipantLimit(auction.getParticipantLimit());
        dto.setStatus(auction.getStatus());
        
        // ✅ Correction ici : utilise getWinnerBidId() au lieu de getWinnerBid()
        dto.setWinnerBidId(auction.getWinnerBidId());

        dto.setCreatedAt(auction.getCreatedAt());
        dto.setUpdatedAt(auction.getUpdatedAt());
        dto.setType(auction.getType());
        dto.setIsActive(auction.getIsActive());

        // 🧩 Informations liées au produit
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductTitle(product.getTitle());
            dto.setCategory(product.getCategory() != null ? product.getCategory().name() : null);
            dto.setImageUrl(product.getImageUrl());
        }

        return dto;
    }
}
