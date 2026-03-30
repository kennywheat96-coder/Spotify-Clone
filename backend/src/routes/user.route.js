import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages, saveMascot, getMascot } from "../controller/user.controller.js";
import {
  getLikedSongs,
  likeSong,
  unlikeSong,
} from "../controller/liked.controller.js";
import {
  getRecentlyPlayed,
  addRecentlyPlayed,
} from "../controller/recentlyPlayed.controller.js";
import { getRecommendations } from "../controller/recommendations.controller.js";

const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/liked-songs", protectRoute, getLikedSongs);
router.post("/liked-songs/:songId", protectRoute, likeSong);
router.delete("/liked-songs/:songId", protectRoute, unlikeSong);
router.get("/recently-played", protectRoute, getRecentlyPlayed);
router.post("/recently-played/:songId", protectRoute, addRecentlyPlayed);
router.get("/recommendations", protectRoute, getRecommendations);
router.post("/mascot", protectRoute, saveMascot);
router.get("/mascot", protectRoute, getMascot);

export default router;