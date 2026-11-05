import { Dispatch, SetStateAction, useEffect } from "react";

export default function ViewToggler({
  active,
  setActive,
}: {
  active: number | null;
  setActive: Dispatch<SetStateAction<number | null>>;
}) {
  const tabs: string[] = ["Table", "Board", "Calendar"];
  useEffect(() => {
    const handleLastTab = () => {
      const lastOpen = localStorage.getItem("tBCTab");
      if (!lastOpen) {
        localStorage.setItem("tBCTab", "Table");
      }

      if (lastOpen === "Board") {
        setActive(1);
      } else if (lastOpen === "Calendar") {
        setActive(2);
      } else {
        setActive(0);
      }
    };
    handleLastTab();
  }, [setActive]);
  if (active === null || !setActive) {
    return null;
  }

  return (
    <div className=" max-w-xs">
      <div className="relative flex bg-gray-100 dark:bg-blk3 rounded-lg">
        <div
          className="absolute top-1 bottom-1 rounded-md bg-white dark:bg-blk2 shadow transition-all duration-300 mx-1"
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
              localStorage.setItem("tBCTab", t);
            }}
            className={`relative z-10 flex-1 py-2 dark:text-gray-100 text-sm font-medium rounded-md transition-all duration-300 cursor-pointer ${
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
