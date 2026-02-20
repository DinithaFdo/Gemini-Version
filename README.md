# Gemini Chat - Context-Aware AI Assistant

A production-ready chatbot built with Next.js, Google Gemini 2.5 Flash, and MongoDB. Features persistent conversation memory that maintains context across sessions.

## Features

- **Context-Aware Conversations**: Every exchange reinforces the model's situational awareness
- **Persistent Memory**: Conversations are stored in MongoDB for session continuity
- **Modern UI**: Clean, responsive chat interface with Tailwind CSS
- **Session Management**: Automatic session tracking with "New Chat" functionality
- **Real-time Feedback**: Loading states and smooth auto-scrolling

## Tech Stack

- **Frontend**: Next.js 16+, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini 2.5 Flash

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- Google Gemini API key

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatdb
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # Chat API endpoint
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with session management
│   └── globals.css         # Global styles
├── components/
│   └── ChatInterface.tsx   # Chat UI component
└── models/
    └── Chat.ts             # Mongoose schema
```

## API Reference

### POST /api/chat

Send a message and receive an AI response.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "sessionId": "session_abc123"
}
```

**Response:**

```json
{
  "response": "Hello! I'm doing well, thank you for asking..."
}
```

## Environment Variables

| Variable         | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| `MONGODB_URI`    | MongoDB connection string                                                      |
| `GEMINI_API_KEY` | Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey) |

## License

MIT
