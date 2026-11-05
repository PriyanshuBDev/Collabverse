"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import Appbar from "../Appbar/Appbar";

export default function AppAndSide() {
  const [mounted, setMounted] = useState(false);
  const [openSideBar, setOpenSideBar] = useState<boolean | null>(null); // null until initialized
  const prevWidth = useRef<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  // Initialize client state
  useEffect(() => {
    const saved = localStorage.getItem("SideBar");
    const initialState = saved ? saved === "open" : window.innerWidth >= 768;
    setOpenSideBar(initialState);

    const handleResize = () => {
      const width = window.innerWidth;
      const crossedToMobile = prevWidth.current >= 768 && width < 768;
      const crossedToDesktop = prevWidth.current < 768 && width >= 768;

      if (crossedToMobile) setOpenSideBar(false);
      if (crossedToDesktop) {
        const saved = localStorage.getItem("SideBar");
        const savedState = saved === "open";
        setOpenSideBar(savedState);
      }

      prevWidth.current = width;
    };

    window.addEventListener("resize", handleResize);
    setTimeout(() => setMounted(true), 50);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update <main> margin dynamically
  useEffect(() => {
    if (openSideBar === null) return; // not initialized yet
    const main = document.getElementById("dashboard-main");
    if (main) {
      setTimeout(() => {
        main.setAttribute("data-mounted", "true");
        main.setAttribute("data-sidebar-open", openSideBar ? "true" : "false");
      }, 50);
    }
  }, [openSideBar]);

  if (openSideBar === null) return null;
  if (!mounted) return null;

  return (
    <div className="h-screen flex">
      <Sidebar
        onClick={() => {
          setOpenSideBar(false);
          localStorage.setItem("SideBar", "close");
        }}
        open={openSideBar}
      />
      <div className="flex-1 flex flex-col bg-white h-screen ">
        <Appbar
          onClick={() => {
            setOpenSideBar(true);
            localStorage.setItem("SideBar", "open");
          }}
          isOpen={openSideBar}
        />
      </div>
    </div>
  );
}
