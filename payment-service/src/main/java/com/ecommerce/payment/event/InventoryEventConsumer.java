package com.ecommerce.payment.event;

import com.ecommerce.common.event.InventoryReservedEvent;
import com.ecommerce.common.event.PaymentCompletedEvent;
import com.ecommerce.common.event.TopicNames;
import com.ecommerce.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventConsumer {

    private final PaymentService paymentService;
    private final PaymentEventProducer paymentEventProducer;

    @KafkaListener(topics = TopicNames.INVENTORY_RESERVED, groupId = "payment-service-group")
    public void handleInventoryReservedEvent(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent for order ID: {}", event.getOrderId());

        if (!event.isReservationSuccessful()) {
            log.error("Inventory reservation failed for order ID: {}. Message: {}", 
                    event.getOrderId(), event.getMessage());
            
            // Publish PaymentCompletedEvent (failure due to inventory)
            PaymentCompletedEvent paymentEvent = PaymentCompletedEvent.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .amount(null)
                    .paymentSuccessful(false)
                    .transactionId(null)
                    .message("Payment skipped: " + event.getMessage())
                    .completedAt(event.getReservedAt())
                    .build();
            
            paymentEventProducer.publishPaymentCompletedEvent(paymentEvent);
            return;
        }

        try {
            // Process payment
            log.info("Processing payment for order ID: {}", event.getOrderId());
            PaymentCompletedEvent paymentEvent = paymentService.processPayment(
                    event.getOrderId(), 
                    event.getUserId()
            );
            
            // Publish PaymentCompletedEvent
            paymentEventProducer.publishPaymentCompletedEvent(paymentEvent);
            
        } catch (Exception ex) {
            log.error("Payment processing failed for order ID: {}. Error: {}", 
                    event.getOrderId(), ex.getMessage());
            
            // Publish PaymentCompletedEvent (failure)
            PaymentCompletedEvent paymentEvent = PaymentCompletedEvent.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .amount(null)
                    .paymentSuccessful(false)
                    .transactionId(null)
                    .message("Payment failed: " + ex.getMessage())
                    .completedAt(event.getReservedAt())
                    .build();
            
            paymentEventProducer.publishPaymentCompletedEvent(paymentEvent);
        }
    }
}
