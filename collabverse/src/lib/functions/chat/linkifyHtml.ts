export function linkifyHtml(html: string | undefined) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Tags where linkifying should NOT happen
  const BLOCKED_TAGS = new Set(["A", "CODE", "PRE", "TEXTAREA"]);

  // Robust URL regex
  const urlRegex =
    /\b((?:https?:\/\/)[\p{L}0-9\-._~:/?#[@\]!$&'()*+,;=%]+)(?!\w)/giu;

  // Strip trailing punctuation like .,?!)
  const stripTrailing = (url: string) => url.replace(/[.,!?)]*$/, "");

  const walk = (node: Node) => {
    // Skip blocked tags
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      BLOCKED_TAGS.has((node as HTMLElement).tagName)
    ) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const parent = node.parentNode;
      if (!parent) return;

      let match;
      let lastIndex = 0;
      const frag = document.createDocumentFragment();

      while ((match = urlRegex.exec(text)) !== null) {
        const rawUrl = match[1];
        const cleanUrl = stripTrailing(rawUrl);

        // Add text before URL
        if (match.index > lastIndex) {
          frag.appendChild(
            document.createTextNode(text.slice(lastIndex, match.index))
          );
        }

        // Create link
        const a = document.createElement("a");
        a.className = "hover:underline ";
        a.href = cleanUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = cleanUrl;

        frag.appendChild(a);

        lastIndex = match.index + rawUrl.length;
      }

      // Add rest of text
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      parent.replaceChild(frag, node);
    } else {
      node.childNodes.forEach(walk);
    }
  };

  doc.body.childNodes.forEach(walk);
  return doc.body.innerHTML;
}
