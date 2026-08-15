"use client";

const steps = [
  "Requester",
  "Workers",
  "Location",
  "Schedule",
  "Details",
];

interface RequestProgressProps {
  currentStep: number;
}

export default function RequestProgress({
  currentStep,
}: RequestProgressProps) {
  const progress =
    (currentStep / steps.length) * 100;

  return (
    <div className="shrink-0 border-b border-gray-100 bg-white px-3 py-2.5 sm:px-5">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-600">
              Step {currentStep} of {steps.length}
            </p>

            <p className="mt-0.5 text-xs font-black text-gray-900">
              {steps[currentStep - 1]}
            </p>
          </div>

          <span className="text-[10px] font-bold text-gray-400">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#078c43] to-[#09b653] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>
    </div>
  );
}