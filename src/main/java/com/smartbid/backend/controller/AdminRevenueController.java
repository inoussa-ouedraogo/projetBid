package com.smartbid.backend.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.model.RevenueEntry.RevenueType;
import com.smartbid.backend.repository.RevenueEntryRepository;

@RestController
@RequestMapping("/api/admin/revenue")
public class AdminRevenueController {

    private final RevenueEntryRepository revenueRepo;

    public AdminRevenueController(RevenueEntryRepository revenueRepo) {
        this.revenueRepo = revenueRepo;
    }

    public record Summary(BigDecimal total, BigDecimal commissions, BigDecimal participationFees) {}

    @GetMapping("/summary")
    public ResponseEntity<Summary> summary() {
        BigDecimal total = revenueRepo.sumAll();
        BigDecimal commissions = revenueRepo.sumByType(RevenueType.COMMISSION);
        BigDecimal fees = revenueRepo.sumByType(RevenueType.PARTICIPATION_FEE);
        return ResponseEntity.ok(new Summary(total, commissions, fees));
    }
}
