"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatInterfaceProps {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!sessionId) return;

      setIsHistoryLoading(true);
      try {
        const res = await fetch(
          `/api/chat?sessionId=${encodeURIComponent(sessionId)}`,
        );
        const data = await res.json();

        if (isMounted) {
          if (data.error) {
            console.error("History API Error:", data.error);
            setMessages([]);
          } else {
            setMessages(data.messages ?? []);
          }
        }
      } catch (err) {
        console.error("Failed to load history:", err);
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId }),
      });
      const data = await res.json();

      if (data.error) {
        console.error("API Error:", data.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.response },
        ]);
      }
    } catch (err) {
      console.error("Failed to send:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Failed to connect to the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl border border-slate-200 rounded-xl bg-white shadow-sm">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isHistoryLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Loading chat history...
          </div>
        )}
        {messages.length === 0 && !isHistoryLoading && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Start a conversation with Gemini...
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-100 text-slate-800 rounded-tl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none animate-pulse text-xs text-slate-500">
              Gemini is thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-slate-100 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
