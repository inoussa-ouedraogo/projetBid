package com.smartbid.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.controller.dto.PurchaseResponse;
import com.smartbid.backend.service.PurchaseService;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    // Admin: voir toutes les achats
    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> listAll() {
        return ResponseEntity.ok(purchaseService.listAll());
    }

    // Représentant : voir les achats de ses enchères
    @GetMapping("/my-auctions")
    public ResponseEntity<List<PurchaseResponse>> listMine(Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(purchaseService.listForCreator(email));
    }

    // Acheteur : voir ses propres achats
    @GetMapping("/mine")
    public ResponseEntity<List<PurchaseResponse>> mine(Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(purchaseService.listForBuyer(email));
    }
}
