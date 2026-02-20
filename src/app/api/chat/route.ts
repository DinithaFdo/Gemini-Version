import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let cachedConn: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cachedConn) {
    return cachedConn;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cachedConn = await cachedPromise;
  return cachedConn;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      await connectDB();

      const sessionRecords = (await Chat.find(
        {},
        { sessionId: 1, _id: 0, updatedAt: 1 },
      )
        .sort({ updatedAt: -1 })
        .lean()) as unknown as Array<{ sessionId?: string }>;

      return NextResponse.json({
        sessions: sessionRecords
          .map((record) => record.sessionId)
          .filter((id): id is string => Boolean(id)),
      });
    }

    await connectDB();

    const chatRecord = await Chat.findOne({ sessionId });

    if (!chatRecord) {
      return NextResponse.json({ messages: [] });
    }

    const messages = chatRecord.messages.map(
      (message: { role: "user" | "model"; parts: { text: string }[] }) => ({
        role: message.role,
        content: message.parts.map((part) => part.text).join("\n"),
      }),
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat History API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Missing message or sessionId" },
        { status: 400 },
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    await connectDB();

    // Fetch or Create Chat History (Situational Awareness)
    let chatRecord = await Chat.findOne({ sessionId });

    // Format history for Gemini SDK
    const history = chatRecord
      ? chatRecord.messages.map(
          (m: { role: string; parts: { text: string }[] }) => ({
            role: m.role,
            parts: m.parts,
          }),
        )
      : [];

    // Initialize Model and Start Chat
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chatSession = model.startChat({ history });

    // Generate Content
    const result = await chatSession.sendMessage(message);
    const aiResponse = result.response.text();

    // Context Persistence (The "Memory" Write)
    if (!chatRecord) {
      chatRecord = new Chat({
        sessionId,
        messages: [
          { role: "user", parts: [{ text: message }] },
          { role: "model", parts: [{ text: aiResponse }] },
        ],
      });
    } else {
      chatRecord.messages.push(
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: aiResponse }] },
      );
    }

    await chatRecord.save();

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
