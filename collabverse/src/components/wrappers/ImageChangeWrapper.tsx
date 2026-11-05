import Image from "next/image";

export default function ImageChangeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  function isNight() {
    const hour = new Date().getHours(); // 0–23
    return hour < 6 || hour >= 18;
  }

  // usage
  const image = isNight() ? "/assets/nightBg.png" : "/assets/dayBg1.png";
  return (
    <div className="dark:text-white w-full h-screen text-gray-900 relative">
      <Image
        src={image}
        alt="background"
        fill
        priority
        className="object-cover"
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}
