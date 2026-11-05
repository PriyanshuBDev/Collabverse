"use client";

import { useState } from "react";
import Link from "next/link";
import PasswordValidityCard from "./PasswordValidityCard";
import { toast } from "sonner";
import GlassWrapper from "../wrappers/GlassWrapper";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Spinner1 from "../loadings/Spinner1";
import signup from "@/lib/axios/user/signup";

export default function SignUpArea() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verify, setVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState(false);

  async function handleSignup() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/signin`,
      },
    });

    if (error || !data.user?.email) {
      setLoading(false);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Account already exists. Please sign in.");
        } else if (error.message.includes("Password")) {
          toast.error("Password does not meet requirements.");
        } else {
          toast.error("Something went wrong. Try again.");
        }
      }
      return;
    }

    // Call your typed signup API
    const success = await signup({ id: data.user.id, email: data.user.email });

    if (success.success) {
      setVerify(true);
    }

    setLoading(false);
  }
  const disable =
    email.trim() === "" ||
    !email.includes("@") ||
    password.trim() === "" ||
    !passwordValidity;
  console.log(
    disable,
    email.trim() === "",
    !email.includes("@"),
    password.trim() === "",
    !passwordValidity,
  );
  return (
    <GlassWrapper>
      {verify ? (
        <>
          <div className="flex flex-col justify-center w-full items-center">
            <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
              Verify Your Account
            </h1>

            <div className="text-center flex flex-col flex-wrap text-gray-700 text-base lg:text-lg mt-3 lg:mt-5">
              A verification link has been sent to your email at{" "}
              <span className="text-black font-semibold">{email}</span>
            </div>
            <div className="text-center flex flex-wrap text-gray-700 text-base lg:text-lg">
              Please verify to continue.
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center w-full">
            <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
              Create An Account
            </h1>
          </div>
          <div className="text-gray-800  lg:text-xl font-semibold mb-1 mt-3 lg:mt-5">
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
          <PasswordValidityCard
            setValidity={setPasswordValidity}
            password={password}
            handlePasswordEdit={(p) => setPassword(p)}
            inputClass="aria-invalid:outline-red-500 aria-invalid:outline-2 rounded-md px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 text-black"
          ></PasswordValidityCard>

          <button
            disabled={disable}
            onClick={() => {
              if (!loading) {
                handleSignup();
              }
            }}
            type="button"
            className={`flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600  text-white h-fit text-nowrap enabled:bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:outline-none  font-medium rounded-lg lg:text-xl w-full py-2 mt-5 text-center `}
          >
            {loading ? (
              <Spinner1
                size="size-6 lg:size-7"
                color="text-blue-300"
                fill="fill-white"
              />
            ) : (
              "Create"
            )}
          </button>
          <div className="flex  justify-center lg:text-lg text-base mt-3 gap-2">
            <span className="text-gray-800">Already have an account?</span>{" "}
            <Link
              href={"/auth/signin"}
              className="text-blue-500 hover:underline cursor-pointer "
            >
              Sign In
            </Link>
          </div>
        </>
      )}
    </GlassWrapper>
  );
}
