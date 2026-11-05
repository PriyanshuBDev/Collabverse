"use client";

import { useState } from "react";
import GlassWrapper from "../wrappers/GlassWrapper";
import { toast } from "sonner";
import isValidRealName from "@/lib/functions/validity/NameValidity";
import UNameValidityCard from "../Profile/UNameValidityCard";
import api from "@/lib/axios";
import axios from "axios";
import { useRouter } from "next/navigation";
import Spinner1 from "../loadings/Spinner1";
import UserNameValidityCard from "../Profile/UserNameValidityCard";

export default function OnboardingArea() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameValidity, setUsernameValidity] = useState(true);
  async function handleOnboarding() {
    setLoading(true);
    try {
      await api.post("/api/auth/onboarding", {
        name,
        username,
      });
      toast.success("Account setup successful");
      router.push("/app/");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        switch (e.response?.status) {
          case 400:
            toast.error("Incomplete Data");
            break;
          case 409:
            toast.error("Username already exists");
            break;
          default:
            toast.error("Something went wrong");
        }
        return;
      }
      toast.error("Something went wrong");
    }
    setLoading(false);
  }
  const disable =
    !isValidRealName(name, true) || username.trim() === "" || !usernameValidity;
  return (
    <GlassWrapper>
      <div className="flex justify-center w-full">
        <h1 className="text-gray-800 text-xl lg:text-3xl font-semibold text-shadow-lg ">
          Setup your account
        </h1>
      </div>
      <div className="text-gray-800  lg:text-xl font-semibold mt-2 mb-1">
        Name
      </div>
      <UNameValidityCard
        inputClass="invalid:outline-red-500 invalid:outline-2 px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 text-black "
        name={name}
        handleNameEdit={(n: string) => {
          setName(n);
        }}
      ></UNameValidityCard>
      <div className="text-gray-800  lg:text-xl font-semibold mt-2 mb-1">
        Username
      </div>

      <UserNameValidityCard
        setValidity={setUsernameValidity}
        username={username}
        handleUsernameEdit={(n: string) => {
          setUsername(n);
        }}
        inputClass="aria-invalid:border-red-500 invalid:outline-2 px-3 py-1.5  bg-white/80 focus:outline-black focus:outline-2 rounded-md"
      ></UserNameValidityCard>

      <button
        disabled={disable}
        onClick={() => {
          if (!loading) {
            handleOnboarding();
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
          "Create"
        )}
      </button>
    </GlassWrapper>
  );
}
