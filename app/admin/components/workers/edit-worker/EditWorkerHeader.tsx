import { X } from "lucide-react";

type EditWorkerHeaderProps = {
  onClose: () => void;
  loading: boolean;
};

export default function EditWorkerHeader({
  onClose,
  loading,
}: EditWorkerHeaderProps) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 pt-[env(safe-area-inset-top)] shadow-sm sm:h-[72px] sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h2 className="truncate text-base font-black text-[#0F172A] sm:text-lg lg:text-xl">
          Edit Worker
        </h2>

        <p className="mt-0.5 truncate text-[11px] text-[#64748B] sm:text-xs">
          Update worker profile and pricing.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[#64748B] transition active:scale-95 disabled:opacity-50"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </header>
  );
}