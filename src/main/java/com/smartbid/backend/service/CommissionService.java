package com.smartbid.backend.service;

import java.math.BigDecimal;

public interface CommissionService {
    BigDecimal currentRate();
    BigDecimal updateRate(BigDecimal newRate);
}
