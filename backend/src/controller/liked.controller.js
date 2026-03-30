import { User } from "../models/user.model.js";

export const getLikedSongs = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.auth().userId })
      .populate("likedSongs");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.likedSongs.reverse());
  } catch (error) {
    next(error);
  }
};

export const likeSong = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth().userId },
      { $addToSet: { likedSongs: songId } },
      { new: true }
    ).populate("likedSongs");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.likedSongs);
  } catch (error) {
    next(error);
  }
};

export const unlikeSong = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth().userId },
      { $pull: { likedSongs: songId } },
      { new: true }
    ).populate("likedSongs");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.likedSongs);
  } catch (error) {
    next(error);
  }
};

export const checkLiked = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const user = await User.findOne({ clerkId: req.auth().userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isLiked = user.likedSongs.includes(songId);
    res.json({ isLiked });
  } catch (error) {
    next(error);
  }
};