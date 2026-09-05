"use client";

const steps = ["Requester", "Workers", "Location", "Schedule", "Details"];

interface RequestProgressProps {
  currentStep: number;
}

export default function RequestProgress({ currentStep }: RequestProgressProps) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="relative z-30 shrink-0 border-b border-white/10 bg-transparent px-3 py-1 sm:px-5">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            STEP INFO
        ================================================= */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/80 drop-shadow-md">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        {/* =================================================
            PROGRESS BAR
        ================================================= */}
        <div className="mt-1 h-1.5 overflow-hidden rounded-full border border-white/20 bg-black/20 shadow-sm backdrop-blur-sm">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-400 via-emerald-300 to-white shadow-[0_0_10px_rgba(255,255,255,0.45)] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* =================================================
            STEP NAME + PERCENTAGE
        ================================================= */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] font-black text-white drop-shadow-md">
            {steps[currentStep - 1]}
          </p>

          <span className="rounded-full border border-white/20 bg-black/20 px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}