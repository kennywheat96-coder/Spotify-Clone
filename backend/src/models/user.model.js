import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  recentlyPlayed: [
    {
      song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
      playedAt: { type: Date, default: Date.now },
    },
  ],
  mascot: { type: String, default: null },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);