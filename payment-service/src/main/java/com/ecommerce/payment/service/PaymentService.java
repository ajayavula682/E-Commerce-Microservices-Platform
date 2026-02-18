package com.ecommerce.payment.service;

import com.ecommerce.common.event.PaymentCompletedEvent;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.entity.Payment.PaymentStatus;
import com.ecommerce.payment.exception.PaymentNotFoundException;
import com.ecommerce.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentCompletedEvent processPayment(Long orderId, Long userId) {
        log.info("Processing payment for order ID: {}", orderId);

        // Simulate payment processing (in real scenario, integrate with payment gateway)
        try {
            // Simulate payment delay
            Thread.sleep(1000);

            // Generate transaction ID
            String transactionId = "TXN-" + UUID.randomUUID().toString();

            // For simulation, we'll use a dummy amount
            // In real scenario, this would come from the order details
            BigDecimal amount = BigDecimal.valueOf(100.00);

            // Create payment record
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(amount)
                    .status(PaymentStatus.COMPLETED)
                    .transactionId(transactionId)
                    .message("Payment processed successfully")
                    .build();

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment completed successfully for order ID: {}. Transaction ID: {}", 
                    orderId, transactionId);

            // Build and return PaymentCompletedEvent
            return PaymentCompletedEvent.builder()
                    .orderId(savedPayment.getOrderId())
                    .userId(savedPayment.getUserId())
                    .amount(savedPayment.getAmount())
                    .paymentSuccessful(true)
                    .transactionId(savedPayment.getTransactionId())
                    .message(savedPayment.getMessage())
                    .completedAt(savedPayment.getCreatedAt())
                    .build();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing interrupted for order ID: {}", orderId);
            throw new RuntimeException("Payment processing interrupted");
        }
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        log.info("Fetching payment for order ID: {}", orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for order ID: " + orderId));
        return toResponse(payment);
    }

    public PaymentResponse getPaymentById(Long id) {
        log.info("Fetching payment with ID: {}", id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + id));
        return toResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        log.info("Fetching all payments");
        return paymentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        log.info("Fetching payments for user ID: {}", userId);
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        log.info("Fetching payments with status: {}", status);
        return paymentRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .message(payment.getMessage())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
