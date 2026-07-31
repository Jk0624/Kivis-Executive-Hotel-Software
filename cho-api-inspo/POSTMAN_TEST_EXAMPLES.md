# Postman Test Examples

## Base URL
```
http://localhost:3000/api/v1
```

---

## ADDONS ENDPOINTS

### 1. Create Free Addon
**POST** `/addons`
```json
{
  "restaurantId": "1",
  "name": "Stew",
  "description": "Free stew addon",
  "price": 0,
  "isActive": true
}
```

### 2. Create Paid Addon
**POST** `/addons`
```json
{
  "restaurantId": "1",
  "name": "Extra Egg",
  "description": "Add an extra egg to your meal",
  "price": 2.50,
  "isActive": true
}
```

### 3. Get All Addons
**GET** `/addons?restaurantId=1&isActive=true&page=1&limit=20`

### 4. Get Single Addon
**GET** `/addons/1`

### 5. Update Addon
**PUT** `/addons/1`
```json
{
  "name": "Extra Egg (Updated)",
  "price": 3.00,
  "isActive": true
}
```

### 6. Delete Addon
**DELETE** `/addons/1`

---

## FOOD-ADDON ENDPOINTS

### 7. Add Addon to Food (Paid Addon)
**POST** `/foods/1/addons`
```json
{
  "addonId": "1",
  "isRequired": false,
  "maxQuantity": 5
}
```

### 8. Add Free Addon to Food
**POST** `/foods/1/addons`
```json
{
  "addonId": "2",
  "isRequired": false,
  "maxQuantity": null
}
```

### 9. Get Food Addons
**GET** `/foods/1/addons?isActive=true`

### 10. Remove Addon from Food
**DELETE** `/foods/1/addons/1`

### 11. Get Food with Addons
**GET** `/foods/1`

### 12. Get All Foods with Addons
**GET** `/foods?includeAddons=true&restaurantId=1`

---

## ORDER ENDPOINTS

### 13. Create Simple Order
**POST** `/orders`
```json
{
  "userId": "1",
  "restaurantId": "1",
  "deliveryAddress": "123 Main Street, City, Country",
  "deliveryFee": 5.00,
  "paymentMethodId": "1",
  "items": [
    {
      "foodId": "1",
      "quantity": 2,
      "addons": [
        {
          "addonId": "1",
          "quantity": 1
        }
      ]
    }
  ]
}
```

### 14. Create Complex Order (Multiple Items & Addons)
**POST** `/orders`
```json
{
  "userId": "1",
  "restaurantId": "1",
  "deliveryAddress": "456 Oak Avenue, City, Country",
  "deliveryFee": 7.50,
  "paymentMethodId": "1",
  "items": [
    {
      "foodId": "1",
      "quantity": 2,
      "addons": [
        {
          "addonId": "1",
          "quantity": 2
        },
        {
          "addonId": "2",
          "quantity": 1
        }
      ]
    },
    {
      "foodId": "2",
      "quantity": 1,
      "addons": [
        {
          "addonId": "1",
          "quantity": 1
        }
      ]
    }
  ]
}
```

### 15. Create Order with Free Addon
**POST** `/orders`
```json
{
  "userId": "1",
  "restaurantId": "1",
  "deliveryAddress": "789 Pine Road, City, Country",
  "deliveryFee": 5.00,
  "items": [
    {
      "foodId": "1",
      "quantity": 1,
      "addons": [
        {
          "addonId": "2",
          "quantity": 1
        }
      ]
    }
  ]
}
```

### 15a. Create Order with Payment Initialization
**POST** `/orders`
```json
{
  "userId": "1",
  "restaurantId": "1",
  "deliveryAddress": "123 Main Street, City, Country",
  "deliveryFee": 5.00,
  "items": [
    {
      "foodId": "1",
      "quantity": 2,
      "addons": [
        {
          "addonId": "1",
          "quantity": 1
        }
      ]
    }
  ],
  "initializePayment": true,
  "paymentCallbackUrl": "https://yourapp.com/payment/callback"
}
```
**Response includes:** `payment` object with `authorizationUrl`, `accessCode`, `reference`, and `transactionId`

### 16. Get All Orders
**GET** `/orders?userId=1&restaurantId=1&status=PENDING&page=1&limit=20`

### 17. Get Single Order
**GET** `/orders/1`

### 18. Update Order Status
**PUT** `/orders/1/status`
```json
{
  "status": "CONFIRMED"
}
```
**Valid statuses:** `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`

### 19. Cancel Order
**DELETE** `/orders/1`

### 20. Get User Orders
**GET** `/orders/users/1?status=PENDING&page=1&limit=20`

---

## PAYMENT ENDPOINTS

### 21. Initialize Payment for Order
**POST** `/payments/initialize`
```json
{
  "orderId": "1",
  "callbackUrl": "https://yourapp.com/payment/callback"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxxxx",
    "accessCode": "xxxxx",
    "reference": "T1234567890",
    "orderId": "1",
    "transactionId": "1"
  }
}
```

### 22. Verify Payment Status
**GET** `/payments/verify/T1234567890`
Replace `T1234567890` with the actual Paystack reference from the initialization response.

**Response:**
```json
{
  "success": true,
  "message": "Payment verification successful",
  "data": {
    "reference": "T1234567890",
    "status": "success",
    "amount": 25.50,
    "currency": "GHS",
    "paidAt": "2024-01-15T10:30:00.000Z",
    "orderId": "1",
    "transactionId": "1"
  }
}
```

### 23. Paystack Webhook (for Paystack to call)
**POST** `/payments/paystack/webhook`
**Headers:**
```
x-paystack-signature: <signature_from_paystack>
Content-Type: application/json
```

**Sample Webhook Payload (charge.success):**
```json
{
  "event": "charge.success",
  "data": {
    "id": 1234567890,
    "domain": "test",
    "status": "success",
    "reference": "T1234567890",
    "amount": 2550,
    "message": "Successful",
    "gateway_response": "Successful",
    "paid_at": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:29:45.000Z",
    "channel": "card",
    "currency": "GHS",
    "ip_address": "197.210.52.34",
    "metadata": {
      "orderId": "1",
      "userId": "1"
    },
    "log": null,
    "fees": 0,
    "fees_split": null,
    "authorization": {
      "authorization_code": "AUTH_xxxxx",
      "bin": "408408",
      "last4": "4081",
      "exp_month": "12",
      "exp_year": "2030",
      "channel": "card",
      "card_type": "visa",
      "bank": "TEST BANK",
      "country_code": "GH",
      "brand": "visa",
      "reusable": true,
      "signature": "SIG_xxxxx",
      "account_name": null
    },
    "customer": {
      "id": 123456,
      "first_name": "John",
      "last_name": "Doe",
      "email": "customer@example.com",
      "customer_code": "CUS_xxxxx",
      "phone": null,
      "metadata": null,
      "risk_action": "default",
      "international_format_phone": null
    },
    "plan": null,
    "split": {},
    "order_id": null,
    "paidAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:29:45.000Z",
    "requested_amount": 2550,
    "pos_transaction_data": null,
    "source": null
  }
}
```

**Note:** This endpoint is called by Paystack automatically. You should configure this URL in your Paystack dashboard.

---

## TESTING FLOW

### Step 1: Create Addons
1. Create a free addon (POST `/addons` with price: 0)
2. Create a paid addon (POST `/addons` with price > 0)

### Step 2: Create Food (if needed)
Use existing food endpoint or create one

### Step 3: Assign Addons to Food
1. Add paid addon to food (POST `/foods/{foodId}/addons`)
2. Add free addon to food (POST `/foods/{foodId}/addons`)

### Step 4: Verify Food Addons
1. Get food with addons (GET `/foods/{foodId}`)

### Step 5: Create Order
1. Create order with food items and selected addons (POST `/orders`)
2. Optionally create order with payment initialization (POST `/orders` with `initializePayment: true`)

### Step 6: Initialize Payment (if not done during order creation)
1. Initialize payment for an order (POST `/payments/initialize`)

### Step 7: Complete Payment
1. Use the `authorizationUrl` from the payment initialization response
2. Complete payment on Paystack checkout page
3. Paystack will send webhook to `/payments/paystack/webhook`

### Step 8: Verify Payment
1. Verify payment status (GET `/payments/verify/{reference}`)

### Step 9: Manage Orders
1. Get order details (GET `/orders/{orderId}`)
2. Update order status (PUT `/orders/{orderId}/status`)
3. Get user orders (GET `/orders/users/{userId}`)

---

## IMPORTANT NOTES

### Addon Rules:
- **Free addons:** `price = 0`, quantity always 1 when ordering
- **Paid addons:** `price > 0`, quantity can be 1 to `maxQuantity` (if set)
- **maxQuantity:** Optional. If not set, unlimited quantity allowed for paid addons

### Order Rules:
- Free addon quantity must be exactly **1**
- Paid addon quantity can be **1 to maxQuantity** (if maxQuantity is set)
- Addon prices are **snapshotted** at order creation time
- Total calculation: `(food price × quantity) + (addon price × addon quantity × food quantity) + delivery fee`

### Example Calculation:
- Food: $10, quantity: 2 = $20
- Paid Addon: $2.50, quantity: 2, food quantity: 2 = $10 (2.50 × 2 × 2)
- Free Addon: $0, quantity: 1, food quantity: 2 = $0
- Delivery Fee: $5
- **Total: $35**

---

## PAYMENT NOTES

### Payment Flow:
1. **Create Order** (with or without `initializePayment: true`)
2. **Initialize Payment** (if not done during order creation) - Returns `authorizationUrl`
3. **User completes payment** on Paystack checkout page
4. **Paystack sends webhook** to `/payments/paystack/webhook`
5. **Verify payment** using reference (optional, for manual verification)

### Currency:
- All payments are processed in **GHS** (Ghanaian Cedi)
- Amounts are automatically converted to pesewas (multiply by 100) for Paystack

### Environment Variables Required:
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `PAYSTACK_WEBHOOK_SECRET` - Webhook secret (optional, defaults to secret key)

### Webhook Configuration:
- Configure webhook URL in Paystack dashboard: `https://yourapi.com/api/v1/payments/paystack/webhook`
- Paystack will send events: `charge.success`, `charge.failed`

---

## REPLACE THESE VALUES:
- `"1"` → Replace with actual IDs from your database
- `http://localhost:3000` → Update to match your server URL
- Restaurant ID, User ID, Food ID, Addon ID, Payment Method ID → Use real IDs
- `T1234567890` → Replace with actual Paystack reference

