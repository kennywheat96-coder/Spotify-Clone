import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth().userId;
    const users = await User.find({ clerkId: { $ne: currentUserId } });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.auth().userId;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: myId },
        { senderId: myId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const saveMascot = async (req, res, next) => {
  try {
    const { mascot } = req.body;
    const user = await User.findOneAndUpdate(
      { clerkId: req.auth().userId },
      { mascot },
      { new: true }
    );
    res.json({ mascot: user.mascot });
  } catch (error) {
    next(error);
  }
};

export const getMascot = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.auth().userId });
    res.json({ mascot: user?.mascot || null });
  } catch (error) {
    next(error);
  }
};