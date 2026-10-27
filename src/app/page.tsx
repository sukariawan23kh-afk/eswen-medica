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
import { ApotekSection } from "@/components/eswen/apotek-section";
import { ApotekOverlayProvider } from "@/components/eswen/apotek-overlay-provider";
import { LocationSection } from "@/components/eswen/location-section";
import { Footer } from "@/components/eswen/footer";
import { AIAssistant } from "@/components/eswen/ai-assistant";
import { WhatsAppButton } from "@/components/eswen/whatsapp-button";
import { BookingDialog } from "@/components/eswen/booking-dialog";
import { AdminPanel } from "@/components/eswen/admin-panel";
import { OfferPopup } from "@/components/eswen/offer-popup";
import { FaviconUpdater } from "@/components/eswen/favicon-updater";

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
        <ApotekSection />
        <LocationSection />
      </main>
      <Footer />
      <AIAssistant />
      <WhatsAppButton />
      <BookingDialog />
      <AdminPanel />
      <OfferPopup />
      <FaviconUpdater />
      {/* Apotek e-commerce overlay — opened from the navbar "Apotek" link
          OR the ApotekSection "Lihat Semua Produk" button via the global
          apotek-overlay store. Rendered at the page root so the overlay
          mounts once and works regardless of which caller opened it. */}
      <ApotekOverlayProvider />
    </div>
  );
}
