"use client";

import {
  Check,
  Wrench,
} from "lucide-react";

type Props = {
  services: string[];
  setServices: (
    values: string[],
  ) => void;
  availableServices: string[];
};

export default function ServiceTypeSection({
  services,
  setServices,
  availableServices,
}: Props) {
  const cleanServices = (
    values: unknown,
  ): string[] => {
    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .filter(
            (
              item,
            ): item is string =>
              typeof item === "string",
          )
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean),
      ),
    );
  };

  const savedServices =
    cleanServices(services);

  const databaseServices =
    cleanServices(
      availableServices,
    );

  /*
   * Current worker ke saved services +
   * database se available services.
   *
   * Agar saved service category list me nahi hai,
   * tab bhi edit me dikhegi.
   */
  const allServices =
    Array.from(
      new Set([
        ...savedServices,
        ...databaseServices,
      ]),
    );

  const toggleService = (
    service: string,
  ) => {
    const exists =
      savedServices.some(
        (item) =>
          item.toLowerCase() ===
          service.toLowerCase(),
      );

    if (exists) {
      setServices(
        savedServices.filter(
          (item) =>
            item.toLowerCase() !==
            service.toLowerCase(),
        ),
      );

      return;
    }

    setServices([
      ...savedServices,
      service,
    ]);
  };

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm sm:p-5">
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
            Service Type
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Select one or more services
          </p>
        </div>

        {savedServices.length > 0 && (
          <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#059669]">
            {savedServices.length} selected
          </span>
        )}
      </div>

      {/* SERVICES */}

      {allServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center">
          <Wrench
            size={22}
            className="mx-auto mb-2 text-[#94A3B8]"
          />

          <p className="text-xs text-[#64748B]">
            No service types available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allServices.map(
            (service) => {
              const selected =
                savedServices.some(
                  (item) =>
                    item.toLowerCase() ===
                    service.toLowerCase(),
                );

              return (
                <button
                  key={service}
                  type="button"
                  onClick={() =>
                    toggleService(
                      service,
                    )
                  }
                  className={`relative flex min-h-[50px] items-center rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                    selected
                      ? "border-[#10B981] bg-[#ECFDF5] ring-1 ring-[#10B981]"
                      : "border-[#E2E8F0] bg-white hover:border-[#86EFAC] hover:bg-[#F8FFFC]"
                  }`}
                >
                  {/* ICON */}

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-[#10B981] text-white"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <Wrench
                      size={15}
                    />
                  </div>

                  {/* SERVICE NAME */}

                  <span
                    className={`ml-3 flex-1 text-xs ${
                      selected
                        ? "font-bold text-[#047857]"
                        : "font-medium text-[#334155]"
                    }`}
                  >
                    {service}
                  </span>

                  {/* CHECK */}

                  <div
                    className={`ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-[#10B981] bg-[#10B981] text-white"
                        : "border-[#CBD5E1] bg-white text-transparent"
                    }`}
                  >
                    <Check
                      size={12}
                      strokeWidth={3}
                    />
                  </div>
                </button>
              );
            },
          )}
        </div>
      )}

      {/* SELECTED SERVICES */}

      {savedServices.length > 0 && (
        <div className="mt-4 border-t border-[#F1F5F9] pt-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#64748B]">
              Selected Services
            </p>

            <span className="text-[11px] font-bold text-[#059669]">
              {savedServices.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedServices.map(
              (service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() =>
                    toggleService(
                      service,
                    )
                  }
                  className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-semibold text-[#047857] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  {service}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}