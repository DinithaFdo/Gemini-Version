# Gemini Chat (Next.js + Gemini + MongoDB)

A context-aware chatbot built with Next.js App Router, Google Gemini, and MongoDB.
The app stores messages by session and allows users to switch between previous chats.

## Features

- Persistent chat history in MongoDB (grouped by sessionId)
- Gemini-powered responses using gemini-2.5-flash
- Session management with New Chat and session switcher
- History auto-load when opening an existing session
- Simple API surface for sending messages and reading sessions/history

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Mongoose + MongoDB Atlas
- @google/generative-ai SDK
- Tailwind CSS

## Project Structure

```text
src/
  app/
    api/chat/route.ts        # GET/POST chat endpoints
    globals.css
    layout.tsx
    page.tsx                 # Session selector + New Chat
  components/
    ChatInterface.tsx        # Chat UI + history loading
  models/
    Chat.ts                  # Chat + message schema
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB database (Atlas recommended)
- Gemini API key from Google AI Studio

## Setup

1. Install dependencies

```bash
npm install
```

2. Create or update .env.local

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

3. Run the app

```bash
npm run dev
```

4. Open http://localhost:3000

## Environment Variables

| Variable       | Required | Description                             |
| -------------- | -------- | --------------------------------------- |
| MONGODB_URI    | Yes      | MongoDB connection URI used by Mongoose |
| GEMINI_API_KEY | Yes      | Google Gemini API key                   |

## API Reference

Base URL in local development:

```text
http://localhost:3000
```

### 1) List all chat sessions

Method: GET

Endpoint:

```text
/api/chat
```

Description:

- Returns all known session IDs sorted by latest activity (updatedAt desc).

Success response (200):

```json
{
  "sessions": ["session_abc123...", "session_xyz789..."]
}
```

Error response (500):

```json
{
  "error": "Internal Server Error"
}
```

### 2) Get message history for one session

Method: GET

Endpoint:

```text
/api/chat?sessionId={sessionId}
```

Query parameters:

| Name      | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| sessionId | string | Yes      | Chat session identifier |

Success response (200):

```json
{
  "messages": [
    { "role": "user", "content": "Hi" },
    { "role": "model", "content": "Hello! How can I help?" }
  ]
}
```

If session does not exist:

```json
{
  "messages": []
}
```

Validation error (400):

```json
{
  "error": "Missing sessionId"
}
```

### 3) Send a user message and receive AI response

Method: POST

Endpoint:

```text
/api/chat
```

Request body:

```json
{
  "message": "Explain what this project does",
  "sessionId": "session_abc123..."
}
```

Request fields:

| Field     | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| message   | string | Yes      | User prompt text                       |
| sessionId | string | Yes      | Session identifier for context/history |

Success response (200):

```json
{
  "response": "This project is a context-aware chatbot..."
}
```

Validation error (400):

```json
{
  "error": "Missing message or sessionId"
}
```

Server/config errors (500):

```json
{
  "error": "Internal Server Error"
}
```

Possible causes include missing GEMINI_API_KEY, MongoDB connectivity issues, or runtime failures.

## Data Model

Collection: chats

Document shape:

```json
{
  "sessionId": "session_...",
  "messages": [
    {
      "role": "user | model",
      "parts": [{ "text": "message text" }]
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Notes:

- sessionId is unique and indexed.
- The UI reads/writes role/content format, while DB persists Gemini-style parts.

## How Session Flow Works

1. page.tsx loads or creates chatSessionId in localStorage.
2. ChatInterface fetches GET /api/chat?sessionId=... to load history.
3. User sends a message via POST /api/chat.
4. API sends full session history + new prompt to Gemini.
5. API appends user/model messages to MongoDB.
6. New Chat creates a fresh sessionId without deleting old sessions.

## Manual API Testing (Postman)

1. Start app: npm run dev
2. Send GET http://localhost:3000/api/chat to verify sessions list.
3. Send POST http://localhost:3000/api/chat with JSON body.
4. Send GET http://localhost:3000/api/chat?sessionId=... to verify persisted history.

Required header for POST:

```text
Content-Type: application/json
```

## Troubleshooting

### MongoDB SRV DNS error (querySrv ECONNREFUSED)

If mongodb+srv fails in Node runtime but Compass works, use one of these:

- Use a non-SRV mongodb URI with explicit hosts and replicaSet.
- Change local DNS resolver (for example 8.8.8.8 or 1.1.1.1) and flush DNS.
- Restart terminal and dev server after env changes.

### Environment changes not applied

- Stop and restart Next.js after editing .env.local.

### Missing history in UI

- Confirm sessionId in localStorage matches one in GET /api/chat.
- Confirm GET /api/chat?sessionId=... returns messages.

## Available Scripts

```bash
npm run dev      # start development server
npm run build    # production build
npm run start    # run production server
npm run lint     # run ESLint
```

## Security Notes

- Never commit .env.local.
- Rotate API keys immediately if exposed.
- Restrict MongoDB network access and database user permissions.
