"use client";

type Props = { currentStep: number };
const STEPS = ["Contact", "Project", "Address", "Schedule", "Details", "Payment"];

export default function RequestProgress({ currentStep }: Props) {
  return (
    <div className="border-b border-emerald-100 bg-white px-3 py-3 sm:px-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500">Worker request progress</p>
          <p className="text-[10px] font-bold text-emerald-700">Step {currentStep} of {STEPS.length}</p>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {STEPS.map((step, index) => {
            const number = index + 1;
            const active = number === currentStep;
            const complete = number < currentStep;
            return (
              <div key={step} className="min-w-0">
                <div className={`h-1.5 rounded-full ${complete || active ? "bg-emerald-500" : "bg-gray-100"}`} />
                <p className={`mt-1 truncate text-center text-[8px] font-bold sm:text-[10px] ${active ? "text-emerald-700" : complete ? "text-gray-600" : "text-gray-400"}`}>{step}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
