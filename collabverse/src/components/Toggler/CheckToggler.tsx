export default function CheckToggler({
  onChange,
  state,
  disabled,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  state: boolean;
  disabled: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={state}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e);
        }}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0 peer"
      />
      <div
        className={`relative w-9 h-5  peer-focus:outline-none after:block  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand ${
          state ? "bg-blue-500 " : " bg-gray-400 dark:bg-gray-600"
        }`}
      ></div>
    </label>
  );
}
