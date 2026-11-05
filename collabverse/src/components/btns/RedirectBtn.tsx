"use client";

import Link from "next/link";

interface Props {
  label: string;
  direct: string;
}

export default function RedirectBtn({ label, direct }: Props) {
  return (
    <Link href={direct}>
      <button className="border-gray-300 dark:border-gray-700 border-3 hover:bg-gray-300 dark:hover:bg-gray-500 dark:bg-blk4 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-0.5 cursor-pointer bg-white h-fit">
        {label}
      </button>
    </Link>
  );
}
