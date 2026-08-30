type AvailabilitySectionProps = {
  available: boolean;
  setAvailable: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AvailabilitySection({
  available,
  setAvailable,
}: AvailabilitySectionProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#0F172A] sm:text-sm">
          Worker Availability
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-[#64748B] sm:text-xs">
          Allow this worker to receive new bookings.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setAvailable((value) => !value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          available ? "bg-emerald-500" : "bg-gray-300"
        }`}
        aria-label="Toggle worker availability"
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            available ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}