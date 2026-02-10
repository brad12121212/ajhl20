"use client";

import { useRef, useEffect, useCallback } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className = "", minHeight = "8rem" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    ref.current?.focus();
    handleInput();
  }, [handleInput]);

  const wrapSelection = useCallback((tag: string, attrs: string = "") => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const wrapper = document.createElement(tag);
    if (attrs) wrapper.setAttribute("class", attrs);
    try {
      range.surroundContents(wrapper);
    } catch {
      // If selection spans multiple elements, surroundContents can fail - fallback to insertHTML
      const content = range.cloneContents();
      wrapper.appendChild(content);
      range.deleteContents();
      range.insertNode(wrapper);
    }
    handleInput();
  }, [handleInput]);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-zinc-300 border-b-0 bg-zinc-100 px-2 py-1.5">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="rounded px-2 py-1 text-sm font-bold hover:bg-zinc-200"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="rounded px-2 py-1 text-sm italic hover:bg-zinc-200"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          className="rounded px-2 py-1 text-sm underline hover:bg-zinc-200"
          title="Underline"
        >
          U
        </button>
        <span className="mx-1 text-zinc-400">|</span>
        <button
          type="button"
          onClick={() => exec("formatBlock", "h2")}
          className="rounded px-2 py-1 text-sm hover:bg-zinc-200"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("span", "text-lg")}
          className="rounded px-2 py-1 text-sm hover:bg-zinc-200"
          title="Large text"
        >
          Large
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("span", "text-sm")}
          className="rounded px-2 py-1 text-sm hover:bg-zinc-200"
          title="Small text"
        >
          Small
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className={`min-w-0 rounded-b-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${className}`}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
