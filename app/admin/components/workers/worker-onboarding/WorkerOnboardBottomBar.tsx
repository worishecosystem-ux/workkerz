"use client";

import { Check, X } from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

type Props = {
  device: Device;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
};

export default function WorkerOnboardBottomBar({
  device,
  onCancel,
  onSave,
  saving = false,
}: Props) {
  // Desktop: normal document flow
  if (device === "desktop") {
    return (
      <div className="flex justify-end gap-3 border-t border-[#EEF0F3] bg-white px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#475467] transition hover:bg-[#F8FAFC] active:scale-[0.98] disabled:opacity-50"
        >
          <X size={17} />
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex h-11 min-w-[155px] items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(249,115,22,0.20)] transition hover:bg-[#EA580C] active:scale-[0.98] disabled:opacity-60"
        >
          <Check size={17} strokeWidth={2.7} />
          {saving ? "Saving..." : "Save Worker"}
        </button>
      </div>
    );
  }

  // Tablet
  if (device === "tablet") {
    return (
      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-40
          border-t
          border-[#F1E8E2]
          bg-white
          px-6
          py-3
          shadow-[0_-4px_18px_rgba(15,23,42,0.08)]
          [transform:translateZ(0)]
        "
      >
        <div className="mx-auto flex w-full max-w-4xl gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
              flex
              h-12
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#E7E5E3]
              bg-[#FFF8F5]
              px-6
              text-sm
              font-semibold
              text-[#64748B]
              active:scale-[0.98]
              disabled:opacity-50
            "
          >
            <X size={18} />
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              flex
              h-12
              flex-[1.8]
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#F97316]
              px-8
              text-sm
              font-bold
              text-white
              shadow-[0_5px_16px_rgba(249,115,22,0.22)]
              active:scale-[0.98]
              disabled:opacity-60
            "
          >
            <Check size={18} strokeWidth={2.8} />
            {saving ? "Saving..." : "Save Worker"}
          </button>
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-40
        border-t
        border-[#F1E8E2]
        bg-white
        px-3
        pt-2
        pb-[calc(8px+env(safe-area-inset-bottom))]
        shadow-[0_-3px_14px_rgba(15,23,42,0.08)]
        [transform:translateZ(0)]
      "
    >
      <div className="mx-auto flex max-w-md gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="
            flex
            h-11
            flex-1
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-[#E7E5E3]
            bg-[#FFF8F5]
            text-[13px]
            font-semibold
            text-[#64748B]
            active:scale-[0.97]
            disabled:opacity-50
          "
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="
            flex
            h-11
            flex-[1.5]
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-[#F97316]
            px-4
            text-[13px]
            font-bold
            text-white
            shadow-[0_4px_10px_rgba(249,115,22,0.20)]
            active:scale-[0.97]
            disabled:opacity-60
          "
        >
          <Check size={16} strokeWidth={2.8} />
          {saving ? "Saving..." : "Save Worker"}
        </button>
      </div>
    </div>
  );
}