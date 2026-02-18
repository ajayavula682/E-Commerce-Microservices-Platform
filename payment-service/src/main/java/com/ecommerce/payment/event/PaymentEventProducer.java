package com.ecommerce.payment.event;

import com.ecommerce.common.event.PaymentCompletedEvent;
import com.ecommerce.common.event.TopicNames;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, PaymentCompletedEvent> kafkaTemplate;

    public void publishPaymentCompletedEvent(PaymentCompletedEvent event) {
        log.info("Publishing PaymentCompletedEvent for order ID: {}", event.getOrderId());
        kafkaTemplate.send(TopicNames.PAYMENT_COMPLETED, event.getOrderId().toString(), event);
        log.info("PaymentCompletedEvent published successfully for order ID: {}", event.getOrderId());
    }
}
