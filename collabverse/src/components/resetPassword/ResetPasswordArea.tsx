"use client";

import { useEffect, useState } from "react";
import GlassWrapper from "../wrappers/GlassWrapper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Spinner1 from "../loadings/Spinner1";
import PasswordValidityCard from "../signup/PasswordValidityCard";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordArea() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState(false);
  const [recoverySession, setRecoverySession] = useState<boolean | null>(false);
  const [seconds, setSeconds] = useState(5);

  const disable = password.trim() === "" || !passwordValidity;
  const COOLDOWN_SECONDS = 60;
  async function handleResettingPassword() {
    setLoading(true);
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      toast.error("Invalid login");
      await supabase.auth.signOut();
      router.push("/auth/signin");
      return;
    }
    const lastSent = data.session.user.recovery_sent_at
      ? new Date(data.session.user.recovery_sent_at).getTime()
      : 0;
    if (Date.now() - lastSent < COOLDOWN_SECONDS * 1000) {
      toast.error("Too many requests. Try again later.");
      router.push("/auth/signin");
      return;
    }

    const reset = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);
    if (reset.error) {
      toast.error("Reset link expired or something went wrong.");
      console.log(error);
      return;
    } else {
      toast.success("Password updated successfully");
      await supabase.auth.signOut();
      router.push("/auth/signin");
    }
  }

  useEffect(() => {
    const exchange = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        setRecoverySession(false);
        return;
      }
      setRecoverySession(true);
    };

    exchange();
  }, [router, supabase]);
  useEffect(() => {
    if (recoverySession === true) return;
    if (seconds <= 0) {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace("/auth/signin"); // fallback route
      }
      return;
    }
    const timer = setTimeout(() => {
      setSeconds((i) => i - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [seconds, recoverySession, router]);
  // if (checkingValidation)
  //   return (
  //     <div className="flex items-center justify-center w-full h-full">
  //       <Spinner1
  //         size="size-10 lg:size-14"
  //         fill="fill-none"
  //         color="text-black"
  //       ></Spinner1>
  //     </div>
  //   );
  return (
    <GlassWrapper>
      <div className="flex justify-center w-full">
        <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
          Reset Your Password
        </h1>
      </div>
      {recoverySession ? (
        <>
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
                handleResettingPassword();
              }
            }}
            type="button"
            className={`${
              loading ? "cursor-not-allowed" : "cursor-pointer"
            } flex items-center justify-center  disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600  text-white h-fit text-nowrap enabled:bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:outline-none  font-medium rounded-lg lg:text-xl w-full py-2 mt-5 text-center `}
          >
            {loading ? (
              <Spinner1
                size="size-6 lg:size-7"
                fill="fill-white"
                color="text-blue-300"
              />
            ) : (
              "Reset"
            )}
          </button>
        </>
      ) : (
        <div className="text-center flex flex-col flex-wrap text-gray-700 text-base lg:text-lg mt-3 lg:mt-5">
          Either reset password has not been initiated or expired. Try
          initiating reset password again. Redirecting in{" "}
          {seconds < 0 ? 0 : seconds} seconds...
        </div>
      )}
    </GlassWrapper>
  );
}
