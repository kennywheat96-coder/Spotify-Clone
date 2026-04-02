import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  const auth = req.auth();
  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized - you must be logged in" });
  }
  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    const auth = req.auth();
    const currentUser = await clerkClient.users.getUser(auth.userId);
    const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

    if (!isAdmin) {
      return res.status(403).json({ message: "Unauthorized - you must be an admin" });
    }

    next();
  } catch (error) {
    console.error("requireAdmin error:", error.message);
    next(error);
  }
};