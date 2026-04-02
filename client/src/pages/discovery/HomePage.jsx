import Footer from "../../components/Footer.jsx";
import Navbar from "../../components/Navbar.jsx";
import HeroSection from "../../components/HeroSection.jsx";
import NearYouSection from "../../components/NearYouSection.jsx";
import PickedForYouSection from "../../components/PickedForYouSection.jsx";
import TrendingSection from "../../components/TrendingSection.jsx";
import CitiesSection from "../../components/CitiesSection.jsx";
import CategoriesSection from "../../components/CategoriesSection.jsx";
import BecomeAHostSection from "../../components/BecomeAHostSection.jsx";
import TestimonialsSection from "../../components/TestimonialsSection.jsx";
import HowItWorksSection from "../../components/HowItWorksSection.jsx";
import SuggestedJourneysSection from "../../components/SuggestedJourneysSection.jsx";
import QuickExperiencesSection from "../../components/QuickExperiencesSection.jsx";
import { useSelector } from "react-redux";

export default function HomePage() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <NearYouSection />
      {isAuthenticated && (
        <PickedForYouSection />
      )}
      <SuggestedJourneysSection />
        <TrendingSection />
      <QuickExperiencesSection />
    
      <CitiesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BecomeAHostSection />
      <Footer />
    </div>
  );
}
