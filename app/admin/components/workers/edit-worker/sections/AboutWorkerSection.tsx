import { User } from "lucide-react";

type AboutWorkerSectionProps = {
  bio: string;
  setBio: (value: string) => void;
};

export default function AboutWorkerSection({
  bio,
  setBio,
}: AboutWorkerSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <User className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          About Worker
        </h3>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
          Bio
        </label>

        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Describe worker experience..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-3 py-3 text-xs text-[#0F172A] outline-none transition placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:px-4 sm:text-sm"
        />
      </div>
    </section>
  );
}