package com.smartbid.backend.jobs;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.repository.AuctionRepository;
import com.smartbid.backend.service.AuctionService;

@Component
public class AuctionScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionScheduler.class);

    private final AuctionRepository auctionRepo;
    private final AuctionService auctionService;

    public AuctionScheduler(AuctionRepository auctionRepo, AuctionService auctionService) {
        this.auctionRepo = auctionRepo;
        this.auctionService = auctionService;
    }

    // --- Auto-START ---------------------------------------------------------
    // Toutes les minutes: démarre les enchères dont startAt est passé
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoStartAuctions() {
        Instant now = Instant.now();
        List<Long> toStart = auctionRepo.findIdsToAutoStart(now);
        if (toStart.isEmpty()) return;

        log.info("Auto-start: {} enchère(s) à démarrer (now={}).", toStart.size(), now);
        for (Long id : toStart) {
            try {
                auctionService.startNow(id);
                log.info("Enchère {} démarrée automatiquement.", id);
            } catch (Exception ex) {
                log.warn("Échec de démarrage auto pour {}: {}", id, ex.getMessage());
            }
        }
    }

    // --- Auto-CLOSE ---------------------------------------------------------
    // Toutes les minutes: clôture les enchères dont endAt est passé
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void autoCloseAuctions() {
        Instant now = Instant.now();
        List<Long> toClose = auctionRepo.findIdsToAutoClose(now);
        if (toClose.isEmpty()) return;

        log.info("Auto-close: {} enchère(s) à clôturer (now={}).", toClose.size(), now);
        for (Long id : toClose) {
            try {
                auctionService.closeAndPickWinner(id);
                log.info("Enchère {} clôturée automatiquement.", id);
            } catch (Exception ex) {
                log.warn("Échec de clôture auto pour {}: {}", id, ex.getMessage());
            }
        }
    }
}
