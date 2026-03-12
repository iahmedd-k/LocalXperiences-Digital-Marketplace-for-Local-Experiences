import Footer from "../../components/common/Footer.jsx";
import HeroSection from "../../components/common/HeroSection.jsx";
import NearYouSection from "../../components/common/NearYouSection.jsx";
import TrendingSection from "../../components/common/TrendingSection.jsx";

import AIRecommendationsSection from "../../components/common/AIRecommendationsSection.jsx";
import BecomeAHostSection from "../../components/common/BecomeAHostSection.jsx";
import TestimonialsSection from "../../components/common/TestimonialsSection.jsx";
import HowItWorksSection from "../../components/common/HowItWorksSection.jsx";

export default function HomePage() {
  return (
    <>
      <HeroSection />              
<NearYouSection />         
<TrendingSection />         
<AIRecommendationsSection />
<HowItWorksSection />        
<BecomeAHostSection />       
<TestimonialsSection />      
<Footer />
    </>
  );
}
