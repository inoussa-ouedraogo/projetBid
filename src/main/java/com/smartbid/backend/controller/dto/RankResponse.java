package com.smartbid.backend.controller.dto;

import java.math.BigDecimal;

public class RankResponse {
    // Rang de l'utilisateur parmi les montants uniques (1 = meilleur). -1 si sa mise n'est pas unique ou s'il n'a pas de mise.
    private int myRank;

    // Sa mise est-elle unique ?
    private boolean myBidUnique;

    // Montant de la dernière mise de l'utilisateur (ou null s'il n'a pas encore misé)
    private BigDecimal myBidAmount;

    // La plus grande mise observée sur l'enchère (≈ dernier)
    private BigDecimal highestBidAmount;

    // Nombre total de montants uniques (pratique pour inférer le "dernier rang")
    private int uniqueCount;

    // Nombre total d'offres (ou distinct users selon ton choix)
    private int totalBids;

    public int getMyRank() { return myRank; }
    public void setMyRank(int myRank) { this.myRank = myRank; }

    public boolean isMyBidUnique() { return myBidUnique; }
    public void setMyBidUnique(boolean myBidUnique) { this.myBidUnique = myBidUnique; }

    public BigDecimal getMyBidAmount() { return myBidAmount; }
    public void setMyBidAmount(BigDecimal myBidAmount) { this.myBidAmount = myBidAmount; }

    public BigDecimal getHighestBidAmount() { return highestBidAmount; }
    public void setHighestBidAmount(BigDecimal highestBidAmount) { this.highestBidAmount = highestBidAmount; }

    public int getUniqueCount() { return uniqueCount; }
    public void setUniqueCount(int uniqueCount) { this.uniqueCount = uniqueCount; }

    public int getTotalBids() { return totalBids; }
    public void setTotalBids(int totalBids) { this.totalBids = totalBids; }
}
