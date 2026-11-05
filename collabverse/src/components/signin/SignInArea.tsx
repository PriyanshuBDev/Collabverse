"use client";

import { useState } from "react";
import Link from "next/link";
import GlassWrapper from "../wrappers/GlassWrapper";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Spinner1 from "../loadings/Spinner1";
import PasswordInput from "./PasswordInput";
export default function SignInArea() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [resending, setResending] = useState(false);
  const [forgetting, setForgetting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showResendSent, setShowResendSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showForgotSent, setShowForgotSent] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState(true);

  async function handleSignin() {
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSigningIn(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("Email not confirmed")) {
        setShowResend(true);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } else {
      toast.success("Successfully signed in.");
      router.push("/app");
    }
  }
  async function handleVerification() {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      toast.error("Something went wrong. Try again.");
    } else {
      setShowResendSent(true);
    }
  }
  async function handleForgot() {
    setForgetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgetting(false);
    if (error) {
      toast.error("Something went wrong. Try again.");
    } else {
      setShowForgotSent(true);
    }
  }
  const disable =
    !email ||
    email.trim() === "" ||
    password.trim() === "" ||
    !passwordValidity;
  return (
    <GlassWrapper>
      {showForgot && (
        <div className="flex flex-col justify-center w-full items-center">
          <div className="flex items-center gap-4 justify-start w-full">
            <div
              className="p-1.5  rounded-md bg-gray-200  hover:bg-gray-400  cursor-pointer text-gray-900 "
              onClick={() => {
                setShowForgot(false);
                setEmail("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 lg:size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </div>
            <div className="flex justify-center w-full lg:mr-0 mr-11">
              <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
                Change Your Password
              </h1>
            </div>
          </div>

          {showForgotSent ? (
            <>
              <div className="text-center flex flex-col flex-wrap text-gray-700 text-base lg:text-lg mt-3 lg:mt-5">
                If an account exists, a reset link has been sent to email at{" "}
                <span className="text-black font-semibold">{email}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-800 lg:text-xl font-semibold mb-1 mt-5 flex justify-start w-full">
                Email
              </div>
              <input
                required
                type="email"
                value={email}
                placeholder="johnDoe@gmail.com"
                className="invalid:outline-red-500 invalid:outline-2 rounded-md px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 text-black w-full"
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                disabled={forgetting || !email.includes("@")}
                onClick={handleForgot}
                type="button"
                className={`flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 text-white h-fit text-nowrap enabled:bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:outline-none  font-medium rounded-lg lg:text-xl w-full py-2 mt-5 text-center `}
              >
                {forgetting ? (
                  <Spinner1
                    size="size-6 lg:size-7"
                    color="text-blue-300"
                    fill="fill-white"
                  />
                ) : (
                  "Send Request"
                )}
              </button>
            </>
          )}
        </div>
      )}
      {showResend && (
        <div className="flex flex-col justify-center w-full items-center">
          <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
            Verify Your Account
          </h1>

          {showResendSent ? (
            <>
              <div className="text-center flex flex-col flex-wrap text-gray-700 text-base lg:text-lg mt-3 lg:mt-5">
                A verification link has been sent to your email at{" "}
                <span className="text-black font-semibold">{email}</span>
              </div>
              <div className="text-center flex flex-wrap text-gray-700 text-base lg:text-lg">
                Please verify to continue.
              </div>
            </>
          ) : (
            <>
              <div className="text-center flex flex-col flex-wrap text-gray-700 text-base lg:text-lg mt-3 lg:mt-5">
                Your email at {email} hasn&apos;t been verified.
              </div>
              <button
                disabled={resending}
                onClick={handleVerification}
                type="button"
                className={`flex items-center justify-center cursor-pointer disabled:cursor-not-allowed  text-white h-fit text-nowrap enabled:bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:outline-none  font-medium rounded-lg lg:text-xl w-full py-2 mt-5 text-center `}
              >
                {resending ? (
                  <Spinner1
                    size="size-6 size-7"
                    color="text-blue-300"
                    fill="fill-white"
                  />
                ) : (
                  "Verify"
                )}
              </button>
            </>
          )}
        </div>
      )}
      {!showForgot && !showResend && (
        <>
          <div className="flex justify-center w-full">
            <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
              Sign In To Your Account
            </h1>
          </div>
          <div className="text-gray-800  lg:text-xl font-semibold mb-1 mt-5">
            Email
          </div>
          <input
            type="email"
            value={email}
            placeholder="johnDoe@gmail.com"
            className="invalid:outline-red-500 invalid:outline-2 rounded-md px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 text-black w-full"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="text-gray-800  lg:text-xl font-semibold mt-2 mb-1">
            Password
          </div>
          <PasswordInput
            setValidity={setPasswordValidity}
            password={password}
            handlePasswordEdit={(p) => setPassword(p)}
            inputClass="aria-invalid:outline-red-500 aria-invalid:outline-2 rounded-md px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 text-black"
          />
          <div
            className="text-gray-800 hover:underline mt-1 cursor-pointer text-sm lg:text-base w-fit"
            onClick={() => {
              setShowForgot(true);
              setEmail("");
              setPassword("");
            }}
          >
            <div>Forgot password?</div>
          </div>

          <button
            disabled={disable}
            onClick={() => {
              if (!signingIn) {
                handleSignin();
              }
            }}
            type="button"
            className={`flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600  text-white h-fit text-nowrap enabled:bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:outline-none  font-medium rounded-lg lg:text-xl w-full py-2 mt-5 text-center `}
          >
            {signingIn ? (
              <Spinner1
                size="size-6 lg:size-7"
                color="text-blue-300"
                fill="fill-white"
              />
            ) : (
              "Sign In"
            )}
          </button>
          <div className="flex  justify-center lg:text-lg text-base mt-3 gap-2">
            <span className="text-gray-800">Don&apos;t have an account?</span>{" "}
            <Link
              href={"/auth/signup"}
              className="text-blue-500 hover:underline cursor-pointer "
            >
              Sign Up
            </Link>
          </div>
        </>
      )}
    </GlassWrapper>
  );
}
