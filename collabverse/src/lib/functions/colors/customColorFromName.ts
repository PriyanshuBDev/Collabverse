export default function customColorFromName(name: string, type?: string) {
  let colors: string[] = [];
  if (type === "border") {
    colors = [
      `border-red-700`,
      `border-blue-700`,
      `border-green-700`,
      `border-yellow-700`,
      `border-purple-700`,
      `border-pink-700`,
      `border-indigo-700`,
      `border-teal-700`,
      `border-orange-700`,
      `border-cyan-700`,
    ];
  } else if (type === "bg-light") {
    colors = [
      `bg-red-300`,
      `bg-blue-300`,
      `bg-green-300`,
      `bg-yellow-300`,
      `bg-purple-300`,
      `bg-pink-300`,
      `bg-indigo-300`,
      `bg-teal-300`,
      `bg-orange-300`,
      `bg-cyan-300`,
    ];
  } else if (type === "bg") {
    colors = [
      `bg-red-500`,
      `bg-blue-500`,
      `bg-green-500`,
      `bg-yellow-500`,
      `bg-purple-500`,
      `bg-pink-500`,
      `bg-indigo-500`,
      `bg-teal-500`,
      `bg-orange-500`,
      `bg-cyan-500`,
    ];
  } else {
    colors = [
      `text-red-700`,
      `text-blue-700`,
      `text-green-700`,
      `text-yellow-700`,
      `text-purple-700`,
      `text-pink-700`,
      `text-indigo-700`,
      `text-teal-700`,
      `text-orange-700`,
      `text-cyan-700`,
    ];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}
