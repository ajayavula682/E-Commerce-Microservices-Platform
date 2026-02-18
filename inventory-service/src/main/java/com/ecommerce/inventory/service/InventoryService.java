package com.ecommerce.inventory.service;

import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.exception.InventoryNotFoundException;
import com.ecommerce.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public InventoryResponse createInventory(Long productId, Integer quantity) {
        log.info("Creating inventory for product ID: {} with quantity: {}", productId, quantity);
        
        Inventory inventory = Inventory.builder()
                .productId(productId)
                .availableQuantity(quantity)
                .reservedQuantity(0)
                .build();
        
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Inventory created with ID: {}", saved.getId());
        
        return toResponse(saved);
    }

    public InventoryResponse getInventoryByProductId(Long productId) {
        log.info("Fetching inventory for product ID: {}", productId);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
        return toResponse(inventory);
    }

    public List<InventoryResponse> getAllInventory() {
        log.info("Fetching all inventory");
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reserveInventory(Long productId, Integer quantity) {
        log.info("Reserving {} units of product ID: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
        
        inventory.reserveStock(quantity);
        inventoryRepository.save(inventory);
        
        log.info("Reserved {} units of product ID: {}. Available: {}, Reserved: {}", 
                quantity, productId, inventory.getAvailableQuantity(), inventory.getReservedQuantity());
    }

    @Transactional
    public void releaseInventory(Long productId, Integer quantity) {
        log.info("Releasing {} units of product ID: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
        
        inventory.releaseStock(quantity);
        inventoryRepository.save(inventory);
        
        log.info("Released {} units of product ID: {}. Available: {}, Reserved: {}", 
                quantity, productId, inventory.getAvailableQuantity(), inventory.getReservedQuantity());
    }

    @Transactional
    public InventoryResponse updateInventory(Long productId, Integer quantity) {
        log.info("Updating inventory for product ID: {} to quantity: {}", productId, quantity);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
        
        inventory.setAvailableQuantity(quantity);
        Inventory updated = inventoryRepository.save(inventory);
        
        log.info("Inventory updated for product ID: {}", productId);
        return toResponse(updated);
    }

    public boolean checkAvailability(Long productId, Integer quantity) {
        log.info("Checking availability of {} units for product ID: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product ID: " + productId));
        
        return inventory.hasAvailableStock(quantity);
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .build();
    }
}
