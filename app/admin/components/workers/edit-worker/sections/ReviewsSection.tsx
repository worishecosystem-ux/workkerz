import { Clock3, Star } from "lucide-react";
import InputField from "../fields/InputField";
import PriceInputField from "../fields/PriceInputField";

type ReviewsSectionProps = {
  rating: string;
  reviewCount: string;
  responseTime: string;
  setRating: (value: string) => void;
  setReviewCount: (value: string) => void;
  setResponseTime: (value: string) => void;
};

const RESPONSE_TIME_OPTIONS = [
  "Within 30 minutes",
  "Within 1 hour",
  "Within 2 hours",
  "Within 4 hours",
  "Within 1 day",
];

export default function ReviewsSection({
  rating,
  reviewCount,
  responseTime,
  setRating,
  setReviewCount,
  setResponseTime,
}: ReviewsSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <Star className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          Reviews & Response
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PriceInputField
          label="Rating"
          value={rating}
          onChange={setRating}
          decimal
        />

        <InputField
          label="Review Count"
          icon={Star}
          value={reviewCount}
          onChange={setReviewCount}
          placeholder="0"
          type="text"
          inputMode="numeric"
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#0F172A] sm:text-sm">
            Response Time
          </label>

          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

            <select
              value={responseTime}
              onChange={(event) => setResponseTime(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-[#F8FAFC] pl-10 pr-3 text-xs text-[#0F172A] outline-none focus:border-[#FF5C39] focus:bg-white focus:ring-2 focus:ring-orange-100 sm:h-11 sm:text-sm"
            >
              {RESPONSE_TIME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}