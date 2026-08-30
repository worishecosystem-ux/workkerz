import { Loader2 } from "lucide-react";

type EditWorkerBottomBarProps = {
  loading: boolean;
  photoUploading: boolean;
  keyboardOpen: boolean;
  onClose: () => void;
};

export default function EditWorkerBottomBar({
  loading,
  photoUploading,
  keyboardOpen,
  onClose,
}: EditWorkerBottomBarProps) {
  if (keyboardOpen) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-3 pt-2.5 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] backdrop-blur-xl pb-[calc(10px+env(safe-area-inset-bottom))] sm:px-6 sm:pt-3 sm:pb-3 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-[11px] font-bold text-[#64748B] transition active:scale-[0.98] disabled:opacity-50 sm:h-12 sm:px-6 sm:text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          form="edit-worker-form"
          disabled={loading || photoUploading}
          className="flex h-10 flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-[#FF5C39] px-3 text-[11px] font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60 sm:h-12 sm:px-7 sm:text-sm"
        >
          {(loading || photoUploading) && (
            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
          )}

          {photoUploading
            ? "Uploading..."
            : loading
              ? "Saving..."
              : "Save Changes"}
        </button>
      </div>
    </div>
  );
}