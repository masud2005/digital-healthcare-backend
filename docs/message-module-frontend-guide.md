# Message Module — Frontend Integration Guide

এই module এ **End-to-End Encryption (E2EE)** আছে। Server কখনো plaintext দেখে না। সব encryption/decryption client-side এ হয়।

---

## ভূমিকা — কীভাবে কাজ করে

প্রতিটি message **Hybrid Encryption** দিয়ে পাঠানো হয়:

1. Client একটা random **AES-256-GCM key** generate করে
2. সেই key দিয়ে plaintext encrypt করে → **ciphertext**
3. **Recipient এর RSA public key** দিয়ে AES key encrypt করে → `encryptedKey`
4. **Sender নিজের RSA public key** দিয়ে একই plaintext encrypt করে → `senderCopy`
5. সব কিছু server এ পাঠায় — server শুধু ciphertext store করে

**Decrypt করতে:**
- Recipient: নিজের private key দিয়ে `encryptedKey` decrypt → AES key বের করে → `recipientCopy` decrypt করে
- Sender (নিজের sent message পড়তে): নিজের private key দিয়ে `senderCopy` decrypt করে

> ⚠️ Private key কখনো server এ পাঠানো যাবে না। শুধু browser/device এ রাখতে হবে।

---

## Base URL

```
REST:      https://api.example.com
WebSocket: wss://api.example.com/chat
```

সব REST request এ header লাগবে:
```
Authorization: Bearer <jwt_token>
```

---

## Step 1 — RSA Key Pair Generate করা

App load হলে প্রথমেই check করতে হবে user এর কাছে key pair আছে কিনা (localStorage বা IndexedDB তে)। না থাকলে generate করে server এ public key register করতে হবে।

```js
const keyPair = await window.crypto.subtle.generateKey(
  { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true, // extractable
  ["encrypt", "decrypt"]
);

// Public key export করো PEM format এ (server এ পাঠানোর জন্য)
const spki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
const b64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;

// Private key localStorage বা IndexedDB তে রাখো — কখনো server এ পাঠাবে না
```

---

## REST API Endpoints

### 1. Public Key Register করা

**POST** `/message/keys/register`

প্রথমবার login এর পরে এই call দিতে হবে। Key আগে থেকে থাকলে update হয়ে যাবে।

Request body:
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----"
}
```

Response:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Public key registered",
  "data": { "userId": "uuid" }
}
```

---

### 2. অন্য User এর Public Key নেওয়া

**GET** `/message/keys/:userId`

Message পাঠানোর আগে recipient এর public key লাগবে।

Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Public key retrieved",
  "data": {
    "userId": "uuid",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```

---

### 3. Conversation তৈরি করা

**POST** `/message/conversation`

> ⚠️ Conversation তৈরি করার আগে **patient এবং provider দুজনেরই** public key registered থাকতে হবে, নাহলে `400` error আসবে।

Request body:
```json
{
  "serviceID": "uuid",
  "patientId": "uuid",
  "providerId": "uuid"
}
```

Response:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Conversation created",
  "data": {
    "id": "uuid",
    "serviceID": "uuid",
    "patientId": "uuid",
    "providerId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "patient": { "id": "uuid", "name": "John Doe" },
    "provider": { "id": "uuid", "name": "Dr. Smith", "title": "MD" }
  }
}
```

---

### 4. আমার সব Conversation

**GET** `/message/conversations?search=<query>`

Query params:
| Param | Required | Description |
|-------|----------|-------------|
| `search` | না | Patient name, doctor name, বা category name দিয়ে search |

Response এ প্রতিটা conversation এ থাকবে:
- `patient` ও `provider` এর `name` এবং `avatar` (signed URL)
- `service` — কোন category তে conversation (`id`, `name`)
- `submission` — patient এর সেই service এ latest assessment submission (`null` হতে পারে)
- `isPatientOnline` / `isProviderOnline` — realtime online status (initial value, realtime update এর জন্য WebSocket event দেখো)
- `messages` — last message এর metadata (preview এর জন্য)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Conversations retrieved",
  "data": [
    {
      "id": "uuid",
      "serviceID": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "createdAt": "...",
      "patient": {
        "id": "uuid",
        "name": "John Doe",
        "avatar": "https://signed-s3-url..." 
      },
      "provider": {
        "id": "uuid",
        "name": "Dr. Smith",
        "title": "MD",
        "avatar": "https://signed-s3-url..."
      },
      "service": {
        "id": "uuid",
        "name": "Weight Loss"
      },
      "submission": {
        "id": "uuid",
        "submissionCode": "SUB-2025-00123",
        "status": "ACCEPTED",
        "assessment": {
          "id": "uuid",
          "title": "Weight Loss Intake Form"
        }
      },
      "isPatientOnline": true,
      "isProviderOnline": false,
      "messages": [
        { "id": "uuid", "createdAt": "...", "messageType": "TEXT", "senderId": "uuid" }
      ]
    }
  ]
}
```

> ℹ️ `avatar` null হতে পারে যদি user profile picture set না করে থাকে।
> ℹ️ `submission` null হতে পারে যদি patient এখনো assessment submit না করে থাকে।
> ℹ️ `isPatientOnline` / `isProviderOnline` REST response এ initial value দেয়। Realtime update এর জন্য `user_online` / `user_offline` WebSocket event listen করো।

---

### 5. Message History (Paginated)

**GET** `/message/conversations/:conversationId/messages?cursor=<lastMessageId>`

- প্রথমবার `cursor` ছাড়া call করো → প্রথম 50টা message পাবে
- পরবর্তী page এর জন্য শেষ message এর `id` cursor হিসেবে দাও
- Response এ `conversation` object এবং `messages` array দুটোই আসে
- `conversation` এ patient/provider avatar, service, submission, isOnline সব থাকবে
- প্রতিটা message decrypt করতে হবে client-side এ

Query params:
| Param | Required | Description |
|-------|----------|-------------|
| `cursor` | না | শেষ message এর ID, pagination এর জন্য |

Response structure:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages retrieved",
  "data": {
    "conversation": {
      "id": "uuid",
      "patient": { "id": "uuid", "name": "John Doe", "avatar": "https://signed-s3-url..." },
      "provider": { "id": "uuid", "name": "Dr. Smith", "title": "MD", "avatar": "https://signed-s3-url..." },
      "service": { "id": "uuid", "name": "Weight Loss" },
      "submission": {
        "id": "uuid",
        "submissionCode": "SUB-2025-00123",
        "status": "ACCEPTED",
        "assessment": { "id": "uuid", "title": "Weight Loss Intake Form" }
      },
      "isPatientOnline": true,
      "isProviderOnline": false
    },
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "senderId": "uuid",
        "senderCopy": "base64-encrypted...",
        "recipientCopy": "base64-encrypted...",
        "iv": "hex-string",
        "encryptedKey": "base64-encrypted...",
        "messageType": "TEXT",
        "createdAt": "...",
        "sender": { "id": "uuid", "name": "John Doe" },
        "proposals": [],
        "attachments": []
      }
    ]
  }
}
```

**Decrypt করার logic:**
```js
// current user যদি recipient হয়
const aesKeyRaw = await window.crypto.subtle.decrypt(
  { name: "RSA-OAEP" },
  myPrivateKey,
  base64ToArrayBuffer(message.encryptedKey)
);
const aesKey = await window.crypto.subtle.importKey("raw", aesKeyRaw, { name: "AES-GCM" }, false, ["decrypt"]);
const plaintext = await window.crypto.subtle.decrypt(
  { name: "AES-GCM", iv: hexToArrayBuffer(message.iv) },
  aesKey,
  base64ToArrayBuffer(message.recipientCopy)
);

// current user যদি sender হয় → senderCopy use করো
const plaintext = await window.crypto.subtle.decrypt(
  { name: "RSA-OAEP" },
  myPrivateKey,
  base64ToArrayBuffer(message.senderCopy)
);
```

---

## WebSocket (Socket.IO)

### Connection

Namespace: `/chat`

```js
import { io } from "socket.io-client";

const socket = io("wss://api.example.com/chat", {
  auth: { token: "<jwt_token>" }
});
```

Token invalid বা expired হলে server `error` event emit করে disconnect করে দেবে।

---

### Events — Client থেকে Server এ (Emit)

#### `join_conversation`
Conversation room এ join করতে হবে message পাঠানো বা receive করার আগে।

```js
socket.emit("join_conversation", { conversationId: "uuid" });
```

Callback/response:
```json
{ "conversationId": "uuid" }
```
Event: `joined_conversation`

---

#### `leave_conversation`

```js
socket.emit("leave_conversation", { conversationId: "uuid" });
```

Event: `left_conversation`

---

#### `send_message`
Message পাঠানোর আগে client-side encrypt করতে হবে।

```js
// Encrypt করার example
async function encryptMessage(plaintext, recipientPublicKey, senderPublicKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // AES key generate
  const aesKey = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Plaintext encrypt
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, data);

  // AES key export → recipient RSA দিয়ে encrypt
  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientPublicKey, rawAesKey);

  // Sender copy: same ciphertext encrypt with sender's own public key
  const senderCopy = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, senderPublicKey, rawAesKey);

  return {
    recipientCopy: arrayBufferToBase64(ciphertext),
    senderCopy: arrayBufferToBase64(senderCopy),
    iv: arrayBufferToHex(iv),
    encryptedKey: arrayBufferToBase64(encryptedKey),
  };
}

// Emit করো
socket.emit("send_message", {
  conversationId: "uuid",
  recipientCopy: "base64...",
  senderCopy: "base64...",
  iv: "hexstring",
  encryptedKey: "base64...",
  messageType: "TEXT" // optional, default TEXT
});
```

Callback:
```json
{ "status": "ok", "messageId": "uuid" }
```

---

## File Upload (Attachment)

File পাঠানো **2 step** এ হয়:

### Step 1 — File Upload (REST)

**POST** `/attachments/upload`

`multipart/form-data` হিসেবে পাঠাতে হবে। Context অবশ্যই `CHAT_MESSAGE` দিতে হবে।

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

files: <file>
context: CHAT_MESSAGE
```

Response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "uuid",
    "fileName": "report.pdf",
    "fileUrl": "https://signed-s3-url...",
    "fileType": "application/pdf",
    "fileSize": 204800,
    "context": "CHAT_MESSAGE"
  }
}
```

> ℹ️ `fileUrl` একটা signed URL — নির্দিষ্ট সময় পরে expire হয়। Display এর সময় fresh URL দরকার হলে `GET /attachments/:id` call করো।

### Step 2 — Message হিসেবে পাঠাও (WebSocket)

Step 1 এর response থেকে `id` নিয়ে `send_message` emit করো:

```js
socket.emit("send_message", {
  conversationId: "uuid",
  senderCopy: "base64...",
  recipientCopy: "base64...",
  iv: "hexstring",
  encryptedKey: "base64...",
  messageType: "ATTACHMENT",
  attachmentId: "uuid" // Step 1 এর response থেকে
});
```

> ⚠️ `messageType: "ATTACHMENT"` দিলে `attachmentId` **অবশ্যই** লাগবে। না দিলে `400` error আসবে। উল্টোভাবে, `attachmentId` দিলে `messageType` অবশ্যই `"ATTACHMENT"` হতে হবে।

### `new_message` response (attachment সহ)

```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "senderCopy": "base64...",
  "recipientCopy": "base64...",
  "iv": "hexstring",
  "encryptedKey": "base64...",
  "messageType": "ATTACHMENT",
  "createdAt": "...",
  "sender": { "id": "uuid", "name": "John Doe" },
  "proposals": [],
  "attachments": [
    {
      "id": "uuid",
      "fileName": "report.pdf",
      "fileUrl": "https://signed-s3-url...",
      "fileType": "application/pdf",
      "fileSize": 204800
    }
  ]
}
```

> ℹ️ TEXT message এ `attachments: []` empty array আসবে।

---

#### `typing`

```js
socket.emit("typing", { conversationId: "uuid" });
```

---

#### `stop_typing`

```js
socket.emit("stop_typing", { conversationId: "uuid" });
```

---

### Events — Server থেকে Client এ (Listen)

| Event | কখন আসে | Payload |
|-------|---------|---------|
| `joined_conversation` | join সফল হলে | `{ conversationId }` |
| `left_conversation` | leave সফল হলে | `{ conversationId }` |
| `new_message` | conversation room এ নতুন message এলে | full message object (encrypted) |
| `user_typing` | অন্য participant typing করলে | `{ userId, name }` |
| `user_stop_typing` | অন্য participant typing বন্ধ করলে | `{ userId }` |
| `user_online` | কেউ WebSocket এ connect করলে | `{ userId }` |
| `user_offline` | কেউ disconnect করলে | `{ userId }` |
| `error` | auth fail বা invalid request | `{ message: "..." }` |

> ℹ️ `user_online` / `user_offline` globally broadcast হয়। তাই conversation list এ `isPatientOnline` / `isProviderOnline` এই দুটো event দিয়ে realtime এ update করতে হবে।

```js
socket.on("user_online", ({ userId }) => {
  // conversation list এ যে conversation এর patient/provider এই userId, সেটা isActive: true করো
});

socket.on("user_offline", ({ userId }) => {
  // সেই userId এর জন্য isActive: false করো
});
```

**`new_message` payload:**
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "senderCopy": "base64...",
  "recipientCopy": "base64...",
  "iv": "hexstring",
  "encryptedKey": "base64...",
  "messageType": "TEXT",
  "createdAt": "...",
  "sender": { "id": "uuid", "name": "John Doe" }
}
```

---

## messageType Values

| Value | মানে |
|-------|------|
| `TEXT` | সাধারণ text message (default) |
| `ATTACHMENT` | File/image attachment |
| `PROPOSAL` | Doctor এর treatment proposal |

---

## Proposal Message পাঠানো

Doctor যখন patient কে treatment proposal পাঠাবে, তখন `send_message` event এ `messageType: "PROPOSAL"` এবং `proposal` object দিতে হবে।

> ⚠️ `messageType: "PROPOSAL"` দিলে `proposal` object **অবশ্যই** লাগবে। না দিলে `400` error আসবে। উল্টোভাবে, `proposal` object দিলে `messageType` অবশ্যই `"PROPOSAL"` হতে হবে।

`send_message` payload (proposal সহ):
```json
{
  "conversationId": "uuid",
  "senderCopy": "base64...",
  "recipientCopy": "base64...",
  "iv": "hexstring",
  "encryptedKey": "base64...",
  "messageType": "PROPOSAL",
  "proposal": {
    "title": "Personalized Weight Loss Consultation",
    "description": "4-week program including weekly check-ins",
    "fee": "150.00",
    "proposalDate": "2025-08-01T00:00:00.000Z"
  }
}
```

Proposal fields:
| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | ✅ | string | Proposal এর title |
| `description` | ❌ | string | বিস্তারিত বিবরণ |
| `fee` | ✅ | string (decimal) | Fee, e.g. `"150.00"` |
| `proposalDate` | ❌ | ISO date string | Proposed date |

Message এর encrypted content (senderCopy/recipientCopy) এ কী রাখবে সেটা তোমার উপর — proposal এর summary টা encrypt করে রাখতে পারো, অথবা শুধু `"[Proposal]"` রাখতে পারো। Proposal এর actual data (title, fee ইত্যাদি) plaintext এ `proposal` field এ যাচ্ছে কারণ এগুলো structured data যা UI render করতে হবে।

### `new_message` response (proposal সহ)

Server proposal সহ message save করার পরে `new_message` event এ এই structure আসবে:

```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "senderCopy": "base64...",
  "recipientCopy": "base64...",
  "iv": "hexstring",
  "encryptedKey": "base64...",
  "messageType": "PROPOSAL",
  "createdAt": "...",
  "sender": { "id": "uuid", "name": "Dr. Smith" },
  "proposals": [
    {
      "id": "uuid",
      "title": "Personalized Weight Loss Consultation",
      "description": "4-week program including weekly check-ins",
      "fee": "150.00",
      "proposalDate": "2025-08-01T00:00:00.000Z",
      "status": "PENDING",
      "updatedAt": "..."
    }
  ]
}
```

### Proposal Status Values

| Value | মানে |
|-------|------|
| `PENDING` | Patient এখনো respond করেনি (default) |
| `ACCEPTED` | Patient accept করেছে |
| `REJECTED` | Patient reject করেছে |
| `EXPIRED` | Expired হয়ে গেছে |

> ℹ️ Proposal accept/reject করার endpoint আলাদাভাবে আসবে।

---

## Error Responses

| Status | কারণ |
|--------|------|
| `400` | Invalid public key / Missing encryption fields / Participant এর public key নেই |
| `401` | JWT token নেই বা invalid |
| `403` | Conversation এ access নেই |
| `404` | User বা conversation পাওয়া যায়নি |

WebSocket error: `error` event এ `{ message: "Unauthorized" }` আসবে এবং connection disconnect হয়ে যাবে।

---

## Complete Flow Summary

```
1. User login → JWT পাওয়া গেল
2. RSA key pair generate করো (যদি না থাকে) → public key server এ register করো
3. Conversation তৈরি করো (উভয় participant এর public key আগে registered থাকতে হবে)
4. WebSocket connect করো JWT দিয়ে
5. Conversation room এ join করো (join_conversation)
6. Message পাঠানোর আগে:
   a. Recipient এর public key নাও (GET /message/keys/:userId)
   b. Encrypt করো (hybrid encryption)
   c. send_message emit করো
7. new_message event শুনো → decrypt করো → UI তে show করো
8. Message history দরকার হলে REST API call করো
```

---

## গুরুত্বপূর্ণ বিষয় (Do's & Don'ts)

✅ করতে হবে:
- Private key সবসময় locally রাখো (IndexedDB preferred)
- App open হওয়ার সাথে সাথে public key register করো
- `new_message` receive করার আগে অবশ্যই `join_conversation` call করতে হবে
- `senderId === currentUserId` হলে `senderCopy` decrypt করো, নাহলে `recipientCopy`

❌ করা যাবে না:
- Private key কখনো server এ পাঠানো যাবে না
- Public key register না করে conversation তৈরি করা যাবে না
- Plaintext message server এ পাঠানো যাবে না
