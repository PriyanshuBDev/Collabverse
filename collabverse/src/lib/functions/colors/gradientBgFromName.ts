export default function gradientBgFromName(name: string | "unknown") {
  const baseColors = [
    "#ef4444", // red-500
    "#3b82f6", // blue-500
    "#10b981", // green-500
    "#facc15", // yellow-500
    "#8b5cf6", // purple-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
  ];

  // normalize the name
  const cleanName = name?.trim().toLowerCase();

  // hash
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const idx = Math.abs(hash) % baseColors.length;
  const base = baseColors[idx];

  // create a slight gradient: lighten top, darken bottom
  return `linear-gradient(to bottom, ${lighten(base, 0.2)}, ${darken(
    base,
    0.15,
  )})`;
}

// helper functions to lighten/darken hex colors
function lighten(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.min(255, r + 255 * amount);
  const newG = Math.min(255, g + 255 * amount);
  const newB = Math.min(255, b + 255 * amount);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

function darken(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  const newR = Math.max(0, r - 255 * amount);
  const newG = Math.max(0, g - 255 * amount);
  const newB = Math.max(0, b - 255 * amount);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    cleaned =
      cleaned[0] +
      cleaned[0] +
      cleaned[1] +
      cleaned[1] +
      cleaned[2] +
      cleaned[2];
  }
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return [r, g, b];
}
