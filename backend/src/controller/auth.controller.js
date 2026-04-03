import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    let user = await User.findOne({ clerkId: id });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        clerkId: id,
        fullName: `${firstName} ${lastName}`,
        imageUrl: imageUrl || "",
      });
    }

    res.status(200).json({ 
      success: true, 
      isNewUser, 
      mascot: user.mascot 
    });
  } catch (error) {
    console.log("Error in auth callback", error);
    next(error);
  }
};