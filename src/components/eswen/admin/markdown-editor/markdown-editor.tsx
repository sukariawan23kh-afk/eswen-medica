"use client";

import { useRef, useMemo } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

/**
 * MarkdownEditor — textarea with a WYSIWYG-like toolbar.
 *
 * Toolbar buttons insert markdown syntax at the cursor position (or wrap the
 * selected text). The user doesn't need to remember markdown syntax — just
 * click Bold / Italic / Bullet / Numbered / Heading / Quote / Link.
 *
 * The stored value is still markdown (so it works with the ReactMarkdown
 * renderer in the service detail modal, AND can be auto-translated by
 * MyMemory — HTML tags would break translation, markdown syntax doesn't).
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = "120px",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<string[]>([value]);
  const historyIdxRef = useRef<number>(0);

  /** Push current state to history (for undo/redo). */
  const pushHistory = (next: string) => {
    const hist = historyRef.current;
    const idx = historyIdxRef.current;
    // Drop any redo states if we're not at the end
    if (idx < hist.length - 1) {
      hist.splice(idx + 1);
    }
    hist.push(next);
    // Cap history at 50 entries
    if (hist.length > 50) hist.shift();
    historyIdxRef.current = hist.length - 1;
  };

  /** Wrap the current selection (or insert placeholder) with before/after. */
  const wrapSelection = (before: string, after: string, placeholderText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholderText;
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newValue);
    pushHistory(newValue);

    setTimeout(() => {
      textarea.focus();
      // Select the inserted text so user can immediately type to replace
      const selStart = start + before.length;
      textarea.setSelectionRange(selStart, selStart + selectedText.length);
    }, 0);
  };

  /** Insert a prefix at the start of the current line (for lists, headings, quotes). */
  const prefixLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(newValue);
    pushHistory(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  /** Undo / redo. */
  const undo = () => {
    const hist = historyRef.current;
    const idx = historyIdxRef.current;
    if (idx > 0) {
      historyIdxRef.current = idx - 1;
      onChange(hist[idx - 1]);
    }
  };
  const redo = () => {
    const hist = historyRef.current;
    const idx = historyIdxRef.current;
    if (idx < hist.length - 1) {
      historyIdxRef.current = idx + 1;
      onChange(hist[idx + 1]);
    }
  };

  /** Buttons config — memoized so the array identity is stable. */
  const buttons: Array<{
    icon: typeof Bold;
    title: string;
    action: () => void;
    divider?: boolean;
  }> = useMemo(() => [
    { icon: Undo2, title: "Undo", action: undo },
    { icon: Redo2, title: "Redo", action: redo, divider: true },
    { icon: Bold, title: "Bold (Ctrl+B)", action: () => wrapSelection("**", "**", "bold text") },
    { icon: Italic, title: "Italic (Ctrl+I)", action: () => wrapSelection("*", "*", "italic text") },
    { icon: Heading2, title: "Heading", action: () => prefixLine("## ") },
    { icon: List, title: "Bullet list", action: () => prefixLine("- ") },
    { icon: ListOrdered, title: "Numbered list", action: () => prefixLine("1. ") },
    { icon: Quote, title: "Quote", action: () => prefixLine("> ") },
    { icon: LinkIcon, title: "Link", action: () => wrapSelection("[", "](https://)", "link text"), divider: true },
  ], [value]);

  /** Keyboard shortcuts: Ctrl+B = bold, Ctrl+I = italic. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        wrapSelection("**", "**", "bold text");
      } else if (key === "i") {
        e.preventDefault();
        wrapSelection("*", "*", "italic text");
      } else if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    }
  };

  return (
    <div className={`markdown-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap border border-eswen-lavender border-b-0 bg-eswen-light-lavender/40 px-1.5 py-1 rounded-t-lg">
        {/* eslint-disable react-hooks/refs -- refs are only accessed in click handlers (btn.action), not during render */}
        {buttons.map((btn, i) => (
          <div key={i} className="flex items-center">
            {btn.divider && <span className="h-4 w-px bg-eswen-lavender mx-0.5" />}
            <button
              type="button"
              onClick={btn.action}
              title={btn.title}
              className="inline-flex items-center justify-center h-7 w-7 rounded-md text-eswen-deep hover:bg-white hover:shadow-sm transition-all"
            >
              <btn.icon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          pushHistory(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ minHeight }}
        className="w-full resize-y border border-eswen-lavender rounded-b-lg px-3 py-2 text-sm text-eswen-deep bg-white outline-none focus:border-eswen-soft-purple transition-colors font-mono"
      />
      {/* Hint */}
      <p className="mt-1 text-[10px] text-muted-foreground">
        💡 Klik tombol di atas untuk format. Supports: <kbd>Ctrl+B</kbd> bold,
        <kbd> Ctrl+I</kbd> italic, <kbd>Ctrl+Z</kbd> undo. Preview: klik &quot;View Details&quot; di public site.
      </p>
    </div>
  );
}
