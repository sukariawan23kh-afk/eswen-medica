"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Tag,
  Globe,
  CalendarDays,
  MessageCircle,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Share2,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/eswen/language-store";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  language: string;
  readTime: string;
  date: string;
};

export function ArticleDetailModal({
  article,
  onClose,
  relatedArticles,
  onSelectRelated,
}: {
  article: Article | null;
  onClose: () => void;
  relatedArticles?: Article[];
  onSelectRelated?: (article: Article) => void;
}) {
  const { lang } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset reading progress + scroll to top whenever the visible article
  // changes. Covers both the initial open and the related-article switch
  // (so the user always starts reading from the top).
  useEffect(() => {
    // setState calls in the effect body are intentional here — we explicitly
    // want to reset local UI state (progress, copied flag, scroll position)
    // when the article prop changes. Disable the noisy rule for this block.
    /* eslint-disable react-hooks/set-state-in-effect */
    setProgress(0);
    setCopied(false);
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
      copiedTimer.current = null;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [article?.id]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!article) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [article]);

  // Close on Escape
  useEffect(() => {
    if (!article) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [article, onClose]);

  // Cleanup copy-state timer on unmount to avoid setState-after-unmount.
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  // Reading progress — driven by the modal's scrollable body.
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    const pct =
      max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0;
    setProgress(pct);
  };

  // Share URL — deep-link to the article via ?article={slug}. Built from the
  // current page URL so the share target lands on the blog section.
  const shareUrl =
    typeof window !== "undefined" && article
      ? `${window.location.href.split("?")[0]}?article=${encodeURIComponent(
          article.slug
        )}`
      : "";

  const shareText = article?.title ?? "";

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for browsers without the async clipboard API.
      try {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* no-op — silently ignore clipboard failure */
      }
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  // Related articles — exclude the currently visible one (by id) and cap at 3.
  const related = (relatedArticles ?? [])
    .filter((a) => a.id !== article?.id)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-eswen-deep/50 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${article.title} — article`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated"
          >
            {/* Reading progress bar — sits at the very top of the modal */}
            <div
              className="relative h-1 w-full shrink-0 bg-eswen-lavender/40 pointer-events-none"
              aria-hidden="true"
            >
              <div
                className="h-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur text-eswen-deep hover:bg-white shadow-md transition-all hover:scale-105"
              aria-label={lang === "id" ? "Tutup" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen"
            >
              {/* Header — large image with gradient overlay */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-b from-eswen-light-lavender via-eswen-lavender/40 to-white">
                {/* Decorative gradient blobs */}
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-eswen-soft-purple/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-eswen-lavender/40 blur-3xl pointer-events-none" />

                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {/* Strong gradient overlay for legible text */}
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/85 via-eswen-deep/25 to-transparent pointer-events-none" />

                {/* Category badge — top-left */}
                {article.category && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-eswen-deep shadow-sm">
                    <Tag className="h-3 w-3" />
                    {article.category}
                  </span>
                )}

                {/* Language badge — top-right (offset to clear the close button) */}
                {article.language && (
                  <span className="absolute top-4 right-16 inline-flex items-center gap-1.5 rounded-full bg-eswen-deep/80 backdrop-blur px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    <Globe className="h-3 w-3" />
                    {article.language.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5 sm:p-7 space-y-5">
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-eswen-deep">
                  {article.title}
                </h2>

                {/* Meta row — date + read time + category */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
                  {article.date && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-eswen-light-lavender/70 border border-eswen-lavender px-2.5 py-1 font-semibold text-eswen-deep">
                      <CalendarDays className="h-3 w-3" />
                      {article.date}
                    </span>
                  )}
                  {article.readTime && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-eswen-light-lavender/70 border border-eswen-lavender px-2.5 py-1 font-semibold text-eswen-deep">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  )}
                  {article.category && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-eswen-light-lavender/70 border border-eswen-lavender px-2.5 py-1 font-semibold text-eswen-deep">
                      <Tag className="h-3 w-3" />
                      {article.category}
                    </span>
                  )}
                </div>

                {/* Excerpt — short summary lead-in (if present + differs from title) */}
                {article.excerpt && article.excerpt.trim() && (
                  <p className="text-base font-medium text-eswen-deep/85 leading-relaxed border-l-4 border-eswen-soft-purple pl-4 italic">
                    {article.excerpt}
                  </p>
                )}

                {/* Article content — markdown-rendered */}
                {article.content && article.content.trim() ? (
                  <ArticleMarkdownContent content={article.content} />
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {lang === "id"
                      ? "Konten artikel belum tersedia."
                      : "Article content is not available."}
                  </p>
                )}

                {/* Share buttons */}
                <div className="mt-6 pt-5 border-t border-eswen-lavender/60">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-eswen-deep">
                    <Share2 className="h-4 w-4" />
                    {lang === "id" ? "Bagikan artikel ini" : "Share this article"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${shareText} ${shareUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1f8b4c] border border-[#25D366]/30 transition-colors text-xs font-semibold"
                      aria-label="Share on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareUrl
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#0b5fcc] border border-[#1877F2]/30 transition-colors text-xs font-semibold"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="hidden sm:inline">Facebook</span>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        shareText
                      )}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-eswen-deep/10 hover:bg-eswen-deep/20 text-eswen-deep border border-eswen-deep/30 transition-colors text-xs font-semibold"
                      aria-label="Share on Twitter / X"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="hidden sm:inline">Twitter</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-eswen-light-lavender hover:bg-eswen-lavender text-eswen-deep border border-eswen-lavender transition-colors text-xs font-semibold"
                      aria-label={
                        lang === "id" ? "Salin tautan artikel" : "Copy article link"
                      }
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span className="hidden sm:inline text-emerald-600">
                            {lang === "id" ? "Tersalin!" : "Copied!"}
                          </span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {lang === "id" ? "Salin tautan" : "Copy link"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-eswen-lavender/60">
                    <h3 className="text-base font-bold text-eswen-deep mb-3 flex items-center gap-2">
                      <span className="inline-block h-4 w-1 rounded-full bg-eswen-soft-purple" />
                      {lang === "id" ? "Artikel Terkait" : "Related Articles"}
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {related.map((ra) => (
                        <button
                          key={ra.id}
                          type="button"
                          onClick={() => onSelectRelated?.(ra)}
                          className="group flex flex-col overflow-hidden rounded-xl border border-eswen-lavender bg-white hover:border-eswen-soft-purple hover:shadow-eswen-soft transition-all text-left"
                          aria-label={`Open ${ra.title}`}
                        >
                          <div className="h-20 w-full overflow-hidden bg-eswen-light-lavender">
                            <img
                              src={ra.imageUrl || "/images/blog-1.png"}
                              alt={ra.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-2.5">
                            <h4 className="text-xs font-bold text-eswen-deep leading-snug line-clamp-2 group-hover:text-eswen-soft-purple transition-colors">
                              {ra.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                              {ra.category && (
                                <>
                                  <Tag className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{ra.category}</span>
                                  <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-eswen-lavender-soft" />
                                </>
                              )}
                              {ra.readTime && (
                                <>
                                  <Clock className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">{ra.readTime}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — Close button */}
            <div className="shrink-0 border-t border-eswen-lavender bg-white/95 backdrop-blur p-4 sm:p-5">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full rounded-full border-eswen-lavender-soft text-eswen-deep bg-white hover:bg-eswen-light-lavender hover:border-eswen-soft-purple h-11 text-sm font-semibold"
              >
                <X className="h-4 w-4" />
                {lang === "id" ? "Tutup" : "Close"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Render markdown article content with consistent typography for LONG, complete
 * medical articles. Uses remark-gfm (tables, strikethrough, task lists) +
 * remark-breaks (single newlines → <br>). Custom renderers apply the Eswen
 * palette and tuned long-form reading styles.
 */
function ArticleMarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-foreground/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Headings — anchor-friendly offsets + larger sizes for long content
          h1: ({ children }) => (
            <h1 className="scroll-mt-20 mt-8 mb-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="scroll-mt-20 mt-8 mb-3 text-xl sm:text-2xl font-bold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="scroll-mt-20 mt-6 mb-2 text-lg sm:text-xl font-bold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="scroll-mt-20 mt-5 mb-2 text-base font-bold text-eswen-deep first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="scroll-mt-20 mt-4 mb-2 text-sm font-bold uppercase tracking-wider text-eswen-deep first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="scroll-mt-20 mt-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground first:mt-0">
              {children}
            </h6>
          ),
          // Paragraph — long-form reading rhythm
          p: ({ children }) => (
            <p className="text-[15px] leading-relaxed text-foreground/85 mb-4 last:mb-0">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc my-4 pl-6 space-y-2 marker:text-eswen-soft-purple">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal my-4 pl-6 space-y-2 marker:text-eswen-soft-purple marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          // Bold
          strong: ({ children }) => (
            <strong className="font-bold text-eswen-deep">{children}</strong>
          ),
          // Italic
          em: ({ children }) => (
            <em className="text-eswen-deep/90">{children}</em>
          ),
          // Strikethrough (GFM)
          del: ({ children }) => (
            <del className="text-muted-foreground line-through">{children}</del>
          ),
          // Link
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-eswen-soft-purple underline underline-offset-2 hover:text-eswen-deep transition-colors break-words font-medium"
            >
              {children}
            </a>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-eswen-soft-purple pl-4 italic text-foreground/70 my-4 bg-eswen-light-lavender/30 py-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-eswen-lavender to-transparent" />
          ),
          // Code — detect block vs inline to apply the correct style.
          // Block code (fenced ```ts) arrives with a `language-*` className or
          // multi-line children; render it plainly so `pre` provides the chrome.
          code: ({ className, children, ...rest }) => {
            const isBlock =
              (typeof className === "string" &&
                className.includes("language-")) ||
              (Array.isArray(children) &&
                children.some(
                  (c) => typeof c === "string" && c.includes("\n")
                )) ||
              (typeof children === "string" && children.includes("\n"));
            if (isBlock) {
              return (
                <code
                  className="font-mono text-xs text-eswen-deep/90"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-eswen-light-lavender px-1.5 py-0.5 rounded text-[0.85em] font-mono text-eswen-deep">
                {children}
              </code>
            );
          },
          // Code block wrapper
          pre: ({ children }) => (
            <pre className="bg-eswen-deep/5 rounded-lg p-3 overflow-x-auto my-3 text-xs font-mono scrollbar-eswen">
              {children}
            </pre>
          ),
          // Table (GFM)
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto scrollbar-eswen">
              <table className="w-full my-4 border-collapse border border-eswen-lavender rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-eswen-light-lavender text-eswen-deep">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="bg-eswen-light-lavender font-bold text-left px-3 py-2 border border-eswen-lavender">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border border-eswen-lavender/60">
              {children}
            </td>
          ),
          // Task list item (GFM)
          input: ({ checked, ...rest }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-eswen-soft-purple"
              {...rest}
            />
          ),
          // Images inside content
          img: ({ src, alt }) => (
            <img
              src={typeof src === "string" ? src : ""}
              alt={alt ?? ""}
              className="rounded-lg my-4 w-full border border-eswen-lavender/40"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
