"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Tag,
  Globe,
  CalendarDays,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/eswen/language-store";

type Article = {
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
}: {
  article: Article | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();

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
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur text-eswen-deep hover:bg-white shadow-md transition-all hover:scale-105"
              aria-label={lang === "id" ? "Tutup" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen">
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

                {/* Language badge — top-right */}
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
 * Render markdown article content with consistent typography. Uses
 * remark-gfm (tables, strikethrough, task lists) + remark-breaks
 * (single newlines → <br>). Custom renderers match the medical aesthetic.
 */
function ArticleMarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-sm text-foreground/85 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="mt-6 mb-3 text-2xl font-extrabold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-6 mb-3 text-xl font-bold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 text-lg font-bold tracking-tight text-eswen-deep first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 text-base font-bold text-eswen-deep first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="mt-4 mb-2 text-sm font-bold uppercase tracking-wider text-eswen-deep first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="mt-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground first:mt-0">
              {children}
            </h6>
          ),
          // Paragraph
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
          ),
          // Unordered list
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 mb-3 last:mb-0 marker:text-eswen-soft-purple">
              {children}
            </ul>
          ),
          // Ordered list
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 mb-3 last:mb-0 marker:text-eswen-soft-purple marker:font-bold">
              {children}
            </ol>
          ),
          // List item
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
              className="text-eswen-soft-purple underline underline-offset-2 hover:text-eswen-deep font-semibold break-words"
            >
              {children}
            </a>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-4 border-eswen-soft-purple bg-eswen-light-lavender/40 py-2 rounded-r-md text-eswen-deep/90 italic">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-5 border-0 h-px bg-gradient-to-r from-transparent via-eswen-lavender to-transparent" />
          ),
          // Inline code
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-eswen-light-lavender text-eswen-deep text-[0.85em] font-mono">
              {children}
            </code>
          ),
          // Code block
          pre: ({ children }) => (
            <pre className="my-3 p-3 rounded-xl bg-eswen-deep/5 overflow-x-auto scrollbar-eswen text-xs">
              {children}
            </pre>
          ),
          // Table (GFM)
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto scrollbar-eswen">
              <table className="w-full text-xs border-collapse border border-eswen-lavender rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-eswen-light-lavender/70 text-eswen-deep">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-eswen-lavender px-3 py-2 text-left font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-eswen-lavender px-3 py-2">{children}</td>
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
              className="my-4 rounded-xl border border-eswen-lavender max-w-full h-auto"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
