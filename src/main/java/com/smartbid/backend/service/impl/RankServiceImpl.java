package com.smartbid.backend.service.impl;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.smartbid.backend.controller.dto.RankResponse;
import com.smartbid.backend.model.Bid;
import com.smartbid.backend.repository.BidRepository;
import com.smartbid.backend.service.RankService;

@Service
public class RankServiceImpl implements RankService {

    private final BidRepository bidRepository;

    public RankServiceImpl(BidRepository bidRepository) {
        this.bidRepository = bidRepository;
    }

    @Override
    public RankResponse computeUserRank(Long auctionId, String userEmail) {
        // 1) Toutes les mises de l’enchère
        List<Bid> allBids = bidRepository.findByAuction_Id(auctionId);
        RankResponse res = new RankResponse();

        if (allBids.isEmpty()) {
            res.setMyRank(-1);
            res.setMyBidUnique(false);
            res.setMyBidAmount(null);
            res.setHighestBidAmount(null);
            res.setUniqueCount(0);
            res.setTotalBids(0);
            return res;
        }

        // 2) Ne garder que la DERNIÈRE mise par utilisateur (clé = userId)
        //    => c'est cette liste "effectiveBids" qui sert au calcul du rang
        Map<Long, Bid> latestByUser = new HashMap<>();
        for (Bid b : allBids) {
            if (b.getUser() == null || b.getUser().getId() == null) continue;
            Long uid = b.getUser().getId();
            Bid prev = latestByUser.get(uid);
            if (prev == null) {
                latestByUser.put(uid, b);
            } else {
                // compare by createdAt (null-safe: une date null est considérée plus ancienne)
                if (isAfter(prev.getCreatedAt(), b.getCreatedAt())) {
                    latestByUser.put(uid, b);
                }
            }
        }
        List<Bid> effectiveBids = new ArrayList<>(latestByUser.values());
        if (effectiveBids.isEmpty()) {
            res.setMyRank(-1);
            res.setMyBidUnique(false);
            res.setMyBidAmount(null);
            res.setHighestBidAmount(null);
            res.setUniqueCount(0);
            res.setTotalBids(0);
            return res;
        }

        // 3) Normaliser les montants pour éviter les faux doublons (ex: 51, 51.0, 51.00)
        effectiveBids = effectiveBids.stream()
                .filter(b -> b.getAmount() != null)
                .map(b -> {
                    b.setAmount(normalize(b.getAmount()));
                    return b;
                })
                .toList();

        // 4) Plus grande mise (≈ “dernier”)
        BigDecimal highest = effectiveBids.stream()
                .map(Bid::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(null);

        // 5) Trouver MA dernière mise (dans effectiveBids)
        Bid myBid = null;
        if (userEmail != null) {
            myBid = effectiveBids.stream()
                    .filter(b -> b.getUser() != null
                            && b.getUser().getEmail() != null
                            && b.getUser().getEmail().equalsIgnoreCase(userEmail))
                    .findFirst()
                    .orElse(null);
        }

        // 6) Fréquences par montant (sur les dernières mises)
        Map<BigDecimal, Long> freq = effectiveBids.stream()
                .collect(Collectors.groupingBy(Bid::getAmount, Collectors.counting()));

        // 7) Montants UNIQUES triés (définissent le classement)
        List<BigDecimal> uniqueSorted = freq.entrySet().stream()
                .filter(e -> e.getValue() == 1L)
                .map(Map.Entry::getKey)
                .sorted()
                .toList();

        // 8) Remplir la réponse
        res.setHighestBidAmount(highest);
        res.setUniqueCount(uniqueSorted.size());
        res.setTotalBids(effectiveBids.size()); // = nb de joueurs actifs (1 par user)

        if (myBid == null) {
            res.setMyBidAmount(null);
            res.setMyBidUnique(false);
            res.setMyRank(-1);
            return res;
        }

        res.setMyBidAmount(myBid.getAmount());
        boolean myUnique = freq.getOrDefault(myBid.getAmount(), 0L) == 1L;
        res.setMyBidUnique(myUnique);

        int idx = uniqueSorted.indexOf(myBid.getAmount());
        res.setMyRank(myUnique ? (idx + 1) : -1);

        return res;
    }

    @Override
    public void pushRankUpdate(Long auctionId, Long userId) {
        // no-op (utilisé si tu fais un push ciblé manuellement)
    }

    /** createdAt a-t-il lieu après b ? null est considéré "ancien" */
    private static boolean isAfter(java.time.Instant a, java.time.Instant b) {
        if (a == null) return b != null;      // b non null => b est après a(null)
        if (b == null) return false;          // a non null, b null => a est après
        return a.isBefore(b);                 // on garde la plus récente (b) si b après a
    }

    /** Normalise un BigDecimal pour supprimer l'effet d'échelle (51 == 51.0 == 51.00) */
    private static BigDecimal normalize(BigDecimal x) {
        return x.stripTrailingZeros();
    }
}
