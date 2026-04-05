import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.auth().userId;
    console.log("🔍 Recommendations - userId:", userId);

    const user = await User.findOne({ clerkId: userId })
      .populate("recentlyPlayed.song")
      .populate("likedSongs");

    console.log("👤 User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("⚠️ No user found, returning random songs");
      const songs = await Song.aggregate([{ $sample: { size: 10 } }]);
      return res.json(songs);
    }

    const recentSongs = user.recentlyPlayed.map((e) => e.song).filter(Boolean);
    const likedSongs = user.likedSongs.filter(Boolean);
    const allListened = [...recentSongs, ...likedSongs];

    const artistCount = {};
    allListened.forEach((song) => {
      artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;
    });

    const topArtists = Object.entries(artistCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([artist]) => artist);

    const heardIds = allListened.map((s) => s._id);

    let recommendations = [];

    if (topArtists.length > 0) {
      const allMatches = await Song.find({
        artist: { $in: topArtists },
        _id: { $nin: heardIds },
      });

      // Max 2 songs per artist for diversity
      const artistCounts = {};
      recommendations = allMatches.filter((song) => {
        artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1;
        return artistCounts[song.artist] <= 2;
      }).slice(0, 10);
    }

    if (recommendations.length < 10) {
      const extra = await Song.aggregate([
        {
          $match: {
            _id: {
              $nin: [
                ...heardIds,
                ...recommendations.map((s) => s._id),
              ],
            },
          },
        },
        { $sample: { size: 10 - recommendations.length } },
      ]);
      recommendations = [...recommendations, ...extra];
    }

    res.json(recommendations);
  } catch (error) {
    console.log("❌ Recommendations error:", error.message);
    next(error);
  }
};