import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import HostRoute      from './HostRoute.jsx'

// Pages — auth
import LoginPage      from '../pages/auth/LoginPage.jsx'
import SignupPage     from '../pages/auth/SignupPage.jsx'
import GoogleCallback from '../pages/auth/GoogleCallback.jsx'

// Pages — discovery
import HomePage             from '../pages/discovery/HomePage.jsx'
import SearchPage           from '../pages/discovery/SearchPage.jsx'
import ExperienceDetailPage from '../pages/discovery/ExperienceDetailPage.jsx'

// Pages — booking
import CheckoutPage      from '../pages/booking/CheckoutPage.jsx'
import BookingConfirmPage from '../pages/booking/BookingConfirmPage.jsx'

// Pages — traveler
import ProfilePage    from '../pages/traveler/ProfilePage.jsx'
import MyBookingsPage from '../pages/traveler/MyBookingsPage.jsx'

// Pages — host
import HostDashboardPage    from '../pages/host/HostDashboardPage.jsx'
import CreateExperiencePage from '../pages/host/CreateExperiencePage.jsx'
import EditExperiencePage   from '../pages/host/EditExperiencePage.jsx'
import HostBookingsPage     from '../pages/host/HostBookingsPage.jsx'
import HostReviewsPage      from '../pages/host/HostReviewsPage.jsx'

// Pages — itinerary
import MyItinerariesPage   from '../pages/itinerary/MyItinerariesPage.jsx'
import ItineraryDetailPage from '../pages/itinerary/ItineraryDetailPage.jsx'
import SharedItineraryPage from '../pages/itinerary/SharedItineraryPage.jsx'

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* ── Public ── */}
      <Route path="/"                        element={<HomePage />} />
      <Route path="/search"                  element={<SearchPage />} />
      <Route path="/experiences/:id"         element={<ExperienceDetailPage />} />
      <Route path="/login"                   element={<LoginPage />} />
      <Route path="/signup"                  element={<SignupPage />} />
      <Route path="/auth/google/success"     element={<GoogleCallback />} />
      <Route path="/itineraries/shared/:token" element={<SharedItineraryPage />} />

      {/* ── Protected (any logged-in user) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout/:experienceId"  element={<CheckoutPage />} />
        <Route path="/booking/confirm/:id"     element={<BookingConfirmPage />} />
        <Route path="/profile"                 element={<ProfilePage />} />
        <Route path="/my-bookings"             element={<MyBookingsPage />} />
        <Route path="/my-itineraries"          element={<MyItinerariesPage />} />
        <Route path="/itineraries/:id"         element={<ItineraryDetailPage />} />
      </Route>

      {/* ── Host only ── */}
      <Route element={<HostRoute />}>
        <Route path="/host/dashboard"          element={<HostDashboardPage />} />
        <Route path="/host/experiences/create" element={<CreateExperiencePage />} />
        <Route path="/host/experiences/:id/edit" element={<EditExperiencePage />} />
        <Route path="/host/bookings"           element={<HostBookingsPage />} />
        <Route path="/host/reviews"            element={<HostReviewsPage />} />
      </Route>

      {/* Fallback — redirect unknown paths to home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
)

export default AppRouter