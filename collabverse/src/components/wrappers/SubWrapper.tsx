export default function SubWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:p-3 p-2  border-2 border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-blk4 hover:bg-gray-100 dark:hover:bg-blk5 cursor-pointer">
      {children}
    </div>
  );
}
