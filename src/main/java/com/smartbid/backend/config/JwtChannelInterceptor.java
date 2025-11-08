// src/main/java/com/smartbid/backend/config/JwtChannelInterceptor.java
package com.smartbid.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import com.smartbid.backend.security.JwtUtil;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

  private final JwtUtil jwtUtil;

  public JwtChannelInterceptor(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String auth = accessor.getFirstNativeHeader("Authorization");
      if (auth != null && auth.startsWith("Bearer ")) {
        String token = auth.substring(7);
        String email = jwtUtil.extractUsername(token);
        accessor.setUser(() -> email); // Principal = email
      }
    }
    return message;
  }
}
