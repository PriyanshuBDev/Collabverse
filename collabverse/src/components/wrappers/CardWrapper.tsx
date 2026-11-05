export default function CardWrapper({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="cursor-pointer lg:p-3 p-1.5 h-full w-full dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] rounded-xl bg-white dark:bg-blk3 hover:bg-gray-100 dark:hover:bg-blk5"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
