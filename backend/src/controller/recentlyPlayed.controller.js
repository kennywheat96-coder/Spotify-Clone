import { User } from "../models/user.model.js";

export const getRecentlyPlayed = async (req, res, next) => {
  try {
    const userId = req.auth().userId;
    console.log("🔍 Recently Played - userId:", userId);

    const user = await User.findOne({ clerkId: userId })
      .populate("recentlyPlayed.song");

    console.log("👤 User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("⚠️ No user found, returning empty array");
      return res.json([]);
    }

    const songs = user.recentlyPlayed
      .sort((a, b) => b.playedAt - a.playedAt)
      .slice(0, 20)
      .map((entry) => entry.song);

    res.json(songs);
  } catch (error) {
    console.log("❌ Recently played error:", error.message);
    next(error);
  }
};

export const addRecentlyPlayed = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const userId = req.auth().userId;
    console.log("➕ Adding recently played - userId:", userId, "songId:", songId);

    await User.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { recentlyPlayed: { song: songId } } }
    );

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $push: {
          recentlyPlayed: {
            $each: [{ song: songId, playedAt: new Date() }],
            $slice: -20,
          },
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.log("❌ Add recently played error:", error.message);
    next(error);
  }
};