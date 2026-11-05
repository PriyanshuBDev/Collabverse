export default function HomeWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="lg:p-5 p-3 h-full w-full  rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-blk3 dark:to-blk4 shadow-lg transition hover:shadow-2xl duration-300">
      {children}
    </div>
  );
}
