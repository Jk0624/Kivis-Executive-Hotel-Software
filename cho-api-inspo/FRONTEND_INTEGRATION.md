# Frontend Integration Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Restaurant & Food Management](#restaurant--food-management)
3. [Addons System (Complex Section)](#addons-system-complex-section)
4. [Order Placement Flow (Step-by-Step)](#order-placement-flow-step-by-step)
5. [Payment Integration](#payment-integration)
6. [UI/UX Best Practices](#uiux-best-practices)
7. [Code Examples](#code-examples)
8. [Common Pitfalls](#common-pitfalls)

---

## Introduction

### API Base URL
```
http://localhost:3000/api/v1
```
For production, replace with your production API URL.

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Handling
Errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Always check the `success` field before processing data.

### Authentication
Currently, the API doesn't require authentication tokens. User identification is done via `userId` in request bodies.

---

## Restaurant & Food Management

### Fetching Restaurants

**Endpoint:** `GET /restaurants`

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, INACTIVE, CLOSED, PENDING)
- `isActive` (optional): Filter by active status (true/false)
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Example Request:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/restaurants?status=ACTIVE&page=1&limit=20');
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Restaurants retrieved successfully",
  "data": {
    "restaurants": [
      {
        "id": "1",
        "name": "KFC Accra",
        "description": "Finger-licking good chicken",
        "phone": "0302123456",
        "email": "accra@kfc.com",
        "addressLine": "Oxford Street, Osu, Accra",
        "latitude": "5.5500",
        "longitude": "-0.1833",
        "rating": "4.5",
        "status": "ACTIVE",
        "isActive": true,
        "openingTime": "08:00",
        "closingTime": "22:00",
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### Fetching Foods by Restaurant

**Endpoint:** `GET /foods`

**Query Parameters:**
- `restaurantId` (required): Restaurant ID
- `categoryId` (optional): Filter by category
- `isAvailable` (optional): Filter by availability (true/false)
- `includeAddons` (optional): Include addons in response (true/false) - **Important for addon display**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example Request:**
```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/foods?restaurantId=1&includeAddons=true&isAvailable=true'
);
const data = await response.json();
```

**Response Structure (with addons):**
```json
{
  "success": true,
  "message": "Foods retrieved successfully",
  "data": {
    "foods": [
      {
        "id": "1",
        "restaurantId": "1",
        "name": "2-Piece Chicken Meal",
        "description": "2 pieces of crispy fried chicken",
        "price": "45.00",
        "imageUrl": "https://example.com/chicken.jpg",
        "isAvailable": true,
        "isPopular": false,
        "category": {
          "id": "1",
          "name": "Fast Food",
          "slug": "fast-food"
        },
        "addons": [
          {
            "id": "1",
            "isRequired": false,
            "maxQuantity": 1,
            "addon": {
              "id": "1",
              "name": "Extra Hot Sauce",
              "description": "Spicy hot sauce packet",
              "price": "0.00",
              "isActive": true
            }
          },
          {
            "id": "2",
            "isRequired": false,
            "maxQuantity": 3,
            "addon": {
              "id": "2",
              "name": "Extra Piece of Chicken",
              "description": "Add one more piece",
              "price": "15.00",
              "isActive": true
            }
          }
        ]
      }
    ]
  }
}
```

### Getting Single Food with Addons

**Endpoint:** `GET /foods/:id`

This endpoint automatically includes all available addons for the food item.

**Example Request:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/foods/1');
const data = await response.json();
```

The response structure is similar to the food object in the list, but includes full restaurant details.

---

## Addons System (Complex Section)

### Understanding the Addon Model

The addon system has three key components:

1. **Addon** - The base addon definition (belongs to a restaurant)
2. **FoodAddon** - Links an addon to a specific food item with rules
3. **OrderItemAddon** - The selected addon in an order

### Key Concepts

#### 1. Addon Types

**Free Addons:**
- `price = 0` (or "0.00" as string)
- Quantity is **always 1** when ordering
- Cannot be increased or decreased
- Example: "Extra Hot Sauce", "Extra Pepper Sauce"

**Paid Addons:**
- `price > 0`
- Quantity can be 1 to `maxQuantity` (if `maxQuantity` is set)
- If `maxQuantity` is `null`, unlimited quantity allowed
- Example: "Extra Cheese", "Extra Meat"

#### 2. FoodAddon Relationship

When an addon is linked to a food item, it includes:

- `isRequired` (boolean): Whether the addon must be selected
  - If `true`: User must select this addon (or at least quantity 1)
  - If `false`: Optional addon

- `maxQuantity` (number | null): Maximum quantity allowed
  - If `null`: No limit (for paid addons only)
  - If number: Maximum quantity user can select
  - For free addons: Always 1 (enforced by backend)

#### 3. Addon Price Structure

- Addon prices are stored as strings (e.g., "15.00")
- Always parse to number for calculations: `parseFloat(addon.price)`
- Free addons have price "0.00"

### How to Fetch Addons for a Food Item

**Method 1: Get Single Food (Recommended)**
```javascript
// Automatically includes all addons
const response = await fetch(`/api/v1/foods/${foodId}`);
const { data } = await response.json();
const addons = data.addons; // Array of FoodAddon objects
```

**Method 2: Get Food Addons Endpoint**
```javascript
// Dedicated endpoint for addons
const response = await fetch(`/api/v1/foods/${foodId}/addons?isActive=true`);
const { data } = await response.json();
const addons = data.addons; // Array of FoodAddon objects
```

**Method 3: Include in Food List**
```javascript
// When fetching food list
const response = await fetch(`/api/v1/foods?restaurantId=1&includeAddons=true`);
const { data } = await response.json();
// Each food item will have an 'addons' array if includeAddons=true
```

### Addon Data Structure

When you fetch a food with addons, each addon in the array has this structure:

```typescript
interface FoodAddonResponse {
  id: string;                    // FoodAddon ID (not addon ID)
  isRequired: boolean;            // Must user select this?
  maxQuantity: number | null;    // Max quantity (null = unlimited)
  addon: {
    id: string;                  // Actual addon ID
    name: string;                 // "Extra Cheese"
    description: string | null;   // "Add extra mozzarella"
    price: string;                // "8.00" or "0.00"
    isActive: boolean;            // Is addon currently available?
  };
}
```

### UI/UX Considerations for Displaying Addons

#### 1. Grouping Addons

**Recommended Approach:**
- Group addons by type (Free vs Paid)
- Show required addons first
- Use visual distinction (badges, colors)

```javascript
// Example grouping logic
const freeAddons = food.addons.filter(fa => parseFloat(fa.addon.price) === 0);
const paidAddons = food.addons.filter(fa => parseFloat(fa.addon.price) > 0);
const requiredAddons = food.addons.filter(fa => fa.isRequired);
const optionalAddons = food.addons.filter(fa => !fa.isRequired);
```

#### 2. Display Format

**For Free Addons:**
- Show as checkbox (single selection)
- Display "FREE" badge
- Quantity always 1 (don't show quantity selector)

**For Paid Addons:**
- Show with quantity selector (+, - buttons or input)
- Display price per unit
- Show total price for that addon
- Enforce `maxQuantity` limit

#### 3. Required Addons

- Highlight required addons visually
- Show warning if user tries to proceed without selecting
- Pre-select required addons with quantity 1

#### 4. Quantity Validation

**Frontend Validation Rules:**
```javascript
function validateAddonQuantity(foodAddon, quantity) {
  const addonPrice = parseFloat(foodAddon.addon.price);
  
  // Free addon: quantity must be exactly 1
  if (addonPrice === 0) {
    return quantity === 1;
  }
  
  // Paid addon: quantity must be at least 1
  if (quantity < 1) {
    return false;
  }
  
  // Check maxQuantity limit
  if (foodAddon.maxQuantity !== null && quantity > foodAddon.maxQuantity) {
    return false;
  }
  
  return true;
}
```

#### 5. Visual Design Suggestions

```
┌─────────────────────────────────────┐
│ 2-Piece Chicken Meal        GHS 45  │
├─────────────────────────────────────┤
│ Addons:                              │
│                                     │
│ ☑ Extra Hot Sauce          FREE    │
│   (Required)                        │
│                                     │
│ ☐ Extra Piece of Chicken   GHS 15  │
│   [ - ] 1 [ + ]  (Max: 3)          │
│                                     │
│ ☑ Extra Cheese             GHS 8   │
│   [ - ] 2 [ + ]  (Max: 2)          │
└─────────────────────────────────────┘
```

---

## Order Placement Flow (Step-by-Step)

### Step 1: Browse Restaurants

Display a list of active restaurants to the user.

```javascript
async function fetchRestaurants() {
  const response = await fetch('/api/v1/restaurants?status=ACTIVE&isActive=true');
  const { data } = await response.json();
  return data.restaurants;
}
```

**UI Considerations:**
- Show restaurant name, image, rating
- Display opening/closing times
- Show status (open/closed based on current time)

### Step 2: Select Restaurant

When user taps/clicks a restaurant, navigate to the restaurant's menu page.

**Store the selected restaurant:**
```javascript
const selectedRestaurant = {
  id: "1",
  name: "KFC Accra",
  // ... other restaurant data
};
```

### Step 3: Browse Foods

Fetch foods for the selected restaurant.

```javascript
async function fetchRestaurantFoods(restaurantId) {
  const response = await fetch(
    `/api/v1/foods?restaurantId=${restaurantId}&includeAddons=true&isAvailable=true`
  );
  const { data } = await response.json();
  return data.foods;
}
```

**UI Considerations:**
- Group foods by category
- Show food image, name, description, price
- Display availability status
- Show "Popular" badge if `isPopular: true`

### Step 4: Add Food to Cart

When user taps "Add to Cart" on a food item:

1. **If the food has addons:** Open addon selection modal/sheet
2. **If no addons:** Add directly to cart

**Cart Item Structure:**
```typescript
interface CartItem {
  foodId: string;
  foodName: string;
  foodPrice: number;        // Base price
  quantity: number;         // Food quantity
  selectedAddons: {         // Selected addons for this food item
    addonId: string;
    addonName: string;
    addonPrice: number;
    quantity: number;       // Addon quantity (1 for free, 1-maxQuantity for paid)
  }[];
  subtotal: number;         // (foodPrice * quantity) + sum of (addonPrice * addonQuantity * foodQuantity)
}
```

### Step 5: Configure Addons (Detailed)

This is the most complex step. Here's a detailed flow:

#### 5.1: Open Addon Selection Modal

When user wants to add a food with addons:

```javascript
function openAddonModal(food) {
  // food.addons contains all available addons for this food
  const modal = {
    food: food,
    addons: food.addons,
    selectedAddons: new Map(), // Track selected addons
  };
  
  // Pre-select required addons
  food.addons.forEach(foodAddon => {
    if (foodAddon.isRequired) {
      const quantity = parseFloat(foodAddon.addon.price) === 0 ? 1 : 1;
      modal.selectedAddons.set(foodAddon.addon.id, {
        addonId: foodAddon.addon.id,
        addonName: foodAddon.addon.name,
        addonPrice: parseFloat(foodAddon.addon.price),
        quantity: quantity,
        maxQuantity: foodAddon.maxQuantity,
        isRequired: foodAddon.isRequired,
      });
    }
  });
  
  showModal(modal);
}
```

#### 5.2: Display Addons in Modal

```javascript
function renderAddons(foodAddons) {
  return foodAddons.map(foodAddon => {
    const isFree = parseFloat(foodAddon.addon.price) === 0;
    const isSelected = selectedAddons.has(foodAddon.addon.id);
    const selectedQty = selectedAddons.get(foodAddon.addon.id)?.quantity || 0;
    
    return (
      <AddonItem
        key={foodAddon.id}
        name={foodAddon.addon.name}
        description={foodAddon.addon.description}
        price={foodAddon.addon.price}
        isFree={isFree}
        isRequired={foodAddon.isRequired}
        maxQuantity={foodAddon.maxQuantity}
        isSelected={isSelected}
        quantity={selectedQty}
        onToggle={() => handleAddonToggle(foodAddon)}
        onQuantityChange={(newQty) => handleQuantityChange(foodAddon, newQty)}
      />
    );
  });
}
```

#### 5.3: Handle Addon Selection

```javascript
function handleAddonToggle(foodAddon) {
  const addonId = foodAddon.addon.id;
  const isFree = parseFloat(foodAddon.addon.price) === 0;
  
  if (selectedAddons.has(addonId)) {
    // Deselect (only if not required)
    if (!foodAddon.isRequired) {
      selectedAddons.delete(addonId);
    }
  } else {
    // Select addon
    const quantity = isFree ? 1 : 1; // Start with quantity 1
    selectedAddons.set(addonId, {
      addonId: addonId,
      addonName: foodAddon.addon.name,
      addonPrice: parseFloat(foodAddon.addon.price),
      quantity: quantity,
      maxQuantity: foodAddon.maxQuantity,
      isRequired: foodAddon.isRequired,
    });
  }
  
  updateModal();
}
```

#### 5.4: Handle Quantity Changes

```javascript
function handleQuantityChange(foodAddon, newQuantity) {
  const addonId = foodAddon.addon.id;
  const isFree = parseFloat(foodAddon.addon.price) === 0;
  
  // Free addons: quantity must be 1
  if (isFree) {
    if (newQuantity !== 1) {
      showError("Free addons can only have quantity of 1");
      return;
    }
  }
  
  // Paid addons: validate quantity
  if (!isFree) {
    if (newQuantity < 1) {
      showError("Quantity must be at least 1");
      return;
    }
    
    if (foodAddon.maxQuantity !== null && newQuantity > foodAddon.maxQuantity) {
      showError(`Maximum quantity is ${foodAddon.maxQuantity}`);
      return;
    }
  }
  
  // Update quantity
  const selected = selectedAddons.get(addonId);
  if (selected) {
    selected.quantity = newQuantity;
    selectedAddons.set(addonId, selected);
  }
  
  updateModal();
}
```

#### 5.5: Calculate Item Subtotal

```javascript
function calculateItemSubtotal(foodPrice, foodQuantity, selectedAddons) {
  // Base food cost
  let subtotal = parseFloat(foodPrice) * foodQuantity;
  
  // Add addon costs
  selectedAddons.forEach(addon => {
    // Addon cost = addonPrice * addonQuantity * foodQuantity
    // (Each addon applies to each food item)
    const addonCost = addon.addonPrice * addon.quantity * foodQuantity;
    subtotal += addonCost;
  });
  
  return subtotal;
}
```

#### 5.6: Close Modal and Add to Cart

```javascript
function confirmAddonSelection(food, foodQuantity) {
  // Validate required addons
  const requiredAddons = food.addons.filter(fa => fa.isRequired);
  const missingRequired = requiredAddons.filter(
    fa => !selectedAddons.has(fa.addon.id)
  );
  
  if (missingRequired.length > 0) {
    showError("Please select all required addons");
    return;
  }
  
  // Build cart item
  const cartItem = {
    foodId: food.id,
    foodName: food.name,
    foodPrice: parseFloat(food.price),
    quantity: foodQuantity,
    selectedAddons: Array.from(selectedAddons.values()),
    subtotal: calculateItemSubtotal(
      food.price,
      foodQuantity,
      Array.from(selectedAddons.values())
    ),
  };
  
  // Add to cart
  addToCart(cartItem);
  
  // Close modal
  closeModal();
}
```

### Step 6: Review Cart

Display cart items with breakdown:

```javascript
function renderCart() {
  const cartItems = getCartItems();
  let total = 0;
  
  cartItems.forEach(item => {
    total += item.subtotal;
  });
  
  // Add delivery fee (if applicable)
  const deliveryFee = calculateDeliveryFee(); // Your delivery fee logic
  const grandTotal = total + deliveryFee;
  
  return {
    items: cartItems,
    subtotal: total,
    deliveryFee: deliveryFee,
    total: grandTotal,
  };
}
```

**Display Format:**
```
Cart Summary:
─────────────────────────
2-Piece Chicken Meal × 1
  + Extra Hot Sauce (Free)
  + Extra Chicken × 1
  Subtotal: GHS 60.00

Zinger Burger × 2
  + Extra Hot Sauce (Free)
  Subtotal: GHS 70.00
─────────────────────────
Subtotal: GHS 130.00
Delivery Fee: GHS 5.00
─────────────────────────
Total: GHS 135.00
```

### Step 7: Enter Delivery Address

Collect delivery address from user:

```javascript
const deliveryAddress = {
  addressLine: "123 Main Street, Accra",
  // You might also collect coordinates if needed
};
```

### Step 8: Create Order

Build the order payload and send to API:

```javascript
async function createOrder(userId, restaurantId, deliveryAddress, deliveryFee) {
  const cartItems = getCartItems();
  
  // Build order items array
  const items = cartItems.map(item => ({
    foodId: item.foodId,
    quantity: item.quantity,
    addons: item.selectedAddons.map(addon => ({
      addonId: addon.addonId,
      quantity: addon.quantity,
    })),
  }));
  
  const orderPayload = {
    userId: userId,
    restaurantId: restaurantId,
    deliveryAddress: deliveryAddress.addressLine,
    deliveryFee: deliveryFee,
    items: items,
    initializePayment: false, // We'll initialize payment separately
  };
  
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });
  
  const { data } = await response.json();
  return data; // Returns order with id
}
```

**Important:** The backend validates:
- All addons belong to the food item
- Free addon quantities are exactly 1
- Paid addon quantities don't exceed maxQuantity
- All required addons are included

### Step 9: Initialize Payment

After order creation, initialize payment:

```javascript
async function initializePayment(orderId, callbackUrl) {
  const response = await fetch('/api/v1/payments/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId: orderId,
      callbackUrl: callbackUrl, // Your app's callback URL
    }),
  });
  
  const { data } = await response.json();
  return data; // Contains authorizationUrl, reference, etc.
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

### Step 10: Complete Payment

Redirect user to Paystack checkout:

```javascript
function redirectToPayment(authorizationUrl) {
  // Option 1: Open in new window/tab
  window.open(authorizationUrl, '_blank');
  
  // Option 2: Redirect in same window
  // window.location.href = authorizationUrl;
  
  // Option 3: Use in-app browser (for mobile apps)
  // Use WebView or similar
}
```

**Payment Flow:**
1. User completes payment on Paystack page
2. Paystack redirects to your `callbackUrl`
3. Your app should verify payment status

### Step 11: Order Confirmation

After payment, verify and show confirmation:

```javascript
async function verifyPayment(reference) {
  const response = await fetch(`/api/v1/payments/verify/${reference}`);
  const { data } = await response.json();
  
  if (data.status === 'success') {
    // Payment successful
    showOrderConfirmation(data.orderId);
  } else {
    // Payment failed
    showPaymentError();
  }
}
```

**Display Order Confirmation:**
- Order ID
- Order status
- Payment status
- Estimated delivery time
- Order items breakdown

---

## Payment Integration

### Paystack Integration Flow

```
User → Create Order → Initialize Payment → Paystack Checkout → Webhook → Verify Payment
```

### Payment Initialization

**Endpoint:** `POST /payments/initialize`

**Request:**
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
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxxxx",
    "accessCode": "xxxxx",
    "reference": "T1234567890",
    "orderId": "1",
    "transactionId": "1"
  }
}
```

### Payment Verification

**Endpoint:** `GET /payments/verify/:reference`

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "T1234567890",
    "status": "success",
    "amount": 135.00,
    "currency": "GHS",
    "paidAt": "2024-01-15T10:30:00.000Z",
    "orderId": "1",
    "transactionId": "1"
  }
}
```

### Currency

All payments are processed in **GHS** (Ghanaian Cedi). Amounts are automatically converted to pesewas (multiply by 100) by the backend.

### Webhook Handling (Frontend Perspective)

The backend handles webhooks automatically. However, you should:

1. Poll for payment status if needed
2. Listen for order status updates
3. Refresh order details after payment

---

## UI/UX Best Practices

### Addon Selection Interface Design

#### 1. Modal/Sheet Layout

```
┌─────────────────────────────────┐
│ 2-Piece Chicken Meal      GHS 45│
│ Quantity: [ - ] 1 [ + ]         │
├─────────────────────────────────┤
│ Addons                           │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ ☑ Extra Hot Sauce    FREE  │ │
│ │   (Required)                │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ ☑ Extra Chicken    GHS 15   │ │
│ │   [ - ] 1 [ + ]  (Max: 3)   │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ ☐ Extra Cheese      GHS 8   │ │
│ │   [ - ] 0 [ + ]  (Max: 2)   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Subtotal: GHS 60.00             │
│                                  │
│ [Cancel]        [Add to Cart]   │
└─────────────────────────────────┘
```

#### 2. Visual Indicators

- **Required Addons:** Show "Required" badge, pre-select
- **Free Addons:** Show "FREE" badge, disable quantity controls
- **Max Quantity:** Show "(Max: X)" text, disable + button when reached
- **Selected State:** Highlight selected addons

#### 3. Quantity Controls

- Use +/- buttons for paid addons
- Show current quantity prominently
- Disable - when quantity is 1
- Disable + when quantity reaches maxQuantity

### Cart Calculation Display

Always show:
- Item subtotal (food + addons for that item)
- Cart subtotal (sum of all items)
- Delivery fee
- Grand total

Update totals in real-time as user modifies cart.

### Order Status Tracking

Display order status clearly:
- **PENDING:** Order created, awaiting payment
- **CONFIRMED:** Payment received, order confirmed
- **PREPARING:** Restaurant is preparing
- **READY:** Order ready for pickup/delivery
- **DELIVERED:** Order completed
- **CANCELLED:** Order cancelled

### Error Handling and User Feedback

**Common Errors:**
1. **Addon validation errors:** Show specific message
2. **Payment failures:** Allow retry
3. **Network errors:** Show retry option
4. **Out of stock:** Update UI immediately

**Best Practices:**
- Show loading states during API calls
- Display success/error messages clearly
- Allow users to retry failed operations
- Validate on frontend before API call (but don't rely on it)

---

## Code Examples

### Fetching Food with Addons

```javascript
async function getFoodWithAddons(foodId) {
  try {
    const response = await fetch(`/api/v1/foods/${foodId}`);
    const { success, data, message } = await response.json();
    
    if (!success) {
      throw new Error(message);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching food:', error);
    throw error;
  }
}

// Usage
const food = await getFoodWithAddons('1');
console.log('Food:', food.name);
console.log('Available addons:', food.addons);
```

### Building Order Payload

```javascript
function buildOrderPayload(cartItems, userId, restaurantId, deliveryAddress, deliveryFee) {
  const items = cartItems.map(item => {
    const orderItem = {
      foodId: item.foodId,
      quantity: item.quantity,
    };
    
    // Add addons if any
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      orderItem.addons = item.selectedAddons.map(addon => ({
        addonId: addon.addonId,
        quantity: addon.quantity,
      }));
    }
    
    return orderItem;
  });
  
  return {
    userId: userId,
    restaurantId: restaurantId,
    deliveryAddress: deliveryAddress,
    deliveryFee: deliveryFee,
    items: items,
  };
}
```

### Calculating Totals

```javascript
function calculateCartTotal(cartItems, deliveryFee = 0) {
  let subtotal = 0;
  
  cartItems.forEach(item => {
    // Food base cost
    const foodCost = item.foodPrice * item.quantity;
    
    // Addon costs (applies to each food item)
    let addonCost = 0;
    item.selectedAddons.forEach(addon => {
      addonCost += addon.addonPrice * addon.quantity * item.quantity;
    });
    
    subtotal += foodCost + addonCost;
  });
  
  return {
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: subtotal + deliveryFee,
  };
}
```

### Handling Addon Validation

```javascript
function validateAddonSelection(food, selectedAddons) {
  const errors = [];
  
  // Check required addons
  const requiredAddons = food.addons.filter(fa => fa.isRequired);
  requiredAddons.forEach(foodAddon => {
    const addonId = foodAddon.addon.id;
    if (!selectedAddons.has(addonId)) {
      errors.push(`${foodAddon.addon.name} is required`);
    }
  });
  
  // Validate quantities
  selectedAddons.forEach((addon, addonId) => {
    const foodAddon = food.addons.find(fa => fa.addon.id === addonId);
    if (!foodAddon) return;
    
    const isFree = parseFloat(foodAddon.addon.price) === 0;
    
    // Free addon validation
    if (isFree && addon.quantity !== 1) {
      errors.push(`${addon.addonName} must have quantity of 1`);
    }
    
    // Paid addon validation
    if (!isFree) {
      if (addon.quantity < 1) {
        errors.push(`${addon.addonName} quantity must be at least 1`);
      }
      
      if (foodAddon.maxQuantity !== null && addon.quantity > foodAddon.maxQuantity) {
        errors.push(`${addon.addonName} cannot exceed quantity of ${foodAddon.maxQuantity}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}
```

### Complete Order Flow Example

```javascript
async function completeOrderFlow() {
  try {
    // 1. Get cart items
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 2. Validate all items
    for (const item of cartItems) {
      const food = await getFoodWithAddons(item.foodId);
      const selectedAddonsMap = new Map(
        item.selectedAddons.map(a => [a.addonId, a])
      );
      
      const validation = validateAddonSelection(food, selectedAddonsMap);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    }
    
    // 3. Get delivery details
    const deliveryAddress = getDeliveryAddress();
    const deliveryFee = calculateDeliveryFee();
    
    // 4. Create order
    const orderPayload = buildOrderPayload(
      cartItems,
      getUserId(),
      getSelectedRestaurantId(),
      deliveryAddress,
      deliveryFee
    );
    
    const orderResponse = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    
    const orderData = await orderResponse.json();
    if (!orderData.success) {
      throw new Error(orderData.message);
    }
    
    const orderId = orderData.data.id;
    
    // 5. Initialize payment
    const paymentResponse = await fetch('/api/v1/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        callbackUrl: `${window.location.origin}/payment/callback`,
      }),
    });
    
    const paymentData = await paymentResponse.json();
    if (!paymentData.success) {
      throw new Error(paymentData.message);
    }
    
    // 6. Redirect to payment
    window.location.href = paymentData.data.authorizationUrl;
    
  } catch (error) {
    console.error('Order error:', error);
    showError(error.message);
  }
}
```

---

## Common Pitfalls

### 1. Addon Quantity Validation

**❌ Wrong:**
```javascript
// Allowing quantity > 1 for free addons
if (addon.price === 0) {
  quantitySelector.max = 10; // WRONG!
}
```

**✅ Correct:**
```javascript
// Free addons always quantity = 1
if (parseFloat(addon.price) === 0) {
  quantitySelector.disabled = true;
  quantitySelector.value = 1;
}
```

### 2. Free vs Paid Addon Handling

**❌ Wrong:**
```javascript
// Treating all addons the same
addons.forEach(addon => {
  showQuantitySelector(addon); // WRONG for free addons!
});
```

**✅ Correct:**
```javascript
// Different UI for free vs paid
addons.forEach(foodAddon => {
  const isFree = parseFloat(foodAddon.addon.price) === 0;
  
  if (isFree) {
    showCheckbox(foodAddon); // Single selection
  } else {
    showQuantitySelector(foodAddon); // Quantity control
  }
});
```

### 3. Total Calculation Errors

**❌ Wrong:**
```javascript
// Not multiplying addon cost by food quantity
const addonCost = addon.price * addon.quantity; // WRONG!
```

**✅ Correct:**
```javascript
// Addon applies to each food item
const addonCost = addon.price * addon.quantity * foodQuantity;
```

### 4. Payment Flow Mistakes

**❌ Wrong:**
```javascript
// Creating order and payment in one call without error handling
const order = await createOrder(...);
window.location.href = order.payment.authorizationUrl; // May not exist!
```

**✅ Correct:**
```javascript
// Separate order creation and payment initialization
const order = await createOrder(...);
const payment = await initializePayment(order.id);
window.location.href = payment.authorizationUrl;
```

### 5. Not Handling Required Addons

**❌ Wrong:**
```javascript
// Allowing order without required addons
if (selectedAddons.length === 0) {
  // Still allow proceeding - WRONG!
}
```

**✅ Correct:**
```javascript
// Validate required addons
const requiredAddons = food.addons.filter(fa => fa.isRequired);
const missingRequired = requiredAddons.filter(
  fa => !selectedAddons.has(fa.addon.id)
);

if (missingRequired.length > 0) {
  showError('Please select all required addons');
  return;
}
```

### 6. Not Respecting maxQuantity

**❌ Wrong:**
```javascript
// Allowing unlimited quantity
quantitySelector.max = 999; // WRONG!
```

**✅ Correct:**
```javascript
// Respect maxQuantity limit
const maxQty = foodAddon.maxQuantity || 999; // null means unlimited
quantitySelector.max = maxQty;
```

---

## Summary

### Key Takeaways

1. **Addons are complex:** Always fetch addons with `includeAddons=true` or use the single food endpoint
2. **Free addons = quantity 1:** Never allow quantity changes for free addons
3. **Paid addons have limits:** Respect `maxQuantity` constraints
4. **Required addons:** Must be selected before proceeding
5. **Total calculation:** Addon cost = `addonPrice × addonQuantity × foodQuantity`
6. **Payment flow:** Create order first, then initialize payment separately
7. **Validation:** Validate on frontend for UX, but backend is source of truth

### Quick Reference

| Concept | Rule |
|---------|------|
| Free Addon Quantity | Always 1 |
| Paid Addon Quantity | 1 to maxQuantity (or unlimited if null) |
| Required Addons | Must be selected |
| Addon Cost Calculation | `price × quantity × foodQuantity` |
| Currency | GHS (Ghanaian Cedi) |
| Payment Flow | Order → Initialize Payment → Paystack → Verify |

---

## Support

For API issues or questions, refer to:
- `POSTMAN_TEST_EXAMPLES.md` - API endpoint examples
- Backend team for schema changes
- Paystack documentation for payment integration

---

**Last Updated:** 2024-01-15

