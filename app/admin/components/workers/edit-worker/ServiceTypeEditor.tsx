"use client";

import { useState } from "react";
import { X } from "lucide-react";

type ServiceTypeEditorProps = {
  services: string[];
  setServices: (values: string[]) => void;
};

export default function ServiceTypeEditor({
  services,
  setServices,
}: ServiceTypeEditorProps) {
  const [input, setInput] = useState("");

  const addService = () => {
    const value = input.trim();

    if (!value) {
      return;
    }

    const exists = services.some(
      (service) => service.toLowerCase() === value.toLowerCase(),
    );

    if (exists) {
      setInput("");
      return;
    }

    setServices([...services, value]);
    setInput("");
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-3 sm:p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addService();
            }
          }}
          placeholder="Enter service type"
          className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#0F172A] outline-none placeholder:text-[#A8B2C1] focus:border-[#FF5C39] focus:ring-2 focus:ring-orange-100 sm:h-11 sm:text-sm"
        />

        <button
          type="button"
          onClick={addService}
          className="h-10 shrink-0 rounded-xl bg-[#FF5C39] px-4 text-xs font-bold text-white active:scale-[0.98] sm:h-11 sm:text-sm"
        >
          Add
        </button>
      </div>

      {services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((service, index) => (
            <div
              key={`${service}-${index}`}
              className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-[#C2410C]"
            >
              <span>{service}</span>

              <button
                type="button"
                onClick={() => removeService(index)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-[#C2410C] hover:bg-orange-100"
                aria-label={`Remove ${service}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {services.length === 0 && (
        <p className="mt-3 text-[11px] text-[#94A3B8]">
          No service type added.
        </p>
      )}
    </div>
  );
}