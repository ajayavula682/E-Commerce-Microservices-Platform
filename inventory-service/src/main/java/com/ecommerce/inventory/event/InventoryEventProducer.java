package com.ecommerce.inventory.event;

import com.ecommerce.common.event.InventoryReservedEvent;
import com.ecommerce.common.event.TopicNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventProducer {

    private final KafkaTemplate<String, InventoryReservedEvent> kafkaTemplate;

    public void publishInventoryReservedEvent(InventoryReservedEvent event) {
        log.info("Publishing InventoryReservedEvent for order ID: {}", event.getOrderId());
        kafkaTemplate.send(TopicNames.INVENTORY_RESERVED, event.getOrderId().toString(), event);
        log.info("InventoryReservedEvent published successfully for order ID: {}", event.getOrderId());
    }
}
