import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import PlaylistPage from "./pages/Playlist/PlaylistPage";
import LikedSongsPage from "./pages/liked/LikedSongsPage";
import LibraryPage from "./pages/library/LibraryPage";
import SearchPage from "./pages/search/SearchPage";
import ArtistPage from "./pages/artist/ArtistPage";
import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";
import { PageTransition } from "./components/PageTransition";
import AudioPlayer from "./layout/components/AudioPlayer";

function App() {
  const location = useLocation();

  return (
    <>
      <AudioPlayer />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path='/sso-callback'
            element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
          />
          <Route path='/auth-callback' element={<AuthCallbackPage />} />
          <Route path='/admin' element={<AdminPage />} />

          <Route element={<MainLayout />}>
            <Route path='/' element={<PageTransition><HomePage /></PageTransition>} />
            <Route path='/chat' element={<PageTransition><ChatPage /></PageTransition>} />
            <Route path='/albums/:albumId' element={<PageTransition><AlbumPage /></PageTransition>} />
            <Route path='/artists/:artistName' element={<PageTransition><ArtistPage /></PageTransition>} />
            <Route path='/playlists/:playlistId' element={<PageTransition><PlaylistPage /></PageTransition>} />
            <Route path='/liked' element={<PageTransition><LikedSongsPage /></PageTransition>} />
            <Route path='/library' element={<PageTransition><LibraryPage /></PageTransition>} />
            <Route path='/search' element={<PageTransition><SearchPage /></PageTransition>} />
            <Route path='*' element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster />
    </>
  );
}

export default App;