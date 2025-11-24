package com.smartbid.backend.service;

import java.util.List;

import com.smartbid.backend.controller.dto.PurchaseResponse;

public interface PurchaseService {
    List<PurchaseResponse> listAll();
    List<PurchaseResponse> listForCreator(String email);
    List<PurchaseResponse> listForBuyer(String buyerEmail);
}
