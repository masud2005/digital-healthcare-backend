# Message Module — E2E Encrypted Chat — Postman Testing Guide

## How E2E Encryption Works

```
Client Side (never leaves device):
  - RSA-2048 private key  →  decrypt incoming messages

Server Side (stored in DB):
  - RSA public key        →  others encrypt messages for you
  - Ciphertext only       →  server NEVER sees plaintext

Encryption Flow per message (Hybrid RSA + AES-256-GCM):
  1. Client generates a random AES-256-GCM key
  2. Encrypts plaintext with AES key  →  ciphertext
  3. Encrypts AES key with recipient's RSA public key  →  encryptedKey
  4. Encrypts same ciphertext with sender's own RSA public key  →  senderCopy
  5. Sends: { recipientCopy, senderCopy, iv, encryptedKey } to server
  6. Server stores & forwards — ZERO plaintext ever reaches server
```

---

## Base URLs

```
HTTP REST:  http://localhost:3000
WebSocket:  http://localhost:3000/chat   (Socket.IO namespace)
```

---

## Environment Variables (Set in Postman)

| Variable | Value |
|---|---|
| `BASE_URL` | `http://localhost:3000` |
| `PATIENT_TOKEN` | *(from login)* |
| `DOCTOR_TOKEN` | *(from login)* |
| `PATIENT_ID` | *(patient user UUID)* |
| `DOCTOR_ID` | *(doctor user UUID)* |
| `CONVERSATION_ID` | *(from create conversation)* |
| `SERVICE_ID` | *(valid Category UUID)* |

---

## Step-by-Step Test Flow

---

### STEP 1 — Login as Patient

**POST** `{{BASE_URL}}/auth/login`
```json
{
  "email": "patient@example.com",
  "password": "yourPassword"
}
```
> Save `data.accessToken` → `PATIENT_TOKEN`
> Save `data.user.id` → `PATIENT_ID`

---

### STEP 2 — Login as Doctor

**POST** `{{BASE_URL}}/auth/login`
```json
{
  "email": "doctor@example.com",
  "password": "yourPassword"
}
```
> Save `data.accessToken` → `DOCTOR_TOKEN`
> Save `data.user.id` → `DOCTOR_ID`

---

### STEP 3 — Generate RSA Key Pairs (Client-Side)

Run this in Node.js or browser (never send private key to server):

```js
const { generateKeyPairSync } = require("crypto");

const { publicKey: patientPublic, privateKey: patientPrivate } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const { publicKey: doctorPublic, privateKey: doctorPrivate } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

console.log("PATIENT_PUBLIC:", patientPublic);
console.log("DOCTOR_PUBLIC:", doctorPublic);
// Keep patientPrivate and doctorPrivate ONLY on the respective client devices
```

---

### STEP 4 — Patient Registers Public Key

**POST** `{{BASE_URL}}/message/keys/register`

**Headers:**
```
Authorization: Bearer {{PATIENT_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----"
}
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Public key registered",
  "data": { "userId": "patient-uuid" }
}
```

---

### STEP 5 — Doctor Registers Public Key

**POST** `{{BASE_URL}}/message/keys/register`

**Headers:**
```
Authorization: Bearer {{DOCTOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----"
}
```

---

### STEP 6 — Fetch Recipient's Public Key (before sending)

**GET** `{{BASE_URL}}/message/keys/{{DOCTOR_ID}}`

**Headers:**
```
Authorization: Bearer {{PATIENT_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Public key retrieved",
  "data": {
    "userId": "doctor-uuid",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```
> Patient fetches doctor's public key to encrypt messages for the doctor.
> Doctor fetches patient's public key to encrypt messages for the patient.

---

### STEP 7 — Create Conversation

**POST** `{{BASE_URL}}/message/conversation`

**Headers:**
```
Authorization: Bearer {{PATIENT_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "serviceID": "{{SERVICE_ID}}",
  "patientId": "{{PATIENT_ID}}",
  "providerId": "{{DOCTOR_ID}}"
}
```

> ⚠️ Will fail with 400 if either user has not registered a public key.

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Conversation created",
  "data": {
    "id": "conv-uuid",
    "patientId": "...",
    "providerId": "...",
    "patient": { "id": "...", "name": "John Doe" },
    "provider": { "id": "...", "name": "Dr. Smith" }
  }
}
```
> Save `data.id` → `CONVERSATION_ID`

---

### STEP 8 — Encrypt a Message (Client-Side)

Run this helper before sending a message via WebSocket or HTTP:

```js
const { publicEncrypt, randomBytes, createCipheriv, createDecipheriv, privateDecrypt } = require("crypto");
const crypto = require("crypto");

function encryptMessage(plaintext, recipientPublicKeyPem, senderPublicKeyPem) {
  // 1. Generate random AES-256-GCM key + IV
  const aesKey = randomBytes(32);
  const iv = randomBytes(12); // 96-bit IV for GCM

  // 2. Encrypt plaintext with AES key
  const cipher = createCipheriv("aes-256-gcm", aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const fullCiphertext = Buffer.concat([ciphertext, authTag]).toString("base64");

  // 3. Encrypt AES key with recipient's RSA public key
  const encryptedKey = publicEncrypt(recipientPublicKeyPem, aesKey).toString("base64");

  // 4. Encrypt same ciphertext with sender's own RSA public key (for sender's inbox)
  const encryptedKeyForSender = publicEncrypt(senderPublicKeyPem, aesKey).toString("base64");

  return {
    recipientCopy: fullCiphertext,
    senderCopy: fullCiphertext, // same ciphertext, different key encryption below
    iv: iv.toString("hex"),
    encryptedKey,           // AES key encrypted with recipient's public key
    // Note: for senderCopy decryption, use encryptedKeyForSender with sender's private key
  };
}

// Usage:
const payload = encryptMessage(
  "Hello Doctor, I need help!",
  doctorPublicKey,   // fetched from GET /message/keys/:doctorId
  patientPublicKey   // your own public key
);
console.log(payload);
```

**Decrypt on recipient side:**
```js
function decryptMessage(recipientCopy, encryptedKey, ivHex, recipientPrivateKeyPem) {
  const aesKey = privateDecrypt(recipientPrivateKeyPem, Buffer.from(encryptedKey, "base64"));
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(recipientCopy, "base64");
  const ciphertext = data.slice(0, -16);
  const authTag = data.slice(-16);
  const decipher = createDecipheriv("aes-256-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}
```

---

## WebSocket (Socket.IO) — Real-time Encrypted Chat

**URL:** `http://localhost:3000/chat`

**Auth:**
```json
{ "auth": { "token": "<JWT_TOKEN_WITHOUT_BEARER>" } }
```

---

### Socket Events Reference

#### Emit (Client → Server)

| Event | Payload |
|---|---|
| `join_conversation` | `{ "conversationId": "uuid" }` |
| `leave_conversation` | `{ "conversationId": "uuid" }` |
| `send_message` | see below |
| `typing` | `{ "conversationId": "uuid" }` |
| `stop_typing` | `{ "conversationId": "uuid" }` |

#### Listen (Server → Client)

| Event | Description |
|---|---|
| `joined_conversation` | Confirmed room join |
| `left_conversation` | Confirmed room leave |
| `new_message` | Encrypted message object |
| `user_typing` | `{ userId, name }` |
| `user_stop_typing` | `{ userId }` |
| `error` | `{ message }` |

---

### STEP 9 — Connect & Join Conversation (Patient)

Connect with `PATIENT_TOKEN`, then emit:
```json
Event: join_conversation
Data: { "conversationId": "{{CONVERSATION_ID}}" }
```
Listen for: `joined_conversation`

---

### STEP 10 — Connect & Join Conversation (Doctor)

Connect with `DOCTOR_TOKEN`, same conversation.

---

### STEP 11 — Send Encrypted Message (Patient → Doctor)

```json
Event: send_message
Data: {
  "conversationId": "{{CONVERSATION_ID}}",
  "senderCopy": "<base64-ciphertext-encrypted-with-patient-aes-key>",
  "recipientCopy": "<base64-ciphertext>",
  "iv": "<12-byte-IV-as-hex>",
  "encryptedKey": "<base64-AES-key-encrypted-with-doctor-RSA-public-key>",
  "messageType": "TEXT"
}
```

**Doctor's client receives `new_message`:**
```json
{
  "id": "msg-uuid",
  "conversationId": "conv-uuid",
  "senderId": "patient-uuid",
  "senderCopy": "...",
  "recipientCopy": "<encrypted ciphertext>",
  "iv": "<hex>",
  "encryptedKey": "<base64>",
  "messageType": "TEXT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "sender": { "id": "patient-uuid", "name": "John Doe" }
}
```
> Doctor decrypts `recipientCopy` using their private key + `encryptedKey` + `iv`

---

### STEP 12 — Get Message History

**GET** `{{BASE_URL}}/message/conversations/{{CONVERSATION_ID}}/messages`

**Headers:**
```
Authorization: Bearer {{PATIENT_TOKEN}}
```

**Optional pagination:**
```
?cursor=<last-message-id>
```

> Returns encrypted fields only. Client decrypts using:
> - If you are the recipient → use `recipientCopy` + decrypt `encryptedKey` with your private key
> - If you are the sender → use `senderCopy` + decrypt with your own private key

---

### STEP 13 — Get All Conversations

**GET** `{{BASE_URL}}/message/conversations`

**Headers:**
```
Authorization: Bearer {{PATIENT_TOKEN}}
```

---

## Error Reference

| Scenario | Status / WS Event | Message |
|---|---|---|
| Invalid RSA public key format | 400 | `Invalid RSA public key` |
| Public key not registered | 400 | `Patient/Doctor has not registered a public key` |
| Missing encryption fields | 400 | `Missing encryption fields` |
| Not a conversation participant | 403 / WS `error` | `Access denied` |
| Conversation not found | 404 / WS `error` | `Conversation not found` |
| Invalid/expired JWT | 401 / WS `error` | `Unauthorized` |

---

## Security Notes

- **Private keys never leave the client device** — server has zero access to plaintext
- **AES-256-GCM** provides authenticated encryption (prevents tampering)
- **RSA-2048** wraps the AES key (hybrid encryption for performance)
- Server compromise → attacker gets only ciphertext, cannot decrypt without client private keys
- Each user should generate a new key pair per device and register accordingly
