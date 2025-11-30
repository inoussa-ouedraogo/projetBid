package com.smartbid.backend.service;

public interface MailService {
    void send(String to, String subject, String body);
}
