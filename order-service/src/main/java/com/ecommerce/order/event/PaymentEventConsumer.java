package com.ecommerce.order.event;

import com.ecommerce.common.event.PaymentCompletedEvent;
import com.ecommerce.common.event.TopicNames;
import com.ecommerce.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final OrderService orderService;

    @KafkaListener(topics = TopicNames.PAYMENT_COMPLETED, groupId = "order-service-group")
    public void handlePaymentCompletedEvent(PaymentCompletedEvent event) {
        log.info("Received PaymentCompletedEvent for order ID: {}", event.getOrderId());
        
        if (event.isPaymentSuccessful()) {
            log.info("Payment successful for order ID: {}. Updating order status to COMPLETED", event.getOrderId());
            orderService.completeOrder(event.getOrderId());
        } else {
            log.error("Payment failed for order ID: {}. Message: {}", event.getOrderId(), event.getMessage());
            orderService.failOrder(event.getOrderId(), event.getMessage());
        }
    }
}
