import { ChangeEvent, Dispatch, SetStateAction } from "react";
import ValidityList from "@/components/Profile/ValidityList";
import isValidName from "@/lib/functions/validity/IsValidName";

export default function NameValidityCard({
  name,
  setName,
  inputClass,
}: {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  inputClass?: string;
}) {
  const isEmpty = name.trim() === "";
  const lengthInvalid = !isEmpty && name.length < 6;
  const lenghtValid = !isEmpty && name.length > 5;

  return (
    <div className="relative group">
      <input
        type="text"
        maxLength={20}
        aria-invalid={lengthInvalid}
        className={`w-full rounded-md text-blue-500 ${
          inputClass ??
          "aria-invalid:border-red-500 text-gray-800  dark:text-gray-200  bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 text-base lg:text-lg"
        } transition-all duration-300 `}
        placeholder="Enter name"
        value={name}
        spellCheck={false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          isValidName(e.target.value, setName);
        }}
      />
      <div className="absolute group-hover:opacity-100 group-hover:visible opacity-0 left-1/2 -translate-x-1/2 top-12 z-10 p-2 lg:p-3 invisible  lg:w-60 w-50 text-sm text-gray-700 dark:text-gray-300 transition-opacity duration-300 bg-gray-200 dark:bg-blk6 rounded-lg shadow-lg">
        <div className="relative">
          <ul>
            <ValidityList
              invalid={lengthInvalid}
              valid={lenghtValid}
              label="Min 6 char, Max 25 char"
            ></ValidityList>
          </ul>

          <div
            className="
        absolute lg:-top-5 -top-4 left-1/2
        -translate-x-1/2
        w-0 h-0
        border-l-8 border-r-8 border-b-8
        border-l-transparent border-r-transparent
        border-b-gray-200 dark:border-b-blk6
      "
          />
        </div>
      </div>
    </div>
  );
}
