package com.ecommerce.inventory.event;

import com.ecommerce.common.event.InventoryReservedEvent;
import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.common.event.TopicNames;
import com.ecommerce.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final InventoryService inventoryService;
    private final InventoryEventProducer inventoryEventProducer;

    @KafkaListener(topics = TopicNames.ORDER_CREATED, groupId = "inventory-service-group")
    public void handleOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for order ID: {}", event.getOrderId());

        try {
            // Reserve inventory for all order items
            for (OrderCreatedEvent.OrderItemDto item : event.getOrderItems()) {
                inventoryService.reserveInventory(item.getProductId(), item.getQuantity());
            }

            log.info("Inventory reserved successfully for order ID: {}", event.getOrderId());

            // Publish InventoryReservedEvent (success)
            InventoryReservedEvent reservedEvent = InventoryReservedEvent.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .reservationSuccessful(true)
                    .message("Inventory reserved successfully")
                    .reservedAt(LocalDateTime.now())
                    .build();

            inventoryEventProducer.publishInventoryReservedEvent(reservedEvent);

        } catch (Exception ex) {
            log.error("Failed to reserve inventory for order ID: {}. Error: {}", 
                    event.getOrderId(), ex.getMessage());

            // Publish InventoryReservedEvent (failure)
            InventoryReservedEvent reservedEvent = InventoryReservedEvent.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .reservationSuccessful(false)
                    .message("Inventory reservation failed: " + ex.getMessage())
                    .reservedAt(LocalDateTime.now())
                    .build();

            inventoryEventProducer.publishInventoryReservedEvent(reservedEvent);
        }
    }
}
