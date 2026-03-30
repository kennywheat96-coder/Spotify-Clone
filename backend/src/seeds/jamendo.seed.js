import "./loadEnv.js";
import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;
const BASE_URL = "https://api.jamendo.com/v3.0";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
};

const fetchTracks = async (genre, limit = 100) => {
  const url = `${BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&tags=${genre}&include=musicinfo&imagesize=500&audioformat=mp32`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
};

const fetchAlbums = async (genre, limit = 20) => {
  const url = `${BASE_URL}/albums/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&tags=${genre}&imagesize=500`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
};

const seedSongs = async () => {
  await connectDB();

  // NO delete — keeps your existing songs!
  console.log("Adding new songs without deleting existing ones...");

  const genres = [
    "jazz", "bossa-nova", "gospel", "swing", "blues",
    "trap", "dubstep", "house", "techno", "drum-and-bass",
    "flamenco", "celtic", "afrobeat", "salsa", "cumbia",
    "synthwave", "chillout", "new-age", "world", "ska"
  ];

  let totalSongs = 0;
  let totalAlbums = 0;

  for (const genre of genres) {
    console.log(`Fetching ${genre} tracks...`);

    try {
      const tracks = await fetchTracks(genre, 100);

      for (const track of tracks) {
        if (!track.audio) continue;

        const existingSong = await Song.findOne({
          title: track.name,
          artist: track.artist_name,
        });
        if (existingSong) continue;

        await Song.create({
          title: track.name,
          artist: track.artist_name,
          imageUrl: track.album_image || track.image,
          audioUrl: track.audio,
          duration: track.duration,
          albumId: null,
        });

        totalSongs++;
      }

      const albums = await fetchAlbums(genre, 20);

      for (const album of albums) {
        const existingAlbum = await Album.findOne({
          title: album.name,
          artist: album.artist_name,
        });
        if (existingAlbum) continue;

        const albumTracksUrl = `${BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&album_id=${album.id}&audioformat=mp32`;
        const tracksRes = await fetch(albumTracksUrl);
        const tracksData = await tracksRes.json();
        const albumTracks = tracksData.results || [];

        const songIds = [];

        for (const track of albumTracks) {
          if (!track.audio) continue;

          const song = await Song.create({
            title: track.name,
            artist: track.artist_name,
            imageUrl: album.image,
            audioUrl: track.audio,
            duration: track.duration,
            albumId: null,
          });

          songIds.push(song._id);
          totalSongs++;
        }

        if (songIds.length > 0) {
          const newAlbum = await Album.create({
            title: album.name,
            artist: album.artist_name,
            imageUrl: album.image,
            releaseYear: album.releasedate
              ? new Date(album.releasedate).getFullYear()
              : new Date().getFullYear(),
            songs: songIds,
          });

          await Song.updateMany(
            { _id: { $in: songIds } },
            { albumId: newAlbum._id }
          );

          totalAlbums++;
        }
      }

      console.log(`✅ ${genre}: done`);
      await new Promise((r) => setTimeout(r, 1000));

    } catch (err) {
      console.error(`❌ Error fetching ${genre}:`, err.message);
    }
  }

  console.log(`\n🎵 Seeding complete!`);
  console.log(`✅ ${totalSongs} new songs added`);
  console.log(`✅ ${totalAlbums} new albums added`);

  mongoose.disconnect();
};

seedSongs();