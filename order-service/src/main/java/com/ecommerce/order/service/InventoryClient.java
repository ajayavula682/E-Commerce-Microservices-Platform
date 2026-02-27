package com.ecommerce.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryClient {

    private final RestTemplate restTemplate;

    public boolean isAvailable(Long productId, Integer quantity) {
        String url = "http://inventory-service/api/inventory/check?productId={productId}&quantity={quantity}";
        try {
            Boolean response = restTemplate.getForObject(url, Boolean.class, productId, quantity);
            return Boolean.TRUE.equals(response);
        } catch (Exception ex) {
            log.error("Inventory availability check failed for product {}: {}", productId, ex.getMessage());
            throw new IllegalStateException("Unable to verify inventory availability for product " + productId);
        }
    }
}
