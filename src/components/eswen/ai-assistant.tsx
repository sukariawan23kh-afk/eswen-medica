"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  X,
  CalendarHeart,
  Loader2,
  ShieldAlert,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useLogo } from "@/lib/eswen/site-config-context";
import { tr } from "@/lib/eswen/i18n";
import type { Lang } from "@/lib/eswen/language-store";
import { useBookingDialog } from "@/lib/eswen/booking-store";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    "I have acne and oily skin. What treatment is suitable?",
    "What medical services do you offer in Bali?",
    "I'm an expat — can I book a general check-up?",
    "What payment methods do you accept?",
  ],
  id: [
    "Saya punya jerawat dan kulit berminyak. Perawatan apa yang cocok?",
    "Layanan medis apa yang tersedia di Bali?",
    "Saya ekspat — bisakah saya booking check-up umum?",
    "Metode pembayaran apa saja yang diterima?",
  ],
};

export function AIAssistant() {
  const { lang, setLang } = useLanguage();
  const t = useT();
  const logo = useLogo();
  const { openDialog } = useBookingDialog();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t("ai_welcome") },
  ]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the conversation to a localized welcome when the language changes.
  // Uses `tr` (non-hook) so the effect only re-runs when `lang` actually changes —
  // depending on `t` (recreated every render) would wipe messages on every render.
  const welcomeMsg = tr(lang, "ai_welcome");
  useEffect(() => {
    setMessages([{ role: "assistant", content: welcomeMsg }]);
    setError(null);
  }, [lang, welcomeMsg]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Msg = { role: "user", content: trimmed };
      setMessages((cur) => [...cur, userMsg]);
      setInput("");
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/ai-triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            lang,
            // Exclude the welcome message from history sent to the model
            history: messages
              .filter((m) => m.content !== welcomeMsg)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Request failed");
        }
        setMessages((cur) => [
          ...cur,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
        setMessages((cur) => [
          ...cur,
          { role: "assistant", content: t("ai_error") },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, lang, welcomeMsg]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const bookConsultation = () => {
    setOpen(false);
    openDialog();
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-elevated hover:scale-105 transition-transform"
            aria-label="Open Eswen AI Assistant"
          >
            <span className="absolute inset-0 rounded-full animate-eswen-pulse-ring" />
            {logo.url ? <img src={logo.url} alt={logo.alt} className="h-6 w-6 relative rounded-full object-cover" /> : <Sparkles className="h-6 w-6 relative" />}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] font-bold text-white border-2 border-white">
              ●
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 sm:w-[400px] max-h-[85vh] sm:max-h-[640px] flex flex-col overflow-hidden rounded-3xl border border-eswen-lavender bg-white shadow-eswen-elevated"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                {logo.url ? <img src={logo.url} alt={logo.alt} className="h-5 w-5 rounded-full object-cover" /> : <Sparkles className="h-5 w-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight">Eswen AI Assistant</p>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  {t("ai_online")}
                </p>
              </div>
              {/* Mini language toggle inside the chat */}
              <div className="flex items-center rounded-full bg-white/15 backdrop-blur p-0.5 text-[10px] font-bold">
                {(["en", "id"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-2 py-0.5 rounded-full uppercase transition-all",
                      lang === l ? "bg-white text-eswen-deep" : "text-white/80 hover:text-white"
                    )}
                    aria-label={`Switch AI to ${l === "en" ? "English" : "Indonesian"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto scrollbar-eswen bg-eswen-gradient-soft p-4 space-y-3"
            >
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-eswen-lavender">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-eswen-soft-purple" />
                  </span>
                  {t("ai_thinking")}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-700">
                  <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Suggestions (only on first exchange) */}
              {messages.length === 1 && !loading && (
                <div className="pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {t("ai_quick")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTIONS[lang].map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs text-eswen-deep rounded-xl bg-white border border-eswen-lavender px-3 py-2 hover:bg-eswen-light-lavender hover:border-eswen-soft-purple transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA + disclaimer */}
            <div className="border-t border-eswen-lavender bg-white p-3 space-y-2">
              <Button
                onClick={bookConsultation}
                className="w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-10 text-sm font-semibold shadow-eswen-soft"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("ai_book")}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed flex items-start gap-1 px-1">
                <MessageSquareText className="h-3 w-3 mt-0.5 shrink-0 text-eswen-lavender-soft" />
                {t("ai_disclaimer")}
              </p>
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 p-3 border-t border-eswen-lavender bg-white">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("ai_placeholder")}
                maxLength={800}
                disabled={loading}
                className="flex-1 h-11 rounded-full bg-eswen-light-lavender/60 border border-eswen-lavender px-4 text-sm text-eswen-deep placeholder:text-muted-foreground/70 focus:outline-none focus:border-eswen-soft-purple focus:bg-white transition-colors disabled:opacity-60"
                aria-label={t("ai_placeholder")}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-11 w-11 rounded-full bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft hover:shadow-eswen-card disabled:opacity-50"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-sm">
          {logo.url ? <img src={logo.url} alt={logo.alt} className="h-3.5 w-3.5 rounded-full object-cover" /> : <Sparkles className="h-3.5 w-3.5" />}
        </span>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white rounded-br-md"
            : "bg-white border border-eswen-lavender text-eswen-deep rounded-bl-md shadow-sm"
        )}
      >
        {renderMarkdownLite(msg.content)}
      </div>
    </motion.div>
  );
}

// Lightweight markdown: **bold** → <strong>
function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-bold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
