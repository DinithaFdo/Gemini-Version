import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "model"], // Gemini uses 'model' instead of 'assistant'
      required: true,
    },
    parts: [
      {
        text: { type: String, required: true },
      },
    ],
  },
  { _id: false },
);

const ChatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true },
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
