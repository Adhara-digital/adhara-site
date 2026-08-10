import { useReveal } from "./scroll-fade-animation.js";
import AnimatedSpaceBackground from "./components/AnimatedSpaceBackground.jsx";
import ScrollProgressBar from "./components/ScrollProgressBar.jsx";
import HeaderBar from "./components/HeaderBar.jsx";
import WelcomeBanner from "./components/WelcomeBanner.jsx";
import ServicesSection from "./components/ServicesSection.jsx";
import AppsSection from "./components/AppsSection.jsx";
import WhyChooseUsSection from "./components/WhyChooseUsSection.jsx";
import KeyNumbersSection from "./components/KeyNumbersSection.jsx";
import AboutUsSection from "./components/AboutUsSection.jsx";
import ContactFormSection from "./components/ContactFormSection.jsx";
import FooterBar from "./components/FooterBar.jsx";
import "./website-styles.css";

export default function Website() {
  useReveal();
  return (
    <>
      <AnimatedSpaceBackground />
      <div className="bg-aura" aria-hidden="true" />
      <div className="bg-dim" aria-hidden="true" />
      <ScrollProgressBar />
      <HeaderBar />
      <main>
        <WelcomeBanner />
        <ServicesSection />
        <AppsSection />
        <WhyChooseUsSection />
        <KeyNumbersSection />
        <AboutUsSection />
        <ContactFormSection />
      </main>
      <FooterBar />
    </>
  );
}
