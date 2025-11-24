package com.smartbid.backend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.controller.dto.PurchaseResponse;
import com.smartbid.backend.model.Purchase;
import com.smartbid.backend.repository.PurchaseRepository;
import com.smartbid.backend.service.PurchaseService;

@Service
@Transactional(readOnly = true)
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;

    public PurchaseServiceImpl(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    @Override
    public List<PurchaseResponse> listAll() {
        return purchaseRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PurchaseResponse> listForCreator(String email) {
        return purchaseRepository.findByAuctionCreator(email).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PurchaseResponse> listForBuyer(String buyerEmail) {
        return purchaseRepository.findByBuyerEmail(buyerEmail).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PurchaseResponse toResponse(Purchase p) {
        PurchaseResponse r = new PurchaseResponse();
        r.setId(p.getId());
        r.setAuctionId(p.getAuction().getId());
        r.setAuctionTitle(p.getAuction().getTitle());
        if (p.getAuction().getProduct() != null) {
            r.setProductTitle(p.getAuction().getProduct().getTitle());
        }
        r.setBuyerEmail(p.getBuyerEmail());
        r.setFullName(p.getFullName());
        r.setPhone(p.getPhone());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setPaymentMethod(p.getPaymentMethod());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
