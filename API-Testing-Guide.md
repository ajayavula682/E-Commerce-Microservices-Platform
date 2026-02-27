# API Testing Guide - E-Commerce Microservices Platform

## Base URL
```
http://localhost:8080
```

## Testing Workflow

### 1. Product Service
Test these endpoints first to create products in the system:

#### Create Product
**POST** `/api/products`
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone with A17 Pro chip",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50
}
```

**Additional Test Products:**
```json
{
  "name": "Samsung Galaxy S24",
  "description": "Flagship Android smartphone",
  "price": 799.99,
  "category": "Electronics",
  "stock": 75
}
```

```json
{
  "name": "MacBook Pro 14",
  "description": "M3 Pro chip, 16GB RAM",
  "price": 1999.99,
  "category": "Computers",
  "stock": 30
}
```

```json
{
  "name": "AirPods Pro",
  "description": "Wireless earbuds with active noise cancellation",
  "price": 249.99,
  "category": "Accessories",
  "stock": 100
}
```

#### Get All Products
**GET** `/api/products`

#### Get Product By ID
**GET** `/api/products/1`

#### Search Products
**GET** `/api/products/search?name=iPhone`

#### Get Products By Category
**GET** `/api/products/category/Electronics`

#### Update Product
**PUT** `/api/products/1`
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "Latest Apple smartphone with A17 Pro chip - Updated",
  "price": 1199.99,
  "category": "Electronics",
  "stock": 45
}
```

---

### 2. Inventory Service
After creating products, manage inventory:

#### Create Inventory
**POST** `/api/inventory?productId=1&quantity=100`

**Test Multiple Products:**
- Product ID 1: `?productId=1&quantity=100`
- Product ID 2: `?productId=2&quantity=150`
- Product ID 3: `?productId=3&quantity=50`

#### Get Inventory By Product ID
**GET** `/api/inventory/product/1`

#### Get All Inventory
**GET** `/api/inventory`

#### Check Availability
**GET** `/api/inventory/check?productId=1&quantity=5`

#### Reserve Inventory
**POST** `/api/inventory/reserve?productId=1&quantity=3`

#### Release Inventory
**POST** `/api/inventory/release?productId=1&quantity=2`

#### Update Inventory
**PUT** `/api/inventory/product/1?quantity=150`

---

### 3. Order Service
Create orders after products and inventory are set up:

#### Create Order (Single Item)
**POST** `/api/orders`
```json
{
  "userId": 1,
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 999.99
    }
  ]
}
```

#### Create Order (Multiple Items)
**POST** `/api/orders`
```json
{
  "userId": 1,
  "orderItems": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 999.99
    },
    {
      "productId": 2,
      "quantity": 1,
      "price": 799.99
    }
  ]
}
```

#### Create Order (Different User)
**POST** `/api/orders`
```json
{
  "userId": 2,
  "orderItems": [
    {
      "productId": 3,
      "quantity": 1,
      "price": 1999.99
    },
    {
      "productId": 4,
      "quantity": 2,
      "price": 249.99
    }
  ]
}
```

#### Get Order By ID
**GET** `/api/orders/1`

#### Get All Orders
**GET** `/api/orders`

#### Get Orders By User ID
**GET** `/api/orders/user/1`

#### Get Orders By Status
**GET** `/api/orders/status/{status}`

Available statuses:
- `PENDING`
- `CONFIRMED`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

Examples:
- `/api/orders/status/PENDING`
- `/api/orders/status/CONFIRMED`

#### Cancel Order
**PUT** `/api/orders/1/cancel`

---

### 4. Payment Service
Payments are automatically created when orders are placed:

#### Get Payment By ID
**GET** `/api/payments/1`

#### Get Payment By Order ID
**GET** `/api/payments/order/1`

#### Get All Payments
**GET** `/api/payments`

#### Get Payments By User ID
**GET** `/api/payments/user/1`

#### Get Payments By Status
**GET** `/api/payments/status/{status}`

Available statuses:
- `PENDING`
- `SUCCESS`
- `FAILED`

Examples:
- `/api/payments/status/SUCCESS`
- `/api/payments/status/PENDING`

---

## Complete Testing Workflow

### Step-by-Step Test Sequence:

1. **Create Products** (Product Service)
   - Create 3-4 products using POST `/api/products`
   - Verify with GET `/api/products`

2. **Setup Inventory** (Inventory Service)
   - Create inventory for each product using POST `/api/inventory`
   - Check availability with GET `/api/inventory/check`

3. **Create Orders** (Order Service)
   - Create order with POST `/api/orders`
   - This will automatically:
     - Reserve inventory
     - Create payment record
   - Verify order with GET `/api/orders/{id}`

4. **Check Payments** (Payment Service)
   - Get payment for the order with GET `/api/payments/order/{orderId}`
   - View all payments with GET `/api/payments`

5. **Manage Orders**
   - Get orders by user with GET `/api/orders/user/1`
   - Get orders by status with GET `/api/orders/status/PENDING`
   - Cancel order with PUT `/api/orders/{id}/cancel`

6. **Verify Inventory Updates**
   - Check inventory after orders with GET `/api/inventory`
   - Verify quantities have been updated

---

## Error Test Cases

### Product Service Errors:
```json
// Missing required fields
{
  "name": "",
  "price": -10,
  "stock": -5
}
```

### Order Service Errors:
```json
// Empty order items
{
  "userId": 1,
  "orderItems": []
}
```

```json
// Invalid quantity
{
  "userId": 1,
  "orderItems": [
    {
      "productId": 1,
      "quantity": 0,
      "price": 999.99
    }
  ]
}
```

### Inventory Errors:
- Reserve more than available: `/api/inventory/reserve?productId=1&quantity=999999`
- Check invalid product: `/api/inventory/product/99999`

---

## Import to Postman

1. Open Postman
2. Click **Import** button
3. Select `Ecommerce-API-Collection.postman_collection.json`
4. The collection will be imported with all folders and requests
5. All requests use the variable `{{base_url}}` set to `http://localhost:8080`

## Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:8080`

You can add more variables as needed:
- `productId`: Store created product ID
- `orderId`: Store created order ID
- `userId`: Store user ID for testing

---

## Expected Response Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Validation errors
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors
