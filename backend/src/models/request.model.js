import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  artistName: { type: String, required: true },
  songName: { type: String, required: true },
  youtubeUrl: { type: String, default: "" },
  albumName: { type: String, default: "" },
  type: { type: String, enum: ["single", "album"], default: "single" },
  notes: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending" 
  },
  requestedBy: { type: String, required: true }, // Clerk user ID
  requestedByName: { type: String, default: "" },
}, { timestamps: true });

export const Request = mongoose.model("Request", requestSchema);