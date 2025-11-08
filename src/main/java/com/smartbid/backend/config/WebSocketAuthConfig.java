// com.smartbid.backend.config.WebSocketAuthConfig
package com.smartbid.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtChannelInterceptor jwtChannelInterceptor;

  public WebSocketAuthConfig(JwtChannelInterceptor interceptor) {
    this.jwtChannelInterceptor = interceptor;
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(jwtChannelInterceptor);
  }
}
