"use client";

import { useEffect, useState } from "react";
import { Menu, CalendarHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/i18n";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { navLinks } from "@/lib/eswen/data";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const { lang, setLang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
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
            className="flex items-center gap-2.5 group"
            aria-label="Eswen Medica home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-white border-2 border-eswen-soft-purple" />
            </span>
            <span className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-base tracking-tight text-eswen-deep">
                ESWEN <span className="text-eswen-soft-purple">MEDICA</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground font-medium uppercase mt-0.5 hidden sm:block">
                {t("nav_tagline")}
              </span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-3.5 py-2 text-sm font-medium text-foreground/80 hover:text-eswen-deep hover:bg-eswen-light-lavender/60 rounded-full transition-all"
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
                    <SheetTitle className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="font-extrabold text-eswen-deep">ESWEN MEDICA</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col p-4 gap-1">
                    {navLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => handleNav(link.href)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:text-eswen-deep hover:bg-eswen-light-lavender/60 rounded-2xl transition-all"
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
