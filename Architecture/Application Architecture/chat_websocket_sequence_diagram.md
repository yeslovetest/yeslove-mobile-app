# WebSocket Chat System - Sequence Diagram

```mermaid
sequenceDiagram
    participant U1 as User A (Sender)
    participant F1 as Frontend A
    participant WS as WebSocket Server
    participant API as Chat API
    participant DB as Database
    participant NS as Notification Service
    participant FCM as FCM Push Service
    participant F2 as Frontend B
    participant U2 as User B (Receiver)

    %% Connection Setup
    Note over U1,U2: Initial WebSocket Connections
    F1->>WS: connect() with auth token
    WS->>WS: authenticate user A
    WS->>WS: add user A to active_users{123: socket_id}
    
    F2->>WS: connect() with auth token
    WS->>WS: authenticate user B
    WS->>WS: add user B to active_users{456: socket_id}

    %% Message Sending Flow (Both Users Online)
    Note over U1,U2: Scenario 1: Both Users Online
    U1->>F1: types message "Hello!"
    F1->>API: POST /api/chat/send_message
    Note right of API: {receiver_id: 456, message: "Hello!"}
    
    API->>API: validate & moderate content
    API->>DB: save Chat record
    DB-->>API: message_id: 789
    
    API->>WS: send_message_realtime(456, message_data)
    WS->>WS: check if user 456 online
    Note right of WS: user 456 found in active_users
    
    WS->>F2: emit('new_message', message_data)
    F2->>F2: update chat UI instantly
    F2->>U2: display "Hello!" message
    
    API->>NS: create_notification(user_id: 456)
    NS->>DB: save in-app notification
    
    API-->>F1: {status: "sent", delivered: true}
    F1->>U1: show "delivered" status

    %% Message Sending Flow (Receiver Offline)
    Note over U1,U2: Scenario 2: Receiver Offline
    F2->>WS: disconnect()
    WS->>WS: remove user B from active_users
    
    U1->>F1: types message "Are you there?"
    F1->>API: POST /api/chat/send_message
    
    API->>DB: save Chat record
    API->>WS: send_message_realtime(456, message_data)
    WS->>WS: check if user 456 online
    Note right of WS: user 456 NOT found in active_users
    
    WS-->>API: user_offline = true
    API->>NS: send_push_notification(456, "New Message")
    NS->>FCM: send FCM notification
    FCM->>U2: push notification on device
    
    API-->>F1: {status: "sent", delivered: false}
    F1->>U1: show "sent" status

    %% Reconnection & Message Sync
    Note over U1,U2: Scenario 3: User B Reconnects
    F2->>WS: connect() (user B back online)
    WS->>WS: add user B to active_users
    
    F2->>API: GET /api/chat/get_messages/123
    API->>DB: fetch unread messages
    DB-->>API: return message list
    API-->>F2: message history
    F2->>F2: sync & display messages
    F2->>U2: show missed messages

    %% Read Receipts
    Note over U1,U2: Scenario 4: Read Receipts
    U2->>F2: opens chat with user A
    F2->>API: PUT /api/chat/mark_chat_opened/123
    API->>DB: UPDATE chat SET opened=true
    DB-->>API: success
    API-->>F2: messages marked as read
    
    %% Optional: Real-time read receipt via WebSocket
    API->>WS: emit_read_receipt(123, message_ids)
    WS->>F1: emit('messages_read', {message_ids})
    F1->>F1: update message status to "read"
    F1->>U1: show "read" checkmarks

    %% Media Message Flow
    Note over U1,U2: Scenario 5: Media Message
    U1->>F1: selects image file
    F1->>API: POST /api/chat/upload_media (multipart)
    API->>DB: save Media record
    DB-->>API: media_id: "abc-123"
    API-->>F1: {media_id: "abc-123", media_url: "/api/media/abc-123"}
    
    F1->>API: POST /api/chat/send_message
    Note right of API: {receiver_id: 456, media_id: "abc-123"}
    API->>DB: save Chat with media_id
    API->>WS: send_message_realtime(456, message_data)
    WS->>F2: emit('new_message', {media_id, media_url})
    F2->>F2: display image in chat
    F2->>U2: show image message
```

## Key Components

### **WebSocket Server**
- Maintains `active_users` map: `{user_id: socket_id}`
- Handles connect/disconnect events
- Routes real-time messages to online users

### **Chat API**
- Validates and moderates messages
- Saves to database for persistence
- Attempts WebSocket delivery first
- Falls back to push notifications for offline users

### **Notification Service**
- Creates in-app notifications (always)
- Sends push notifications (only if user offline)
- Respects user notification preferences

### **Database**
- Stores all messages permanently
- Tracks read status with `opened` field
- Supports media attachments via `media_id`

## Message States

1. **Sent**: Message saved to database
2. **Delivered**: Message reached recipient (WebSocket or push)
3. **Read**: Recipient opened the chat and viewed message

## Offline Handling

- **Online**: Instant WebSocket delivery
- **Offline**: Push notification + database storage
- **Reconnect**: Sync from database on reconnection