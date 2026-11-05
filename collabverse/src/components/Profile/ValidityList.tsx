export default function ValidityList({
  invalid,
  valid,
  label,
}: {
  invalid: boolean;
  valid?: boolean;
  label: string;
}) {
  return (
    <li className="flex items-center mb-1 gap-3">
      <div
        className={`h-6 w-1 rounded-full ${
          invalid
            ? "bg-red-500"
            : valid
            ? "bg-green-500"
            : "bg-gray-400 dark:bg-gray-700"
        }  `}
      ></div>
      {label}
    </li>
  );
}
