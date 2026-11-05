import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import ValidityList from "../Profile/ValidityList";
import Spinner1 from "../loadings/Spinner1";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "sonner";

export default function PasswordCheckInput({
  setIsVerified,
  email,
}: {
  setIsVerified: Dispatch<SetStateAction<boolean>>;
  email: string;
}) {
  const [hide, setHide] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const VERIFIED_FOR_MS = 5 * 60 * 1000;
  const supabase = supabaseBrowser();
  const handleVerification = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password,
    });
    setLoading(false);
    if (error) {
      if (error.message === "Invalid login credentials") {
        setError(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setVerified(false);
      setIsVerified(false);
      return;
    }
    setVerified(true);
    setTimeout(() => {
      setVerified(false);
      setIsVerified(false);
    }, VERIFIED_FOR_MS);
  };

  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => {
      setError(false);
    }, 5 * 1000);
    return () => clearTimeout(timeout);
  }, [error]);

  const isEmpty = password.trim() === "";
  const lengthInvalid = !isEmpty && password.length < 8;
  const lengthValid = !isEmpty && password.length >= 8;

  return (
    <>
      <div
        className={`relative w-full text-gray-900 dark:text-gray-100 ${error ? "" : "mb-5"}`}
      >
        <div className="relative w-full group ">
          <input
            minLength={8}
            placeholder="⁕⁕⁕⁕⁕⁕⁕⁕"
            aria-invalid={lengthInvalid}
            type={hide ? "password" : "text"}
            className={`w-full rounded-md pe-30  aria-invalid:border-red-500 text-gray-800  dark:text-gray-200  bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 px-3 py-2 text-sm lg:text-base transition-all duration-300 `}
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
            }}
          />{" "}
          <div
            className="absolute end-21 bottom-2.5 flex items-center ps-3 cursor-pointer"
            onClick={() => setHide((prev) => !prev)}
          >
            {hide ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </div>
          <div className="absolute group-hover:opacity-100 group-hover:visible opacity-0 left-1/2 -translate-x-1/2 top-12 z-10 p-2 lg:p-3 invisible  lg:w-60 w-50 text-sm text-gray-700 dark:text-gray-300 transition-opacity duration-300 bg-gray-200 dark:bg-blk6 rounded-lg shadow-lg">
            <div className="relative">
              <ul>
                <ValidityList
                  invalid={lengthInvalid}
                  valid={lengthValid}
                  label="Min 8 char"
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
        <button
          type="button"
          onClick={() => handleVerification()}
          className="absolute end-1.5 bottom-1.5 cursor-pointer text-white bg-blue-500 hover:bg-blue-400 shadow-xs font-medium  rounded text-xs lg:text-sm w-15 flex items-center justify-center py-1.5 focus:outline-none"
        >
          {loading ? (
            <Spinner1
              color="text-blue-300"
              fill="fill-white"
              size={"w-5 h-5"}
            />
          ) : verified ? (
            "Verified"
          ) : (
            "Verify"
          )}
        </button>
      </div>
      <div
        className={`${
          error ? "block" : "hidden"
        } text-xs lg:text-sm text-red-500`}
      >
        Password does not match
      </div>
    </>
  );
}
