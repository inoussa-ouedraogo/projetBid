package com.smartbid.backend.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.smartbid.backend.service.MailService;

@Service
public class MailServiceStub implements MailService {
    private static final Logger log = LoggerFactory.getLogger(MailServiceStub.class);

    @Override
    public void send(String to, String subject, String body) {
        log.info("[mail-stub] to={} | subject={} | body={}", to, subject, body);
    }
}
