import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    owner: { type: String, required: true }, // Clerk user ID
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);