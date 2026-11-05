import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

import { isValidUsername } from "@/lib/functions/validity/isValidUsername";
import ValidityList from "../Profile/ValidityList";
export default function UsernameValidityCard({
  username,
  handleUsernameEdit,
  inputClass,
  setValidity,
}: {
  username: string;
  handleUsernameEdit: (n: string) => void;
  inputClass?: string;
  setValidity: Dispatch<SetStateAction<boolean>>;
}) {
  const [usernameTouched, setUsernameTouched] = useState(false);
  const isEmpty = username.trim() === "";
  const atTheRateInvalid = !isEmpty && !username.startsWith("@");
  const atTheRateValid = !isEmpty && username.startsWith("@");
  const uniqueInvalid = !isEmpty && false;
  const uniqueValid = !isEmpty && true;
  const alphaTest = /[a-z]/.test(username.slice(1));
  const alphaInvalid = !isEmpty && !alphaTest;
  const alphaValid = !isEmpty && alphaTest;
  const lengthInvalid = !isEmpty && username.length < 4;
  const lenghtValid = !isEmpty && username.length > 3;

  return (
    <div className="relative group">
      <input
        spellCheck={false}
        type="text"
        maxLength={20}
        aria-invalid={
          atTheRateInvalid || uniqueInvalid || alphaInvalid || lengthInvalid
        }
        className={`w-full rounded-md text-blue-500 ${
          inputClass ??
          "aria-invalid:border-red-500 text-gray-800  dark:text-gray-200  bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 px-3 py-1 text-base lg:text-lg"
        } transition-all duration-300 `}
        placeholder="Enter username"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (!usernameTouched) setUsernameTouched(true);
          const lowercased = e.target.value.toLowerCase();
          if (isValidUsername(lowercased, false)) {
            handleUsernameEdit(lowercased);
          }
          setValidity(
            atTheRateValid && uniqueValid && alphaValid && lenghtValid,
          );
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
              valid={lenghtValid}
              label="Min 3 char, Max 20 char"
            ></ValidityList>
            <ValidityList
              invalid={uniqueInvalid}
              valid={uniqueValid}
              label="Must be unique"
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
