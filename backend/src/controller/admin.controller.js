import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.log("Error in uploadToCloudinary", error);
    throw new Error("Error uploading to cloudinary");
  }
};

export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({ message: "Please upload all files" });
    }

    const { title, artist, albumId, duration } = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration,
      albumId: albumId || null,
    });

    await song.save();

    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }

    res.status(201).json(song);
  } catch (error) {
    console.log("Error in createSong", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id);

    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
    }

    await Song.findByIdAndDelete(id);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.log("Error in deleteSong", error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = new Album({
      title,
      artist,
      imageUrl,
      releaseYear,
    });

    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.log("Error in createAlbum", error);
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);
    res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAlbum", error);
    next(error);
  }
};

export const addSongsToAlbum = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const { songIds } = req.body;

    const album = await Album.findByIdAndUpdate(
      albumId,
      { $addToSet: { songs: { $each: songIds } } },
      { new: true }
    ).populate("songs");

    await Song.updateMany(
      { _id: { $in: songIds } },
      { albumId: albumId }
    );

    res.json(album);
  } catch (error) {
    console.log("Error in addSongsToAlbum", error);
    next(error);
  }
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};
export const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, albumId } = req.body;

    let imageUrl;
    let audioUrl;

    if (req.files?.imageFile) {
      const imageFile = req.files.imageFile;
      const uploadedImage = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        resource_type: "image",
      });
      imageUrl = uploadedImage.secure_url;
    }

    if (req.files?.audioFile) {
      const audioFile = req.files.audioFile;
      const uploadedAudio = await cloudinary.uploader.upload(audioFile.tempFilePath, {
        resource_type: "video",
      });
      audioUrl = uploadedAudio.secure_url;
    }

    const updateData = { title, artist };
    if (albumId !== undefined) updateData.albumId = albumId === "" ? null : albumId;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (audioUrl) updateData.audioUrl = audioUrl;

    const song = await Song.findByIdAndUpdate(id, updateData, { new: true });
    if (!song) return res.status(404).json({ message: "Song not found" });

    res.json(song);
  } catch (error) {
    next(error);
  }
};

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, releaseYear } = req.body;

    let imageUrl;

    if (req.files?.imageFile) {
      const imageFile = req.files.imageFile;
      const uploadedImage = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        resource_type: "image",
      });
      imageUrl = uploadedImage.secure_url;
    }

    const updateData = { title, artist, releaseYear: parseInt(releaseYear) };
    if (imageUrl) updateData.imageUrl = imageUrl;

    const album = await Album.findByIdAndUpdate(id, updateData, { new: true });
    if (!album) return res.status(404).json({ message: "Album not found" });

    res.json(album);
  } catch (error) {
    next(error);
  }
};
