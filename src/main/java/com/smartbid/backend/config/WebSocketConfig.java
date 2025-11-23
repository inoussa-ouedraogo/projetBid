// com.smartbid.backend.config.WebSocketConfig
package com.smartbid.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  // Attach the handshake interceptor so SockJS can receive JWT via query (?token=)
  private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

  public WebSocketConfig(JwtHandshakeInterceptor jwtHandshakeInterceptor) {
    this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // personal queue: /user/queue/...
    config.enableSimpleBroker("/queue");
    config.setUserDestinationPrefix("/user");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
      .addInterceptors(jwtHandshakeInterceptor)
      .setAllowedOriginPatterns("*")  // tighten in production
      .withSockJS();
  }
}
