# C2PA Generator Assistant - API Documentation

## Base URL

**Local Development:** `http://localhost:8080/api`
**Production:** `https://generator-product.trusteddit.com/api`

## Authentication

Currently, the API does not require authentication. This is designed for single-company use (Sanmarcsoft LLC).

## Common Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Health Check

### GET /health

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T12:00:00.000Z",
  "service": "C2PA Generator Assistant API"
}
```

---

## Document Management

### GET /api/documents

List all documents.

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "documents": [
    {
      "id": "uuid",
      "filename": "stored-filename.pdf",
      "original_name": "document.pdf",
      "file_path": "/app/data/uploads/uuid.pdf",
      "file_type": "pdf",
      "file_size": 1024000,
      "category": "user-upload",
      "upload_date": "2025-10-14T12:00:00.000Z",
      "status": "pending",
      "metadata": null,
      "created_at": "2025-10-14T12:00:00.000Z"
    }
  ]
}
```

### GET /api/documents/:id

Get details of a specific document.

**Parameters:**
- `id` (string, required): Document ID

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "filename": "stored-filename.pdf",
    "original_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "category": "user-upload",
    "upload_date": "2025-10-14T12:00:00.000Z",
    "status": "reviewed",
    "annotations": [
      {
        "id": "uuid",
        "document_id": "uuid",
        "page_number": 1,
        "content": "Important note",
        "position": "{\"x\": 100, \"y\": 200}",
        "created_at": "2025-10-14T12:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/documents/upload

Upload a new document.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, required): The document file
- `category` (string, optional): Document category (default: "user-upload")

**Accepted File Types:** PDF, DOCX, TXT, MD, JSON

**Max File Size:** 50MB (configurable)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": "uuid",
    "filename": "uuid.pdf",
    "original_name": "document.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "category": "user-upload",
    "upload_date": "2025-10-14T12:00:00.000Z",
    "status": "pending"
  }
}
```

### GET /api/documents/:id/download

Download a document.

**Parameters:**
- `id` (string, required): Document ID

**Response:** Binary file download

### DELETE /api/documents/:id

Delete a document.

**Parameters:**
- `id` (string, required): Document ID

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### PUT /api/documents/:id/annotations

Save annotations for a document.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "annotations": [
    {
      "pageNumber": 1,
      "content": "Important section",
      "position": { "x": 100, "y": 200 }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Annotations saved successfully"
}
```

---

## Chat / AI Assistant

### POST /api/chat

Send a message to the AI assistant.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "message": "How do I start the certification process?",
  "context": {
    "currentPhase": "phase-1",
    "relatedDocuments": ["doc-id-1"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "id": "uuid",
    "message": "Great question! To start the certification process...",
    "emotion": "helpful",
    "animation": "pointing",
    "suggestions": [
      "Review the eligibility requirements",
      "Prepare your documentation",
      "Begin Phase 1"
    ]
  }
}
```

### GET /api/chat/history

Get conversation history.

**Query Parameters:**
- `limit` (number, optional): Number of messages to retrieve (default: 50)
- `offset` (number, optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "message": "Hello",
      "context": "{}",
      "metadata": "{}",
      "created_at": "2025-10-14T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "sender": "assistant",
      "message": "Hello! How can I help?",
      "context": "{}",
      "metadata": "{\"emotion\": \"friendly\"}",
      "created_at": "2025-10-14T12:00:30.000Z"
    }
  ]
}
```

### POST /api/chat/analyze-document

Analyze an uploaded document using AI.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "documentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "id": "uuid",
    "summary": "This document outlines the requirements...",
    "keyPoints": [
      "Point 1",
      "Point 2",
      "Point 3"
    ],
    "requirements": [
      "Requirement 1",
      "Requirement 2"
    ],
    "suggestions": [
      "Next step 1",
      "Next step 2"
    ]
  }
}
```

### GET /api/chat/suggestions

Get next step suggestions based on current progress.

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Review the Generator Product Security Requirements",
    "Upload your technical documentation",
    "Complete Phase 2 checklist"
  ]
}
```

### DELETE /api/chat/history

Clear conversation history.

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

---

## Progress Tracking

### GET /api/progress

Get certification progress for Sanmarcsoft LLC.

**Response:**
```json
{
  "success": true,
  "progress": {
    "id": "uuid",
    "user_id": "sanmarcsoft-llc",
    "company_name": "Sanmarcsoft LLC",
    "current_phase": "phase-2",
    "start_date": "2025-10-01T00:00:00.000Z",
    "phases": [
      {
        "id": "phase-1",
        "name": "Introduction & Prerequisites",
        "status": "completed",
        "completedDate": "2025-10-05T00:00:00.000Z",
        "tasks": []
      },
      {
        "id": "phase-2",
        "name": "Understanding Requirements",
        "status": "in_progress",
        "tasks": []
      }
    ],
    "notes": [],
    "updated_at": "2025-10-14T12:00:00.000Z"
  }
}
```

### PUT /api/progress/phase/:phaseId

Update phase status.

**Parameters:**
- `phaseId` (string, required): Phase ID (e.g., "phase-1")

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "completed",
  "completedDate": "2025-10-14T12:00:00.000Z"
}
```

**Valid Statuses:** `pending`, `in_progress`, `completed`

**Response:**
```json
{
  "success": true,
  "message": "Phase updated successfully",
  "phase": {
    "id": "phase-1",
    "name": "Introduction & Prerequisites",
    "status": "completed",
    "completedDate": "2025-10-14T12:00:00.000Z"
  }
}
```

### GET /api/progress/checklist

Get checklist items.

**Query Parameters:**
- `phaseId` (string, optional): Filter by phase ID

**Response:**
```json
{
  "success": true,
  "count": 5,
  "items": [
    {
      "id": "uuid",
      "phase_id": "phase-1",
      "title": "Review eligibility requirements",
      "description": "Read through all eligibility criteria",
      "status": "completed",
      "order_index": 0,
      "created_at": "2025-10-01T00:00:00.000Z",
      "completed_at": "2025-10-05T00:00:00.000Z"
    }
  ]
}
```

### PUT /api/progress/checklist/:itemId

Update checklist item status.

**Parameters:**
- `itemId` (string, required): Checklist item ID

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checklist item updated successfully",
  "item": {
    "id": "uuid",
    "phase_id": "phase-1",
    "title": "Review eligibility requirements",
    "status": "completed",
    "completed_at": "2025-10-14T12:00:00.000Z"
  }
}
```

### POST /api/progress/checklist

Create a new checklist item.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "phaseId": "phase-1",
  "title": "Complete technical review",
  "description": "Review all technical documentation",
  "orderIndex": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checklist item created successfully",
  "item": {
    "id": "uuid",
    "phase_id": "phase-1",
    "title": "Complete technical review",
    "description": "Review all technical documentation",
    "status": "pending",
    "order_index": 5,
    "created_at": "2025-10-14T12:00:00.000Z"
  }
}
```

### DELETE /api/progress/checklist/:itemId

Delete a checklist item.

**Parameters:**
- `itemId` (string, required): Checklist item ID

**Response:**
```json
{
  "success": true,
  "message": "Checklist item deleted successfully"
}
```

---

## C2PA Resources

### GET /api/c2pa/documents

List C2PA official documents.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "documents": [
    {
      "filename": "C2PA-Conformance-Program.pdf",
      "size": 1024000,
      "created": "2025-10-01T00:00:00.000Z",
      "modified": "2025-10-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/c2pa/sync

Get list of C2PA documents to sync from GitHub.

**Response:**
```json
{
  "success": true,
  "message": "C2PA documents list retrieved",
  "documents": [
    {
      "name": "C2PA Generator Product Company Agreement",
      "url": "https://raw.githubusercontent.com/...",
      "category": "legal-agreement"
    }
  ],
  "note": "Use the frontend to download these documents"
}
```

### GET /api/c2pa/info

Get C2PA program information.

**Response:**
```json
{
  "success": true,
  "info": {
    "program": "C2PA Conformance Program",
    "purpose": "Certification for Generator Product Companies",
    "phases": [
      {
        "id": "phase-1",
        "name": "Introduction & Prerequisites",
        "description": "Welcome and system overview..."
      }
    ],
    "repository": "https://github.com/Sanmarcsoft/c2pa-org-conformance-public",
    "website": "https://c2pa.org"
  }
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (invalid parameters) |
| 404 | Resource not found |
| 413 | File too large |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes (configurable)
- **Max Requests:** 100 per window (configurable)

When rate limited, you'll receive a 429 status code:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## CORS

The API supports CORS for local development. Configure the `CORS_ORIGIN` environment variable to allow requests from your frontend.

**Default:** `http://localhost:5173`

---

## WebSocket Support

WebSocket support is not currently implemented but may be added in future versions for real-time chat updates.

---

## Versioning

The API is currently at version 1.0. Future versions will be indicated in the URL path (e.g., `/api/v2/`).

---

## Support

For issues or questions, please open an issue on the GitHub repository:
https://github.com/smsmatt/c2pa-generator-product/issues
