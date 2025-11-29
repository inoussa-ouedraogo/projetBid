package com.smartbid.backend.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartbid.backend.service.CommissionService;

@RestController
@RequestMapping("/api/admin/commission")
public class AdminCommissionController {

    private final CommissionService service;

    public AdminCommissionController(CommissionService service) {
        this.service = service;
    }

    public record CommissionPayload(BigDecimal rate) {}

    @GetMapping
    public ResponseEntity<CommissionPayload> get() {
        return ResponseEntity.ok(new CommissionPayload(service.currentRate()));
    }

    @PutMapping
    public ResponseEntity<CommissionPayload> update(@RequestBody CommissionPayload payload) {
        if (payload == null || payload.rate() == null || payload.rate().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().build();
        }
        BigDecimal saved = service.updateRate(payload.rate());
        return ResponseEntity.ok(new CommissionPayload(saved));
    }
}
