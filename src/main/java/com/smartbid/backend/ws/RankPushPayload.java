// com.smartbid.backend.ws.RankPushPayload
package com.smartbid.backend.ws;

import java.math.BigDecimal;

public class RankPushPayload {
  public Long auctionId;
  public int myRank;
  public boolean myBidUnique;
  public BigDecimal myBidAmount;
  public BigDecimal highestBidAmount;
  public int uniqueCount;
  public int totalBids;
}
