import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/context/GameContext";
import { EkgStrip } from "@/components/EkgStrip";
import { TopBar } from "@/components/TopBar";
import Index from "./pages/Index.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import RoomTimerPage from "./pages/RoomTimerPage.tsx";
import ScoreboardPage from "./pages/ScoreboardPage.tsx";
import BossVitalsPage from "./pages/BossVitalsPage.tsx";
import BossFilesPage from "./pages/BossFilesPage.tsx";
import IntelligenceRoomPage from "./pages/IntelligenceRoomPage.tsx";
import VolunteerPage from "./pages/VolunteerPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="scanlines animate-flicker">
            <EkgStrip />
            <TopBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/room/:roomId" element={<RoomTimerPage />} />
              <Route path="/scoreboard" element={<ScoreboardPage />} />
              <Route path="/boss/vitals" element={<BossVitalsPage />} />
              <Route path="/boss/files" element={<BossFilesPage />} />
              <Route path="/intelligence" element={<IntelligenceRoomPage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
