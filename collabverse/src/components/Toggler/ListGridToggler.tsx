import { Dispatch, SetStateAction, useEffect } from "react";

export default function ListGridToggler({
  active,
  setActive,
  toggleName,
}: {
  active: number | null;
  setActive: Dispatch<SetStateAction<number | null>>;
  toggleName: string;
}) {
  const tabs: string[] = ["List View", "Grid View"];

  useEffect(() => {
    const handleLastTab = () => {
      const lastOpen = localStorage.getItem(toggleName);
      if (!lastOpen) {
        localStorage.setItem(toggleName, "List View");
      }

      if (lastOpen === "Grid View") {
        setActive(1);
      } else {
        setActive(0);
      }
    };
    handleLastTab();
  }, [setActive, toggleName]);

  if (active === null) {
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
              localStorage.setItem(toggleName, t);
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
