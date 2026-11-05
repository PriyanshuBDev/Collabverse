export default function HoverWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="cursor-pointer lg:p-5 p-3 h-full w-full dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_3px_10px_rgba(0,0,0,0.7)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-xl bg-white dark:bg-blk3 transition-all duration-300 hover:z-50 hover:-translate-y-1.5 xl:hover:-translate-y-3">
      {children}
    </div>
  );
}
