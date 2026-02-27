package com.ecommerce.order.service;

import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.order.dto.OrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.Order.OrderStatus;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.event.OrderEventProducer;
import com.ecommerce.order.exception.OrderNotFoundException;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderEventProducer orderEventProducer;
    private final InventoryClient inventoryClient;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        log.info("Creating order for user ID: {}", request.getUserId());

        // Create order entity
        Order order = orderMapper.toEntity(request);
        order.setStatus(OrderStatus.AWAITING_APPROVAL);

        // Calculate total amount and add order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            OrderItem orderItem = orderMapper.toOrderItem(itemRequest);
            order.addOrderItem(orderItem);
            
            BigDecimal itemTotal = itemRequest.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {} and status: {}", savedOrder.getId(), savedOrder.getStatus());

        log.info("Order {} is awaiting admin approval before inventory/payment flow", savedOrder.getId());

        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse approveOrder(Long orderId) {
        log.info("Approving order with ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (order.getStatus() != OrderStatus.AWAITING_APPROVAL) {
            throw new IllegalStateException("Only AWAITING_APPROVAL orders can be approved");
        }

        for (OrderItem item : order.getOrderItems()) {
            boolean available = inventoryClient.isAvailable(item.getProductId(), item.getQuantity());
            if (!available) {
                throw new IllegalStateException("Insufficient stock for product ID: " + item.getProductId());
            }
        }

        order.setStatus(OrderStatus.PENDING);
        Order savedOrder = orderRepository.save(order);

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .totalAmount(savedOrder.getTotalAmount())
                .orderItems(savedOrder.getOrderItems().stream()
                        .map(item -> OrderCreatedEvent.OrderItemDto.builder()
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(savedOrder.getCreatedAt())
                .build();

        orderEventProducer.publishOrderCreatedEvent(event);
        log.info("Order {} approved and sent to inventory service", orderId);
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse rejectOrder(Long orderId) {
        log.info("Rejecting order with ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));

        if (order.getStatus() != OrderStatus.AWAITING_APPROVAL) {
            throw new IllegalStateException("Only AWAITING_APPROVAL orders can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);
        Order savedOrder = orderRepository.save(order);
        return orderMapper.toResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long id) {
        log.info("Fetching order with ID: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + id));
        return orderMapper.toResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll()
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        log.info("Fetching orders for user ID: {}", userId);
        return orderRepository.findByUserId(userId)
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        log.info("Fetching orders with status: {}", status);
        return orderRepository.findByStatus(status)
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void completeOrder(Long orderId) {
        log.info("Completing order with ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
        
        order.setStatus(OrderStatus.COMPLETED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Order {} completed successfully", orderId);
    }

    @Transactional
    public void failOrder(Long orderId, String reason) {
        log.error("Failing order with ID: {}. Reason: {}", orderId, reason);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
        
        order.setStatus(OrderStatus.FAILED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Order {} marked as FAILED", orderId);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        log.info("Cancelling order with ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
        
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        log.info("Order {} cancelled", orderId);
    }
}
