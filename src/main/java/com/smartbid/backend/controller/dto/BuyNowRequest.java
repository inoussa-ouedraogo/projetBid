package com.smartbid.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;

public class BuyNowRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;
    @NotBlank
    private String city;
    @NotBlank
    private String paymentMethod; // e.g. ORANGE_MONEY, CASH_ON_DELIVERY

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
