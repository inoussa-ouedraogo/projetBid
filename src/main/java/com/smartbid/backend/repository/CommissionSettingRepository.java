package com.smartbid.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartbid.backend.model.CommissionSetting;

public interface CommissionSettingRepository extends JpaRepository<CommissionSetting, Long> {
}
