import { BriefcaseBusiness } from "lucide-react";
import InputField from "../fields/InputField";

type ExperienceSectionProps = {
  yearsExperience: string;
  completedJobs: string;
  setYearsExperience: (value: string) => void;
  setCompletedJobs: (value: string) => void;
};

export default function ExperienceSection({
  yearsExperience,
  completedJobs,
  setYearsExperience,
  setCompletedJobs,
}: ExperienceSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <BriefcaseBusiness className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          Experience
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <InputField
          label="Years Experience"
          icon={BriefcaseBusiness}
          value={yearsExperience}
          onChange={setYearsExperience}
          placeholder="e.g. 5"
          type="text"
          inputMode="numeric"
        />

        <InputField
          label="Jobs Completed"
          icon={BriefcaseBusiness}
          value={completedJobs}
          onChange={setCompletedJobs}
          placeholder="e.g. 100"
          type="text"
          inputMode="numeric"
        />
      </div>
    </section>
  );
}