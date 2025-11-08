// com.smartbid.backend.ws.RankSubscriptionRegistry
package com.smartbid.backend.ws;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.stereotype.Component;

@Component
public class RankSubscriptionRegistry {
  // userEmail -> set d’auctionIds souscrits
  private final Map<String, Set<Long>> subscriptions = new ConcurrentHashMap<>();

  public Map<String, Set<Long>> snapshot() { return subscriptions; }

  @EventListener
  public void onSubscribe(org.springframework.messaging.simp.broker.BrokerAvailabilityEvent e) {}

  @EventListener
  public void handleSubscribeEvent(org.springframework.web.socket.messaging.SessionSubscribeEvent event) {
    StompHeaderAccessor acc = StompHeaderAccessor.wrap(event.getMessage());
    String dest = acc.getDestination();        // ex: /user/queue/rank.34
    if (dest == null) return;
    var user = acc.getUser();
    if (user == null) return;
    String email = user.getName();

    if (dest.startsWith("/user/queue/rank.")) {
      try {
        Long auctionId = Long.valueOf(dest.substring("/user/queue/rank.".length()));
        subscriptions.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet()).add(auctionId);
      } catch (Exception ignored) {}
    }
  }

  @EventListener
  public void handleUnsubscribeEvent(org.springframework.web.socket.messaging.SessionUnsubscribeEvent event) {
    // Optionnel: nettoyer si besoin (tu reçois pas l’auctionId facilement ici)
  }

  @EventListener
  public void handleDisconnect(org.springframework.web.socket.messaging.SessionDisconnectEvent event) {
    var user = StompHeaderAccessor.wrap(event.getMessage()).getUser();
    if (user != null) subscriptions.remove(user.getName());
  }
}
