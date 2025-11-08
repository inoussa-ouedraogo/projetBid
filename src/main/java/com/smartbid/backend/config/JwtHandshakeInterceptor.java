package com.smartbid.backend.config;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.smartbid.backend.security.JwtUtil;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {
        // 1) Récupération du token depuis query param ?token= ou ?access_token=
        String token = null;
        URI uri = request.getURI();
        String query = uri.getQuery();
        if (query != null) {
            for (String part : query.split("&")) {
                String[] kv = part.split("=", 2);
                if (kv.length == 2) {
                    String k = kv[0];
                    String v = kv[1];
                    if ("token".equalsIgnoreCase(k) || "access_token".equalsIgnoreCase(k)) {
                        token = v;
                        break;
                    }
                }
            }
        }

        // 2) Sinon depuis l’en-tête Authorization: Bearer xxx
        if (token == null) {
            List<String> auths = request.getHeaders().get("Authorization");
            if (auths != null && !auths.isEmpty()) {
                String h = auths.get(0);
                if (h.startsWith("Bearer ")) {
                    token = h.substring(7);
                }
            }
        }

        // 3) Validation minimale du JWT
        if (token != null) {
            try {
                String email = jwtUtil.extractUsername(token);
                if (jwtUtil.validateToken(token, email)) {
                    // On met l’email dans les attributs pour le canal utilisateur (/user/…)
                    attributes.put("email", email);
                    return true;
                }
            } catch (Exception ignored) { }
        }

        // 4) Rejet du handshake si token invalide/absent
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // no-op
    }
}
