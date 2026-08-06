import {
  CheckCircle2,
  Circle,
} from "lucide-react";

type Props = {
  status: string;
};

const steps = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Out For Delivery",
  "Delivered",
];

export default function OrderTimeline({
  status,
}: Props) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const completed = index <= currentIndex;

        return (
          <div
            key={step}
            className="flex items-center gap-3"
          >
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-slate-300" />
            )}

            <span
              className={
                completed
                  ? "font-semibold text-slate-900"
                  : "text-slate-400"
              }
            >
              {step}
            </span>
          </div>
        );
      })}

      {status === "Cancelled" && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          Order Cancelled
        </div>
      )}
    </div>
  );
}