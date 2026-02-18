package com.ecommerce.order.event;

import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.common.event.TopicNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Publishing OrderCreatedEvent for order ID: {}", event.getOrderId());
        kafkaTemplate.send(TopicNames.ORDER_CREATED, event.getOrderId().toString(), event);
        log.info("OrderCreatedEvent published successfully for order ID: {}", event.getOrderId());
    }
}
