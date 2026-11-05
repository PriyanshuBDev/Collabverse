export default function htmlToText(html: string) {
  if (typeof window === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
