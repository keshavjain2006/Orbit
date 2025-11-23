# API Documentation

Complete API reference for the Proximity App Backend.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]  // For validation errors
}
```

## Endpoints

### Health Check

#### GET /health

Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Encounters

### Record an Encounter

#### POST /api/encounters

Record when two users have been near each other.

**Request Body:**
```json
{
  "user1Id": "uuid",
  "user2Id": "uuid",
  "latitude": 40.7128,    // optional
  "longitude": -74.0060    // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Encounter recorded successfully",
  "data": {
    "id": "encounter-uuid",
    "user1Id": "uuid",
    "user2Id": "uuid",
    "encounteredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (200) - Duplicate:**
```json
{
  "success": true,
  "message": "Encounter already recorded (duplicate ignored)",
  "data": null
}
```

---

### Check for Connection Requests

#### GET /api/encounters/check-requests

Get pairs that qualify for connection requests (3+ encounters in 14 days).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user1Id": "uuid",
      "user2Id": "uuid",
      "encounterCount": 3,
      "firstEncounter": "2024-01-01T00:00:00.000Z",
      "lastEncounter": "2024-01-14T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Get User Encounters

#### GET /api/encounters?userId=uuid

Get all encounters for a specific user.

**Query Parameters:**
- `userId` (required): User UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "encounter-uuid",
      "user1Id": "uuid",
      "user2Id": "uuid",
      "encounteredAt": "2024-01-01T00:00:00.000Z",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "user1": {
        "id": "uuid",
        "username": "alice",
        "name": "Alice",
        "photoUrl": "https://..."
      },
      "user2": {
        "id": "uuid",
        "username": "bob",
        "name": "Bob",
        "photoUrl": "https://..."
      }
    }
  ],
  "count": 10
}
```

---

## Connections

### Create Connection Requests

#### POST /api/connections/create-requests

Automatically create connection requests for qualifying pairs. Should be run as a scheduled job.

**Response:**
```json
{
  "success": true,
  "message": "Created 2 connection request(s)",
  "data": {
    "created": 2,
    "total": 2
  }
}
```

---

### Respond to Connection Request

#### PATCH /api/connections/requests/:requestId/respond

Accept or reject a connection request.

**URL Parameters:**
- `requestId`: Connection request UUID

**Request Body:**
```json
{
  "userId": "uuid",
  "accept": true  // or false
}
```

**Response (Accept - Both Accepted):**
```json
{
  "success": true,
  "message": "Connection established successfully",
  "data": {
    "connectionId": "uuid",
    "conversationId": "uuid"
  }
}
```

**Response (Accept - Waiting):**
```json
{
  "success": true,
  "message": "Request accepted, waiting for other user",
  "data": {
    "requestId": "uuid",
    "status": "pending"
  }
}
```

**Response (Reject):**
```json
{
  "success": true,
  "message": "Connection request rejected",
  "data": null
}
```

---

### Get User Connections

#### GET /api/connections/user/:userId

Get all active connections for a user.

**URL Parameters:**
- `userId`: User UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "connectionId": "uuid",
      "otherUser": {
        "id": "uuid",
        "username": "bob",
        "name": "Bob",
        "photoUrl": "https://..."
      },
      "connectedAt": "2024-01-01T00:00:00.000Z",
      "conversationId": "uuid",
      "lastMessageAt": "2024-01-02T00:00:00.000Z",
      "lastMessagePreview": "Hello!"
    }
  ],
  "count": 5
}
```

---

### Get Pending Requests

#### GET /api/connections/pending/:userId

Get all pending connection requests for a user.

**URL Parameters:**
- `userId`: User UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "uuid",
      "otherUser": {
        "id": "uuid",
        "username": "charlie",
        "name": "Charlie",
        "photoUrl": "https://..."
      },
      "isRequester": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-31T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

## Messages

### Send Message

#### POST /api/messages

Send a message in a conversation.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "senderId": "uuid",
  "content": "Hello!",
  "messageType": "text"  // optional: text, image, video, location, system
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "message-uuid",
    "conversationId": "uuid",
    "sender": {
      "id": "uuid",
      "username": "alice",
      "name": "Alice",
      "photoUrl": "https://..."
    },
    "content": "Hello!",
    "messageType": "text",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Conversation Messages

#### GET /api/messages/conversation/:conversationId?limit=50&offset=0

Get paginated chat history for a conversation.

**URL Parameters:**
- `conversationId`: Conversation UUID

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message-uuid",
      "conversationId": "uuid",
      "senderId": "uuid",
      "content": "Hello!",
      "messageType": "text",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "readAt": null,
      "editedAt": null,
      "deletedAt": null,
      "sender": {
        "id": "uuid",
        "username": "alice",
        "name": "Alice",
        "photoUrl": "https://..."
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

---

### Mark Messages as Read

#### PATCH /api/messages/conversation/:conversationId/read

Mark all unread messages in a conversation as read.

**URL Parameters:**
- `conversationId`: Conversation UUID

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Marked 5 message(s) as read",
  "data": {
    "count": 5
  }
}
```

---

## Error Responses

### 400 Bad Request

Validation error:

```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "path": "body.user1Id",
      "message": "Required"
    }
  ]
}
```

### 403 Forbidden

User not authorized:

```json
{
  "success": false,
  "error": "User is not part of this conversation"
}
```

### 404 Not Found

Resource not found:

```json
{
  "success": false,
  "error": "Conversation not found"
}
```

### 409 Conflict

Duplicate entry:

```json
{
  "success": false,
  "error": "Duplicate Entry",
  "message": "A record with this information already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Example Workflow

### 1. Record Encounters

```bash
# User A and B meet
POST /api/encounters
{
  "user1Id": "user-a-uuid",
  "user2Id": "user-b-uuid",
  "latitude": 40.7128,
  "longitude": -74.0060
}

# Repeat 2 more times within 14 days
```

### 2. Create Connection Requests (Scheduled Job)

```bash
POST /api/connections/create-requests
# Automatically creates request for A and B
```

### 3. Accept Connection Request

```bash
# User A accepts
PATCH /api/connections/requests/{requestId}/respond
{
  "userId": "user-a-uuid",
  "accept": true
}

# User B accepts
PATCH /api/connections/requests/{requestId}/respond
{
  "userId": "user-b-uuid",
  "accept": true
}
# Connection and conversation are created
```

### 4. Send Messages

```bash
# User A sends message
POST /api/messages
{
  "conversationId": "conversation-uuid",
  "senderId": "user-a-uuid",
  "content": "Hello!"
}

# User B sends message
POST /api/messages
{
  "conversationId": "conversation-uuid",
  "senderId": "user-b-uuid",
  "content": "Hi there!"
}
```

### 5. Get Chat History

```bash
GET /api/messages/conversation/{conversationId}?limit=50&offset=0
```

### 6. Mark as Read

```bash
PATCH /api/messages/conversation/{conversationId}/read
{
  "userId": "user-a-uuid"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, add rate limiting middleware.

## Authentication

Currently no authentication is implemented. For production, add JWT or OAuth authentication.

