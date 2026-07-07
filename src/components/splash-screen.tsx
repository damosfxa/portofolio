"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Hide splash screen after 2.4 seconds to allow the line to finish
    const timer = setTimeout(() => {
      setShow(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Determine theme based on route
  const isAdmin = pathname.startsWith("/admin");
  const bgColor = isAdmin ? "bg-[#09090B]" : "bg-[#fcfcfc]";
  const textColor = isAdmin ? "text-[#F4F4F0]" : "text-black";
  const subTextColor = isAdmin ? "text-white/40" : "text-black/40";
  const lineBg = isAdmin ? "bg-white/10" : "bg-black/20";
  const progressBg = isAdmin ? "bg-[#d4af37]" : "bg-black/80";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ y: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          exit={{ 
            y: "-100%", 
            borderBottomLeftRadius: "50%", 
            borderBottomRightRadius: "50%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } 
          }}
          style={{ willChange: "transform, border-radius", transform: "translateZ(0)" }}
          className={`fixed inset-0 z-[100] flex items-center justify-center ${bgColor} overflow-hidden origin-top`}
        >
          {/* Subtle radial gradient for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)] pointer-events-none" style={{ transform: "translateZ(0)" }} />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%", opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                className={`text-3xl md:text-5xl font-semibold tracking-tight ${textColor}`}
              >
                Rizky Rhamadani
              </motion.h1>
            </div>

            <div className="overflow-hidden flex flex-col items-center">
              <motion.p
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
                className={`text-xs md:text-sm font-semibold tracking-[0.25em] ${subTextColor} uppercase`}
              >
                {isAdmin ? "Admin Portal" : "Professional Portfolio"}
              </motion.p>

              {/* Ultra minimal progress line */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                className={`h-[1px] ${lineBg} mt-5 w-16`}
              >
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                  className={`w-full h-full ${progressBg}`}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
