"use client";
import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";

function generateSessionId(): string {
  return (
    "session_" +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<string[]>([]);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (!data.error && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  useEffect(() => {
    // Check for existing session in localStorage or create new one
    const existingSession = localStorage.getItem("chatSessionId");
    if (existingSession) {
      setSessionId(existingSession);
    } else {
      const newSession = generateSessionId();
      localStorage.setItem("chatSessionId", newSession);
      setSessionId(newSession);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setSessions((prev) => {
      if (prev.includes(sessionId)) return prev;
      return [sessionId, ...prev];
    });
  }, [sessionId]);

  const startNewSession = () => {
    const newSession = generateSessionId();
    localStorage.setItem("chatSessionId", newSession);
    setSessionId(newSession);
    setSessions((prev) => [
      newSession,
      ...prev.filter((id) => id !== newSession),
    ]);
  };

  const handleSessionChange = (selectedSession: string) => {
    localStorage.setItem("chatSessionId", selectedSession);
    setSessionId(selectedSession);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gemini Chat</h1>
            <p className="text-sm text-slate-500">Context-aware AI assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sessions.map((id) => (
                <option key={id} value={id}>
                  {id.substring(0, 20)}...
                </option>
              ))}
            </select>
            <button
              onClick={startNewSession}
              className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface sessionId={sessionId} />

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-4">
          Session: {sessionId.substring(0, 20)}...
        </p>
      </div>
    </div>
  );
}
