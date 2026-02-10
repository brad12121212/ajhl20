import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["b", "i", "u", "strong", "em", "p", "br", "span", "h2", "h3"];
const ALLOWED_ATTR = { span: ["class"] };
const ALLOWED_CLASSES = { span: ["text-sm", "text-base", "text-lg", "text-xl"] };

export function sanitizeNewsContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedClasses: ALLOWED_CLASSES,
  });
}

/** Strip HTML tags for plain-text length / preview */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
