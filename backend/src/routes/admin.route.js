import { Router } from "express";
import {
  createSong,
  deleteSong,
  updateSong,
  createAlbum,
  deleteAlbum,
  updateAlbum,
  addSongsToAlbum,
  renameArtist,
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", (req, res) => res.status(200).json({ admin: true }));

router.post("/songs", createSong);
router.put("/songs/:id", updateSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.put("/albums/:id", updateAlbum);
router.delete("/albums/:id", deleteAlbum);
router.post("/albums/:albumId/songs", addSongsToAlbum);

router.post("/artists/rename", renameArtist);

export default router;