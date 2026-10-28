"use client";

import { useRef } from "react";
import { Bold, Italic, List, Quote, Link as LinkIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: string;
  hint?: string;
};

/**
 * Lightweight markdown editor for admin long-form fields (bio, education,
 * certifications, article content, service description, etc.).
 *
 * Renders a styled textarea with a small formatting toolbar that inserts
 * markdown syntax (bold, italic, bullet list, quote, link) at the cursor.
 * Supports the established "💡 Cukup input Bahasa Indonesia" ID-only pattern
 * — the EN translation is auto-generated on Save via translateIdToEn.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = "120px",
  hint,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  /** Wrap or insert text at the cursor with the given prefix/suffix. */
  const wrap = (prefix: string, suffix: string = prefix) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const sel = value.slice(start, end) || "";
    const after = value.slice(end);
    const next = before + prefix + sel + suffix + after;
    onChange(next);
    // Restore focus + selection to the wrapped text (after the prefix).
    requestAnimationFrame(() => {
      el.focus();
      const newStart = start + prefix.length;
      el.setSelectionRange(newStart, newStart + sel.length);
    });
  };

  /** Insert a block prefix (e.g. "- " or "> ") at the start of each selected line. */
  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    // Expand to full lines
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end);
    const replaced = block
      .split("\n")
      .map((l) => (l.startsWith(prefix) ? l : prefix + l))
      .join("\n");
    const next = value.slice(0, lineStart) + replaced + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart + replaced.length);
    });
  };

  const insertLink = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const sel = value.slice(start, end) || "link text";
    const insert = `[${sel}](https://)`;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      // Place cursor inside the URL parens
      const cursor = start + insert.length - 1;
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="rounded-xl border border-eswen-lavender bg-white overflow-hidden focus-within:border-eswen-soft-purple transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-eswen-light-lavender/40 border-b border-eswen-lavender">
        <TBtn title="Bold (Ctrl+B)" onClick={() => wrap("**")}><Bold className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Italic (Ctrl+I)" onClick={() => wrap("*")}><Italic className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Bullet list" onClick={() => linePrefix("- ")}><List className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Quote" onClick={() => linePrefix("> ")}><Quote className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Link" onClick={insertLink}><LinkIcon className="h-3.5 w-3.5" /></TBtn>
        {hint && (
          <span className="ml-auto text-[10px] text-muted-foreground/70 font-medium normal-case tracking-normal">
            {hint}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-y bg-white px-3 py-2.5 text-[13px] leading-relaxed text-eswen-deep outline-none placeholder:text-muted-foreground/50 font-sans"
        style={{ minHeight }}
        onKeyDown={(e) => {
          // Ctrl/Cmd+B / I shortcuts
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            wrap("**");
          } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
            e.preventDefault();
            wrap("*");
          }
        }}
      />
    </div>
  );
}

function TBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-eswen-deep hover:bg-white hover:text-eswen-soft-purple transition-colors"
    >
      {children}
    </button>
  );
}
