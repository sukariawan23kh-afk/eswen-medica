"use client";

import { useEffect, useState } from "react";
import { Menu, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { useApotekOverlay } from "@/lib/eswen/apotek-overlay-store";
import { BrandLogo } from "@/components/eswen/brand-logo";
import { navLinks } from "@/lib/eswen/data";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const { lang, setLang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();
  const { openStore: openApotekStore } = useApotekOverlay();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    // "Apotek" is now an e-commerce overlay, not a page section — open the
    // overlay instead of scrolling to a section anchor.
    if (href === "#apotek") {
      openApotekStore();
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "glass-eswen shadow-eswen-soft py-2.5" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNav("#home")}
            className="group"
            aria-label="Eswen Medica home"
          >
            <BrandLogo />
          </button>

          {/* Desktop Nav — compact + prominent hover */}
          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-2.5 py-1.5 text-xs font-semibold text-foreground/50 hover:text-white hover:bg-eswen-deep rounded-full transition-all duration-200 whitespace-nowrap"
              >
                {t(link.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switcher — toggles the global language store */}
            <div className="hidden sm:flex items-center rounded-full border border-eswen-lavender bg-white/60 p-0.5 text-xs font-semibold">
              {(["en", "id"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2.5 py-1 rounded-full transition-all uppercase",
                    lang === l
                      ? "bg-eswen-deep text-white shadow-sm"
                      : "text-muted-foreground hover:text-eswen-deep"
                  )}
                  aria-pressed={lang === l}
                  aria-label={`Switch language to ${l === "en" ? "English" : "Indonesian"}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button
              onClick={() => openDialog()}
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-0.5 transition-all px-5 text-sm h-10"
            >
              <CalendarHeart className="h-4 w-4" />
              {t("nav_book")}
            </Button>

            {/* Mobile hamburger — gated behind `mounted` to avoid Radix ID hydration mismatch */}
            {mounted ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full h-10 w-10 border border-eswen-lavender bg-white/70"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5 text-eswen-deep" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 bg-eswen-gradient-soft">
                  <SheetHeader className="p-6 pb-4 border-b border-eswen-lavender/60">
                    <SheetTitle asChild>
                      <div><BrandLogo size="sm" /></div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col p-4 gap-1">
                    {navLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => handleNav(link.href)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground/50 hover:text-white hover:bg-eswen-deep rounded-2xl transition-all duration-200"
                      >
                        {t(link.labelKey as Parameters<typeof t>[0])}
                      </button>
                    ))}
                    <div className="mt-4 flex items-center justify-between px-4">
                      <span className="text-xs font-semibold text-muted-foreground">Language</span>
                      <div className="flex items-center rounded-full border border-eswen-lavender bg-white/60 p-0.5 text-xs font-semibold">
                        {(["en", "id"] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={cn(
                              "px-2.5 py-1 rounded-full transition-all uppercase",
                              lang === l ? "bg-eswen-deep text-white" : "text-muted-foreground"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openDialog()}
                      className="mt-4 w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-11"
                    >
                      <CalendarHeart className="h-4 w-4" />
                      {t("nav_book")}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            ) : (
              // Static placeholder matching server render (no Radix IDs) to prevent hydration mismatch
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full h-10 w-10 border border-eswen-lavender bg-white/70"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-eswen-deep" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
