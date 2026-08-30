import { Camera, Trash2, Upload } from "lucide-react";

type WorkerPhotoSectionProps = {
  name: string;
  photoPreview: string;
  selectedPhoto: File | null;
  photoError: string;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onUploadClick: () => void;
};

export default function WorkerPhotoSection({
  name,
  photoPreview,
  selectedPhoto,
  photoError,
  loading,
  fileInputRef,
  onPhotoSelect,
  onRemovePhoto,
  onUploadClick,
}: WorkerPhotoSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <Camera className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          Worker Photo
        </h3>
      </div>

      <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-orange-50 sm:mx-0 sm:h-28 sm:w-28">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt={name || "Worker"}
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-8 w-8 text-[#FF5C39]" />
          )}

          {selectedPhoto && (
            <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">
              NEW
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPhotoSelect}
            className="hidden"
          />

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#FF5C39] px-4 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50 sm:text-sm"
            >
              <Upload className="h-4 w-4" />
              {photoPreview ? "Change Photo" : "Upload Photo"}
            </button>

            {photoPreview && (
              <button
                type="button"
                onClick={onRemovePhoto}
                disabled={loading}
                className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-500 transition disabled:opacity-50 sm:text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] text-[#64748B] sm:text-left sm:text-xs">
            JPG, PNG or WebP • Maximum 5 MB
          </p>

          {selectedPhoto && (
            <p className="mt-1 truncate text-center text-[10px] font-medium text-emerald-600 sm:text-left sm:text-xs">
              {selectedPhoto.name}
            </p>
          )}
        </div>
      </div>

      {photoError && (
        <p className="mt-2 text-xs font-medium text-red-500">
          {photoError}
        </p>
      )}
    </section>
  );
}