import { Playlist } from "../models/playlist.model.js";

export const getUserPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ owner: req.auth().userId })
      .populate("songs")
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const playlist = new Playlist({
      name,
      description,
      owner: req.auth().userId,
      songs: [],
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, owner: req.auth().userId },
      { name, description },
      { new: true }
    ).populate("songs");

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      owner: req.auth().userId,
    });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    next(error);
  }
};

export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, owner: req.auth().userId },
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate("songs");

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, owner: req.auth().userId },
      { $pull: { songs: songId } },
      { new: true }
    ).populate("songs");

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};