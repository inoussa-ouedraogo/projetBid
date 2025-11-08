package com.smartbid.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.smartbid.backend.controller.dto.RankResponse;
import com.smartbid.backend.service.RankService;

@RestController
@RequestMapping("/api/auctions")
public class RankController {

    private final RankService rankService;

    public RankController(RankService rankService) {
        this.rankService = rankService;
    }

    @GetMapping("/{auctionId}/my-rank")
    public RankResponse getMyRank(@PathVariable Long auctionId, Authentication auth) {
        String userEmail = (auth != null) ? auth.getName() : null;
        return rankService.computeUserRank(auctionId, userEmail);
    }
}
