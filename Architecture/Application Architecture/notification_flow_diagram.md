# YesLove Notification Service - End-to-End Flow

## Architecture Overview

```mermaid
graph TB
    %% User Actions
    A[User Action] --> B{Action Type}
    B -->|Like Post| C[Like Handler]
    B -->|Comment| D[Comment Handler]
    B -->|Follow User| E[Follow Handler]
    B -->|New Post| F[Post Handler]
    
    %% Notification Creation
    C --> G[NotificationService.create_notification]
    D --> G
    E --> G
    F --> H[Batch Notification via SQS]
    
    %% Core Notification Service
    G --> I[Create DB Record]
    I --> J[Check User Preferences]
    J --> K{Notifications Enabled?}
    K -->|Yes| L[Send Push Notification]
    K -->|No| M[Skip Push]
    L --> N[FCM Service]
    
    %% Batch Processing
    H --> O[SQS Queue]
    O --> P[SQS Worker]
    P --> Q[JobProcessor]
    Q --> R[PushNotificationService]
    R --> S[Multiple FCM Calls]
    
    %% Client Delivery
    N --> T[Mobile Device]
    S --> T
    
    %% In-App Notifications
    I --> U[Database Storage]
    U --> V[API Endpoints]
    V --> W[Mobile App UI]
    
    %% Error Handling
    P --> X{Job Success?}
    X -->|No| Y[Retry with Backoff]
    Y --> Z{Max Retries?}
    Z -->|Yes| AA[Dead Letter Queue]
    Z -->|No| O
```

## Detailed Flow Diagrams

### 1. Single User Notification Flow

```mermaid
sequenceDiagram
    participant U as User Action
    participant API as API Handler
    participant NS as NotificationService
    participant DB as Database
    participant PS as PushService
    participant FCM as FCM
    participant Mobile as Mobile Device
    
    U->>API: Like/Comment/Follow
    API->>NS: create_notification()
    
    NS->>DB: INSERT notification record
    NS->>DB: CHECK user preferences
    
    alt Notifications Enabled
        NS->>PS: send_to_user()
        PS->>DB: GET device tokens
        PS->>FCM: Send push notification
        FCM->>Mobile: Push delivered
    else Notifications Disabled
        NS->>NS: Skip push notification
    end
    
    Note over DB: In-app notification stored
    Mobile->>API: GET /notifications
    API->>DB: SELECT notifications
    DB->>Mobile: Return notification list
```

### 2. Batch Notification Flow (High Volume)

```mermaid
sequenceDiagram
    participant API as API Handler
    participant SQS as AWS SQS
    participant Worker as SQS Worker
    participant JP as JobProcessor
    participant PS as PushService
    participant FCM as FCM
    participant DLQ as Dead Letter Queue
    
    API->>SQS: Enqueue batch job
    Note over SQS: job_type: notification_batch<br/>user_ids: [1,2,3...]
    
    Worker->>SQS: Long poll for messages
    SQS->>Worker: Return batch job
    
    Worker->>JP: process_job(job_data)
    JP->>PS: send_to_multiple_users()
    
    loop For each user_id
        PS->>FCM: Send individual push
    end
    
    alt Success
        Worker->>SQS: Delete message
    else Failure
        Worker->>SQS: Change visibility (retry)
        Note over Worker: Exponential backoff
        
        alt Max retries exceeded
            Worker->>DLQ: Move to dead letter queue
            Worker->>SQS: Delete from main queue
        end
    end
```

### 3. In-App Notification Retrieval

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant API as Notification API
    participant DB as Database
    
    Mobile->>API: GET /notifications?page=1
    API->>DB: SELECT notifications WHERE user_id=X
    DB->>API: Return paginated results
    API->>Mobile: JSON response with notifications
    
    Note over Mobile: Display notification list<br/>Show unread count badge
    
    Mobile->>API: POST /notifications/123/read
    API->>DB: UPDATE notification SET is_read=true
    DB->>API: Confirmation
    API->>Mobile: Success response
    
    Note over Mobile: Update UI - remove badge
```

## Component Responsibilities

### Database Layer
- **Notification Table**: Persistent storage for all notifications
- **DeviceToken Table**: FCM tokens for push delivery
- **NotificationSettings Table**: User preferences per notification type

### Service Layer
- **NotificationService**: Core business logic for notification creation
- **PushNotificationService**: FCM integration and device token management
- **SQSService**: Queue management for batch processing

### Worker Layer
- **SQSWorker**: Long-polling message consumer
- **JobProcessor**: Job type routing and execution
- **Retry Logic**: Exponential backoff and DLQ handling

### API Layer
- **Notification Routes**: REST endpoints for mobile app
- **Integration Points**: Like/comment/follow handlers

## Data Flow Summary

1. **Trigger**: User performs action (like, comment, follow)
2. **Route**: API handler calls NotificationService
3. **Persist**: Notification saved to database
4. **Check**: User preferences validated
5. **Push**: FCM notification sent (if enabled)
6. **Retrieve**: Mobile app fetches via API
7. **Display**: In-app notification shown to user
8. **Mark Read**: User interaction updates read status

## Error Handling & Resilience

- **Database Failures**: Rollback notification creation
- **FCM Failures**: Log error, continue with in-app notification
- **SQS Failures**: Retry with exponential backoff
- **Worker Failures**: Move to DLQ after max retries
- **Graceful Shutdown**: Signal handling for worker processes