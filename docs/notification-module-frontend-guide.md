# Notification Module — Frontend Integration Guide

এই module-টি সিস্টেমে রিয়েল-টাইম নোটিফিকেশন ডেলিভারি এবং ম্যানেজমেন্টের জন্য ব্যবহার করা হয়। এটি **REST API** এবং **WebSocket (Socket.IO)** উভয়ের সমন্বয়ে কাজ করে।

---

## Base URL

```text
REST:      https://api.example.com/api/v1/notifications
WebSocket: wss://api.example.com/notifications
```

সব REST request এবং WebSocket connection এ Authentication এর জন্য JWT টোকেন প্রয়োজন হবে:
```text
Authorization: Bearer <jwt_token>
```

---

## WebSocket (Socket.IO)

রিয়েল-টাইম নোটিফিকেশন পাওয়ার জন্য অ্যাপ লোড হওয়ার সাথে সাথে WebSocket এ কানেক্ট করতে হবে।

### Connection

Namespace: `/notifications`

```javascript
import { io } from "socket.io-client";

const socket = io("wss://api.example.com/notifications", {
  auth: { token: "<jwt_token>" }
  // অথবা headers: { authorization: `Bearer <jwt_token>` }
});
```

Token invalid বা expired হলে server `error` event emit করে connection disconnect করে দেবে।

---

### Events — Server থেকে Client এ (Listen)

| Event | কখন আসে | Payload |
|-------|---------|---------|
| `notification` | যখনই কোনো নতুন নোটিফিকেশন ট্রিগার হয় | `Notification` object |
| `error` | Auth fail বা invalid request | `{ message: "Unauthorized" }` |

**`notification` payload example:**
```json
{
  "id": "uuid",
  "title": "Payment Successful",
  "message": "John Doe has successfully made a payment of $150.00.",
  "actionType": "PAYMENT_SUCCESS",
  "referenceId": "TXN-CLVR-...",
  "isRead": false,
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

> ℹ️ Client side এ `socket.on("notification", (data) => { ... })` লিসেন করে UI তে Toast বা Notification Badge আপডেট করতে হবে।

---

## REST API Endpoints

### 1. আমার সব নোটিফিকেশন দেখা

**GET** `/notifications`

লগিন করা ইউজারের সব নোটিফিকেশন এবং unread কাউন্ট পাওয়ার জন্য।

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications retrieved",
  "data": {
    "unreadCount": 3,
    "notifications": [
      {
        "id": "uuid",
        "title": "Assessment Status Updated",
        "message": "Dr. Smith has updated your assessment status to ACCEPTED.",
        "actionType": "ASSESSMENT_STATUS_UPDATED",
        "referenceId": "uuid",
        "isRead": false,
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. কোনো নির্দিষ্ট নোটিফিকেশন Read মার্ক করা

**PATCH** `/notifications/:id/read`

ইউজার যখন কোনো নোটিফিকেশনে ক্লিক করবে তখন এই API কল করে সেটাকে `isRead: true` করতে হবে।

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read"
}
```

---

### 3. সব নোটিফিকেশন একসাথে Read মার্ক করা

**PATCH** `/notifications/read-all`

"Mark all as read" বাটনে ক্লিক করলে এই API কল করতে হবে।

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "All notifications marked as read"
}
```

---

## Action Types

নোটিফিকেশনে ক্লিক করলে ইউজারকে কোন পেইজে নিয়ে যেতে হবে, তা `actionType` এবং `referenceId` দেখে ফ্রন্টএন্ডে হ্যান্ডেল করতে হবে:

| `actionType` | মানে | `referenceId` কী নির্দেশ করে |
|--------------|------|------------------------------|
| `PAYMENT_SUCCESS` | পেমেন্ট সাকসেসফুল | `transactionId` |
| `ASSESSMENT_SUBMITTED` | নতুন অ্যাসেসমেন্ট জমা পড়েছে | `submissionId` |
| `ASSESSMENT_ASSIGNED` | অ্যাডমিন কোনো অ্যাসেসমেন্ট ডক্টরকে অ্যাসাইন করেছে | `submissionId` |
| `ASSESSMENT_STATUS_UPDATED` | ডক্টর অ্যাসেসমেন্ট স্ট্যাটাস পরিবর্তন করেছে | `submissionId` |
| `PROPOSAL_ACCEPTED` | পেশেন্ট প্রপোজাল গ্রহণ করেছে | `proposalId` |
| `PROPOSAL_REJECTED` | পেশেন্ট প্রপোজাল বাতিল করেছে | `proposalId` |
| `ORDER_STATUS_UPDATED` | অর্ডারের স্ট্যাটাস পরিবর্তন হয়েছে | `orderId` |
| `SUBSCRIPTION_CANCELLED` | সাবস্ক্রিপশন ক্যানসেল করা হয়েছে | `subscriptionId` |

---

## Complete Flow Summary

```text
1. User login → JWT পাওয়া গেল
2. REST API (GET /notifications) কল করে আগের সব নোটিফিকেশন এবং unread count লোড করে UI তে দেখাও।
3. WebSocket এ `/notifications` namespace এ connect করো JWT দিয়ে।
4. `notification` event listen করো। নতুন নোটিফিকেশন এলে UI তে popup/toast দেখাও এবং unread count +1 করো।
5. ইউজার নোটিফিকেশন লিস্ট খুললে অথবা ক্লিক করলে PATCH `/notifications/:id/read` কল করে unread count -1 করো।
```
