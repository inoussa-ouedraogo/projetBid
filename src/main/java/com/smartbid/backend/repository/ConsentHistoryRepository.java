package com.smartbid.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartbid.backend.model.ConsentHistory;

public interface ConsentHistoryRepository extends JpaRepository<ConsentHistory, Long> {
}
