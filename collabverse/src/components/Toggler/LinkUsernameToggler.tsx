import { Dispatch, SetStateAction } from "react";

export default function LinkUsernameToggler({
  active,
  setActive,
}: {
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
}) {
  const tabs: string[] = ["Open Link", "Username"];

  return (
    <div className=" w-full mb-3">
      <div className="relative flex bg-gray-100 dark:bg-blk6 rounded-lg">
        <div
          className="absolute top-1 bottom-1 rounded-md bg-white dark:bg-blk3 shadow transition-all duration-300 mx-1"
          style={{
            left: `${(100 / tabs.length) * active}%`,
            width: `${93 / tabs.length}%`,
          }}
        />
        {tabs.map((t: string, i: number) => (
          <button
            key={i}
            onClick={() => {
              setActive(i);
            }}
            className={`relative z-10 flex-1 py-2.5 dark:text-gray-100 text-sm font-medium rounded-md transition-all duration-300 cursor-pointer ${
              active === i
                ? "text-gray-900"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
