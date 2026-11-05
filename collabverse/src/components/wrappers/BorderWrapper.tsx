export default function BorderWrapper({
  children,
  addOns,
}: {
  children: React.ReactNode;
  addOns?: string;
}) {
  return (
    <div
      className={`md:p-5 p-3  border-2 border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-blk3 ${addOns}`}
    >
      {children}
    </div>
  );
}
