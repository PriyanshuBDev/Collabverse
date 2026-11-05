import { ChangeEvent, Dispatch, SetStateAction } from "react";
import ValidityList from "./ValidityList";
import { isValidUsername } from "@/lib/functions/validity/isValidUsername";

export default function UserNameValidityCard({
  username,
  handleUsernameEdit,
  inputClass,
  setValidity,
  addons,
}: {
  username: string;
  handleUsernameEdit: (n: string) => void;
  inputClass?: string;
  setValidity: Dispatch<SetStateAction<boolean>>;
  addons?: string;
}) {
  const isEmpty = username.trim() === "";
  const atTheRateInvalid = !isEmpty && !username.startsWith("@");
  const atTheRateValid = !isEmpty && username.startsWith("@");
  const alphaTest = /[a-z]/.test(username.slice(1));
  const alphaInvalid = !isEmpty && !alphaTest;
  const alphaValid = !isEmpty && alphaTest;
  const lengthInvalid = !isEmpty && username.length < 4;
  const lengthValid = !isEmpty && username.length > 3;

  return (
    <div className={`relative group ${addons}`}>
      <input
        type="text"
        maxLength={20}
        aria-invalid={atTheRateInvalid || alphaInvalid || lengthInvalid}
        className={`w-full  text-blue-500 ${
          inputClass ??
          "aria-invalid:border-red-500  rounded-md bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 text-base lg:text-lg"
        } transition-all duration-300 `}
        placeholder="Enter username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (isValidUsername(value, false)) {
            handleUsernameEdit(value);
          }
          const isEmpty = value.trim() === "";
          const atValid = !isEmpty && value.startsWith("@");
          const alphaValid = /[a-z]/.test(value.slice(1));
          const lengthValid = value.length > 3;
          setValidity(atValid && alphaValid && lengthValid);
        }}
      />
      <div className="absolute group-hover:opacity-100 group-hover:visible opacity-0 left-1/2 -translate-x-1/2 top-12 z-10 p-2 lg:p-3 invisible  lg:w-60 w-50 text-sm text-gray-700 dark:text-gray-300 transition-opacity duration-300 bg-gray-200 dark:bg-blk6 rounded-lg shadow-lg">
        <div className="relative">
          <ul>
            <ValidityList
              invalid={atTheRateInvalid}
              valid={atTheRateValid}
              label="Should starts with @"
            ></ValidityList>
            <ValidityList
              invalid={lengthInvalid}
              valid={lengthValid}
              label="Min 3 char, Max 20 char"
            ></ValidityList>
            <ValidityList
              invalid={alphaInvalid}
              valid={alphaValid}
              label="Should contain alphabet"
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
