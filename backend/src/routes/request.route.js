import { Router } from "express";
import {
  createRequest,
  getAllRequests,
  updateRequestStatus,
  deleteRequest,
  getMyRequests,
} from "../controller/request.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protectRoute, createRequest);
router.get("/my", protectRoute, getMyRequests);
router.get("/", protectRoute, (req, res, next) => {
  console.log("GET /requests - auth:", req.auth());
  next();
}, requireAdmin, getAllRequests);
router.put("/:id", protectRoute, requireAdmin, updateRequestStatus);
router.delete("/:id", protectRoute, requireAdmin, deleteRequest);

export default router;