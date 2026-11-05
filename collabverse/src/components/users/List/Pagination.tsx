"use client";

interface PaginationProps {
  page: number;
  totalPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  total: number;
}

export default function Pagination({
  page,
  totalPage,
  setPage,
  total,
}: PaginationProps) {
  return (
    <div className="my-5 flex w-full justify-between items-center">
      <div className="font-semibold text-xs lg:text-base">
        Showing {total > page * 10 ? page * 10 : total} from {total}{" "}
      </div>
      <div className="flex justify-between items-center  rounded-full px-2 py-1.5 gap-3">
        <div>
          <button
            className={` cursor-pointer rounded-full flex items-center justify-center shadow-md bg-white w-6 h-6 lg:w-8 lg:h-8 font-semibold text-xs lg:text-base disabled:cursor-not-allowed ${
              page > 1
                ? "text-blue-500 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white"
                : "text-gray-500"
            }`}
            disabled={page === 1}
            onClick={() => {
              if (page != 1) {
                setPage((prev) => prev - 1);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-3 lg:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>
        {Array.from({ length: totalPage }, (_, i: number) => (
          <PageButton
            key={i}
            onClick={() => setPage(i + 1)}
            label={i + 1}
            isActive={page === i + 1}
          />
        ))}
        <div>
          <button
            className={` cursor-pointer rounded-full flex items-center justify-center shadow-md bg-white w-6 h-6 lg:w-8 lg:h-8 font-semibold text-xs lg:text-base disabled:cursor-not-allowed  ${
              page < totalPage
                ? "text-blue-500 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white "
                : "text-gray-500"
            }`}
            disabled={page === totalPage}
            onClick={() => {
              if (page != totalPage) {
                setPage((prev) => prev + 1);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="size-3 lg:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PageButtonProps {
  label: number;
  onClick: () => void;
  isActive: boolean;
}

function PageButton({ label, onClick, isActive }: PageButtonProps) {
  return (
    <div>
      <button
        className={` cursor-pointer rounded-full  w-6 h-6 lg:w-8 lg:h-8 font-semibold text-xs lg:text-base bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white shadow-md ${
          isActive
            ? " bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl text-white"
            : "bg-white text-gray-500"
        }`}
        onClick={() => onClick()}
      >
        {label}
      </button>
    </div>
  );
}
