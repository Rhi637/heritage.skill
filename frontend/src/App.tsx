import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import AvatarSelectPage from './pages/AvatarSelectPage';
import MuseumPage from './pages/MuseumPage';
import CraftPage from './pages/CraftPage';
import LearningPage from './pages/LearningPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/avatar" element={<AvatarSelectPage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/craft/:craftId" element={<CraftPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
