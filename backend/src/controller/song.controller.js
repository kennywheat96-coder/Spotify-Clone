import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";

export const getAllSongs = async (req, res, next) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1, albumId: 1, duration: 1 } }
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1, albumId: 1, duration: 1 } }
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const getTopChartsSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1, albumId: 1, duration: 1 } }
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    const songs = await Song.aggregate([
      { $sample: { size: 6 } },
      { $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1, albumId: 1, duration: 1 } }
    ]);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};

export const searchSongs = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.json({ songs: [], artists: [], albums: [] });
    }

    const regex = { $regex: query, $options: "i" };

    const songs = await Song.find({
      $or: [{ title: regex }, { artist: regex }],
    })
      .limit(10)
      .select("_id title artist imageUrl audioUrl albumId duration");

    const artistDocs = await Song.aggregate([
      { $match: { artist: { $regex: query, $options: "i" } } },
      { $group: { _id: "$artist", imageUrl: { $first: "$imageUrl" }, songCount: { $sum: 1 } } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", imageUrl: 1, songCount: 1 } },
    ]);

    // Merge uploaded artist photos if they exist
    const artistNames = artistDocs.map((a) => a.name);
    const uploadedArtists = await Artist.find({ name: { $in: artistNames } });
    const uploadedMap = new Map(uploadedArtists.map((a) => [a.name, a.imageUrl]));

    const artists = artistDocs.map((a) => ({
      ...a,
      imageUrl: uploadedMap.get(a.name) || a.imageUrl,
    }));

    const albums = await Album.find({
      $or: [{ title: regex }, { artist: regex }],
    })
      .limit(5)
      .select("_id title artist imageUrl");

    res.json({ songs, artists, albums });
  } catch (error) {
    next(error);
  }
};