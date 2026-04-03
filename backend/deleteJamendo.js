import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Song } from "./src/models/song.model.js";

const deleteJamendoSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Song.deleteMany({
      audioUrl: { $regex: "jamendo", $options: "i" },
    });

    console.log(`✅ Deleted ${result.deletedCount} Jamendo songs`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

deleteJamendoSongs();