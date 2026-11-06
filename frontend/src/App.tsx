import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ThemeSync from '@/components/common/ThemeSync'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'

import HomePage from '@/pages/Home/HomePage'
import ExplorePage from '@/pages/Explore/ExplorePage'
import ShowDetailsPage from '@/pages/ShowDetails/ShowDetailsPage'
import SeasonDetailsPage from '@/pages/SeasonDetails/SeasonDetailsPage'
import EpisodeDetailsPage from '@/pages/EpisodeDetails/EpisodeDetailsPage'
import WatchPage from '@/pages/Watch/WatchPage'
import WatchlistPage from '@/pages/Watchlist/WatchlistPage'
import CollectionsPage from '@/pages/Collections/CollectionsPage'
import CollectionDetailPage from '@/pages/Collections/CollectionDetailPage'
import HistoryPage from '@/pages/History/HistoryPage'
import PersonPage from '@/pages/People/PersonPage'
import ProfilePage from '@/pages/Profile/ProfilePage'
import SettingsPage from '@/pages/Settings/SettingsPage'
import LoginPage from '@/pages/Auth/LoginPage'
import SignupPage from '@/pages/Auth/SignupPage'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ThemeSync />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/tv/:id" element={<ShowDetailsPage />} />
                <Route path="/tv/:id/season/:season" element={<SeasonDetailsPage />} />
                <Route path="/tv/:id/season/:season/episode/:episode" element={<EpisodeDetailsPage />} />
                <Route path="/watch/tv/:id/:season/:episode" element={<WatchPage />} />
                <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
                <Route path="/collections/:id" element={<ProtectedRoute><CollectionDetailPage /></ProtectedRoute>} />
                <Route path="/people/:id" element={<PersonPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
