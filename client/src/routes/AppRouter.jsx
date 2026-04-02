import GroupInvitePage from '../pages/group/GroupInvitePage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import HostRoute      from './HostRoute.jsx'
import MobileBottomNav from '../components/common/MobileBottomNav.jsx'

// Pages — auth
import LoginPage      from '../pages/auth/LoginPage.jsx'
import SignupPage     from '../pages/auth/SignupPage.jsx'
import GoogleCallback from '../pages/auth/GoogleCallback.jsx'
import LogoutPage     from '../pages/auth/LogoutPage.jsx'

// Pages — discovery
import HomePage             from '../pages/discovery/HomePage.jsx'
import SearchPage           from '../pages/discovery/SearchPage.jsx'
import ExperienceDetailPage from '../pages/discovery/ExperienceDetailPage.jsx'
import HostProfilePage      from '../pages/discovery/HostProfilePage.jsx'
import StoriesPage          from '../pages/discovery/StoriesPage.jsx'
import StoryDetailPage      from '../pages/discovery/StoryDetailPage.jsx'
import PathwayDetailPage    from '../pages/discovery/PathwayDetailPage.jsx'
import AboutPage            from '../pages/discovery/AboutPage.jsx'
import ContactPage          from '../pages/discovery/ContactPage.jsx'
import BecomeHostPage       from '../pages/discovery/BecomeHostPage.jsx'

// Pages — booking
import CheckoutPage      from '../pages/booking/CheckoutPage.jsx'
import BookingConfirmPage from '../pages/booking/BookingConfirmPage.jsx'

// Pages — traveler
import ProfilePage    from '../pages/traveler/ProfilePage.jsx'
import MyBookingsPage from '../pages/traveler/MyBookingsPage.jsx'
import WishlistPage   from '../pages/traveler/WishlistPage.jsx'
import RewardsPage    from '../pages/traveler/RewardsPage.jsx'

// Pages — host
import HostDashboardPage      from '../pages/host/HostDashboardPage.jsx'
import PathwayManagementPage  from '../pages/host/PathwayManagementPage.jsx'
import CreatePathwayPage      from '../pages/host/CreatePathwayPage.jsx'
import HostProfileSetupPage  from '../pages/host/HostProfileSetupPage.jsx'
import CreateExperiencePage  from '../pages/host/CreateExperiencePage.jsx'
import CreateStoryPage       from '../pages/host/CreateStoryPage.jsx'
import EditExperiencePage   from '../pages/host/EditExperiencePage.jsx'
import HostBookingsPage     from '../pages/host/HostBookingsPage.jsx'
import HostReviewsPage      from '../pages/host/HostReviewsPage.jsx'
import HostExperiencesPage  from '../pages/host/HostExperiencesPage.jsx'
import HostLayout           from '../layouts/HostLayout.jsx'

// Pages — pathways
import PathwayBrowsePage  from '../components/PathwayBrowse.jsx'

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* ── Public ── */}
      <Route path="/group/invite/:group_id" element={<GroupInvitePage />} />
      <Route path="/"                        element={<HomePage />} />
      <Route path="/search"                  element={<SearchPage />} />
      <Route path="/stories"                 element={<StoriesPage />} />
      <Route path="/stories/:slug"           element={<StoryDetailPage />} />
      <Route path="/experiences/:id"         element={<ExperienceDetailPage />} />
      <Route path="/hosts/:id"               element={<HostProfilePage />} />
      <Route path="/journeys/:slug"          element={<PathwayDetailPage />} />
      <Route path="/pathways"                element={<PathwayBrowsePage />} />
      <Route path="/pathways/:id"            element={<PathwayDetailPage />} />
      <Route path="/about"                   element={<AboutPage />} />
      <Route path="/contact"                 element={<ContactPage />} />
      <Route path="/become-host"             element={<BecomeHostPage />} />
      <Route path="/login"                   element={<LoginPage />} />
      <Route path="/signup"                    element={<SignupPage />} />
      <Route path="/logout"                  element={<LogoutPage />} />
      <Route path="/auth/google/success"     element={<GoogleCallback />} />


      {/* ── Protected (any logged-in user) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout/:experienceId"  element={<CheckoutPage />} />
        <Route path="/booking/confirm/:id"     element={<BookingConfirmPage />} />
        <Route path="/profile"                 element={<ProfilePage />} />
        <Route path="/my-bookings"             element={<MyBookingsPage />} />
        <Route path="/wishlist"                element={<WishlistPage />} />
        <Route path="/rewards"                 element={<RewardsPage />} />
      </Route>

      {/* ── Host only ── */}
      <Route element={<HostRoute />}>
        <Route element={<HostLayout />}>
          <Route path="/host/dashboard"          element={<HostDashboardPage />} />
          <Route path="/host/pathways"           element={<PathwayManagementPage />} />
          <Route path="/host/pathways/create"    element={<CreatePathwayPage />} />
          <Route path="/host/experiences"        element={<HostExperiencesPage />} />
          <Route path="/host/experiences/create" element={<CreateExperiencePage />} />
          <Route path="/host/stories/create"   element={<CreateStoryPage />} />
          <Route path="/host/experiences/:id/edit" element={<EditExperiencePage />} />
          <Route path="/host/bookings"           element={<HostBookingsPage />} />
          <Route path="/host/reviews"            element={<HostReviewsPage />} />
          <Route path="/host/profile"            element={<ProfilePage hideLayout={true} />} />
          <Route path="/host/setup-profile"      element={<HostProfileSetupPage />} />
        </Route>
      </Route>

      {/* Fallback — redirect unknown paths to home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
    <MobileBottomNav />
  </BrowserRouter>
)

export default AppRouter
