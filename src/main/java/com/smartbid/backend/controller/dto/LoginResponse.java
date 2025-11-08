package com.smartbid.backend.controller.dto;

public class LoginResponse {
    private String token;
    private String tokenType;
    private long expiresIn;
    private String name;
    private String email;

    public LoginResponse(String token, String tokenType, long expiresIn, String name, String email) {
        this.token = token;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.name = name;
        this.email = email;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    public void setToken(String token) { this.token = token; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
}
