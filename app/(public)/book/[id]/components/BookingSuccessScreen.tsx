
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Home } from "lucide-react";

interface BookingSuccessScreenProps {
  bookingId: string;
  bookingReference: string;
  total: number;
  workerName: string;
  onViewDetails: () => void;
  onHome: () => void;
}

export default function BookingSuccessScreen({
  bookingId,
  bookingReference,
  total,
  workerName,
  onViewDetails,
  onHome,
}: BookingSuccessScreenProps) {
  const router = useRouter();

  // Automatically redirect after 3 seconds
  useEffect(() => {
    if (!bookingId) return;

    const timer = setTimeout(() => {
      router.replace(
        `/confirmation/${encodeURIComponent(bookingId)}`
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [bookingId, router]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#0f172a] via-[#0b2345] to-[#072566] px-4 py-8">

      {/* Background Glow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1.8 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
      />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.45,
            type: "spring",
            stiffness: 180,
          }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30"
        >
          <CheckCircle2 className="h-16 w-16 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 text-3xl font-bold text-white"
        >
          Booking Submitted!
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-3 max-w-xs text-center text-white/70"
        >
          Your booking request for{" "}
          <span className="font-semibold text-white">
            {workerName}
          </span>{" "}
          has been submitted successfully.
        </motion.p>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 w-full rounded-2xl border border-white/10 bg-white/10 p-5 text-left backdrop-blur-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Booking Reference
          </p>

          <p className="mt-1 break-all text-lg font-bold text-white">
            {bookingReference || bookingId}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-white/60">
              Service Amount
            </span>

            <span className="text-lg font-bold text-white">
              ₹{Number(total || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </motion.div>

        {/* Redirect Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-7"
        >
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.2,
                }}
                className="h-2 w-2 rounded-full bg-white"
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-white/60">
            Redirecting to your booking details...
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 w-full space-y-3"
        >
          <button
            type="button"
            onClick={onViewDetails}
            className="w-full rounded-xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            View Booking Details
          </button>

          <button
            type="button"
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </motion.div>

      </div>
    </div>
  );
}
