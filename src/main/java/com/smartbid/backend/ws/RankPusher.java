// src/main/java/com/smartbid/backend/ws/RankPusher.java
package com.smartbid.backend.ws;

import java.util.Map;
import java.util.Set;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.smartbid.backend.controller.dto.RankResponse;
import com.smartbid.backend.service.RankService;

@Component
public class RankPusher {

  private final RankSubscriptionRegistry registry;
  private final SimpMessagingTemplate simp;
  private final RankService rankService;

  public RankPusher(RankSubscriptionRegistry registry, SimpMessagingTemplate simp, RankService rankService) {
    this.registry = registry;
    this.simp = simp;
    this.rankService = rankService;
  }

  @Scheduled(fixedRate = 5000)
  public void pushRank() {
    for (Map.Entry<String, Set<Long>> e : registry.snapshot().entrySet()) {
      String email = e.getKey();
      for (Long auctionId : e.getValue()) {
        RankResponse r = rankService.computeUserRank(auctionId, email);

        RankPushPayload p = new RankPushPayload();
        p.auctionId = auctionId;
        p.myRank = r.getMyRank();
        p.myBidUnique = r.isMyBidUnique();
        p.myBidAmount = r.getMyBidAmount();
        p.highestBidAmount = r.getHighestBidAmount();
        p.uniqueCount = r.getUniqueCount();
        p.totalBids = r.getTotalBids();

        simp.convertAndSendToUser(email, "/queue/rank." + auctionId, p);
      }
    }
  }
}
