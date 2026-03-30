import { Request } from "../models/request.model.js";

// User submits a request
export const createRequest = async (req, res, next) => {
  try {
    const { artistName, songName, youtubeUrl, albumName, type, notes } = req.body;
    const userId = req.auth().userId;

    const request = new Request({
      artistName,
      songName,
      youtubeUrl,
      albumName,
      type,
      notes,
      requestedBy: userId,
      requestedByName: req.body.requestedByName || "",
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// Admin gets all requests
export const getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// Admin updates request status
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

// Admin deletes a request
export const deleteRequest = async (req, res, next) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (error) {
    next(error);
  }
};

// User gets their own requests
export const getMyRequests = async (req, res, next) => {
  try {
    const userId = req.auth().userId;
    const requests = await Request.find({ requestedBy: userId })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};