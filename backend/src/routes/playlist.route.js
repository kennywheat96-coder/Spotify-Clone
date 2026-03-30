import { Router } from "express";
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../controller/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getUserPlaylists);
router.get("/:id", protectRoute, getPlaylistById);
router.post("/", protectRoute, createPlaylist);
router.put("/:id", protectRoute, updatePlaylist);
router.delete("/:id", protectRoute, deletePlaylist);
router.post("/:id/songs", protectRoute, addSongToPlaylist);
router.delete("/:id/songs", protectRoute, removeSongFromPlaylist);

export default router;