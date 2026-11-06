import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ThemeSync from '@/components/common/ThemeSync'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'


// Keep the shell and home route in the first bundle. The rest of the app is
// loaded only when the user visits it, which substantially improves first
// load on slower phones and serverless deployments.
const HomePage = lazy(() => import('@/pages/Home/HomePage'))
const ExplorePage = lazy(() => import('@/pages/Explore/ExplorePage'))
const ShowDetailsPage = lazy(() => import('@/pages/ShowDetails/ShowDetailsPage'))
const SeasonDetailsPage = lazy(() => import('@/pages/SeasonDetails/SeasonDetailsPage'))
const EpisodeDetailsPage = lazy(() => import('@/pages/EpisodeDetails/EpisodeDetailsPage'))
const WatchPage = lazy(() => import('@/pages/Watch/WatchPage'))
const WatchlistPage = lazy(() => import('@/pages/Watchlist/WatchlistPage'))
const CollectionsPage = lazy(() => import('@/pages/Collections/CollectionsPage'))
const CollectionDetailPage = lazy(() => import('@/pages/Collections/CollectionDetailPage'))
const HistoryPage = lazy(() => import('@/pages/History/HistoryPage'))
const PersonPage = lazy(() => import('@/pages/People/PersonPage'))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/Auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
            <Suspense fallback={<div className="min-h-[60vh] bg-bg-primary" aria-label="Loading" />}>
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
            </Suspense>
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
