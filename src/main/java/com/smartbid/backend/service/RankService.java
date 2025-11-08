package com.smartbid.backend.service;

import com.smartbid.backend.controller.dto.RankResponse;

public interface RankService {
    RankResponse computeUserRank(Long auctionId, String userEmail);

    // Optionnel, garde-le en default si tu ne pushes pas en temps réel
    default void pushRankUpdate(Long auctionId, Long userId) {}
}
