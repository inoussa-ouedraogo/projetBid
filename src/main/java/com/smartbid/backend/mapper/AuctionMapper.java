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
        dto.setCity(auction.getCity());
        dto.setParticipationFee(auction.getParticipationFee());
        dto.setCurrency(auction.getCurrency());
        dto.setMinBid(auction.getMinBid());
        dto.setMaxBid(auction.getMaxBid());
        dto.setStartAt(auction.getStartAt());
        dto.setEndAt(auction.getEndAt());
        dto.setParticipantLimit(auction.getParticipantLimit());
        dto.setStatus(auction.getStatus());
        // participantCount remains to be filled by service
        
        // ✅ Correction ici : utilise getWinnerBidId() au lieu de getWinnerBid()
        dto.setWinnerBidId(auction.getWinnerBidId());

        dto.setCreatedAt(auction.getCreatedAt());
        dto.setUpdatedAt(auction.getUpdatedAt());
        dto.setType(auction.getType());
        dto.setIsActive(auction.getIsActive());
        // Prix d'achat immédiat calé sur le minimum (meilleure affaire)
        dto.setBuyNowPrice(auction.getMinBid());

        if (auction.getCreatedBy() != null) {
            dto.setCreatedById(auction.getCreatedBy().getId());
            dto.setCreatedByName(auction.getCreatedBy().getName());
            dto.setCreatedByEmail(auction.getCreatedBy().getEmail());
        }

        // 🧩 Informations liées au produit
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductTitle(product.getTitle());
            dto.setBasePrice(product.getBasePrice());
            dto.setCategory(product.getCategory() != null ? product.getCategory().name() : null);
            dto.setImageUrl(product.getImageUrl());
            dto.setImageUrl2(product.getImageUrl2());
            dto.setImageUrl3(product.getImageUrl3());
        }

        return dto;
    }
}
