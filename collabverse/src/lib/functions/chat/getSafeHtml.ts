import DOMPurify from "dompurify";
import { linkifyHtml } from "./linkifyHtml";

export function getSafeHtml(html: string | undefined) {
  if (!html) return "";

  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["b", "i", "strong", "em", "u", "span", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "target", "rel", "data-id"],
    FORBID_TAGS: ["img", "svg", "math", "iframe", "script", "video", "audio"],
    FORBID_ATTR: ["style", "onclick", "onerror", "onload", "srcset"],
    SAFE_FOR_TEMPLATES: true,
    ALLOW_DATA_ATTR: true,
  });

  return linkifyHtml(clean);
}
