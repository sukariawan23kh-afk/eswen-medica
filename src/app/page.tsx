import { Navbar } from "@/components/eswen/navbar";
import { HeroSection } from "@/components/eswen/hero-section";
import { ServicesSection } from "@/components/eswen/services-section";
import { PromoSection } from "@/components/eswen/promo-section";
import { SmartBookingSection } from "@/components/eswen/smart-booking-section";
import { PatientJourneySection } from "@/components/eswen/patient-journey-section";
import { DoctorsSection } from "@/components/eswen/doctors-section";
import { AboutSection, WhyChooseUsSection } from "@/components/eswen/about-section";
import { BlogSection } from "@/components/eswen/blog-section";
import { PartnersSection } from "@/components/eswen/partners-section";
import { LocationSection } from "@/components/eswen/location-section";
import { Footer } from "@/components/eswen/footer";
import { AIAssistant } from "@/components/eswen/ai-assistant";
import { WhatsAppButton } from "@/components/eswen/whatsapp-button";
import { BookingDialog } from "@/components/eswen/booking-dialog";
import { AdminPanel } from "@/components/eswen/admin-panel";
import { OfferPopup } from "@/components/eswen/offer-popup";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ServicesSection />
        <PromoSection />
        <SmartBookingSection />
        <PatientJourneySection />
        <DoctorsSection />
        <AboutSection />
        <WhyChooseUsSection />
        <BlogSection />
        <PartnersSection />
        <LocationSection />
      </main>
      <Footer />
      <AIAssistant />
      <WhatsAppButton />
      <BookingDialog />
      <AdminPanel />
      <OfferPopup />
    </div>
  );
}
