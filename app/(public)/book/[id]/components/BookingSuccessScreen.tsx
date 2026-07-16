"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccessScreen() {
  return (
    <div className="fixed inset-0 z-999 bg-linear-to-b from-[#0f172a] via-[#0b2345] to-[#072566] flex items-center justify-center overflow-hidden">
      {/* Glow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1.8 }}
        transition={{ duration: 1 }}
        className="absolute w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl"
      />

      <div className="relative flex flex-col items-center">

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: .45,
            type: "spring",
            stiffness: 180,
          }}
          className="w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl"
        >
          <CheckCircle2 className="w-16 h-16 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .25 }}
          className="mt-8 text-3xl font-bold text-white"
        >
          Booking Submitted
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .45 }}
          className="mt-3 text-white/70 text-center max-w-xs"
        >
          Please wait while we prepare your booking confirmation.
        </motion.p>

        {/* Loading dots */}

        <div className="flex gap-2 mt-8">
          {[0,1,2].map((i)=>(
            <motion.div
              key={i}
              animate={{
                y:[0,-8,0],
                opacity:[0.4,1,0.4]
              }}
              transition={{
                repeat:Infinity,
                duration:.8,
                delay:i*.2
              }}
              className="w-3 h-3 rounded-full bg-white"
            />
          ))}
        </div>

      </div>
    </div>
  );
}