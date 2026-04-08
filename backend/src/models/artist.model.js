import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Artist = mongoose.model("Artist", artistSchema);