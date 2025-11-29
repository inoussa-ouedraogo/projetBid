package com.smartbid.backend.service.impl;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartbid.backend.model.CommissionSetting;
import com.smartbid.backend.repository.CommissionSettingRepository;
import com.smartbid.backend.service.CommissionService;

@Service
@Transactional
public class CommissionServiceImpl implements CommissionService {

    private final CommissionSettingRepository repo;

    public CommissionServiceImpl(CommissionSettingRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal currentRate() {
        return repo.findAll().stream()
                .findFirst()
                .map(CommissionSetting::getRate)
                .orElse(BigDecimal.ZERO);
    }

    @Override
    public BigDecimal updateRate(BigDecimal newRate) {
        CommissionSetting setting = repo.findAll().stream().findFirst().orElse(new CommissionSetting());
        setting.setRate(newRate);
        return repo.save(setting).getRate();
    }
}
