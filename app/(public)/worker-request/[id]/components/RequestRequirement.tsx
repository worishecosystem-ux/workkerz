
"use client";

import { FileText, ClipboardList } from "lucide-react";

import type { WorkerRequest } from "./types";

interface RequestRequirementProps {
  request: WorkerRequest;
}

function formatRequirements(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed !== value) return formatRequirements(parsed);
    } catch {
      // Plain text is valid.
    }

    return [trimmed];
  }

  if (Array.isArray(value)) {
    return value.flatMap(formatRequirements);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== null && item !== undefined && item !== "")
      .map(([key, item]) => {
        const label = key
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        if (typeof item === "string" || typeof item === "number") {
          return `${label}: ${item}`;
        }

        if (typeof item === "boolean") {
          return `${label}: ${item ? "Yes" : "No"}`;
        }

        return `${label}: ${formatRequirements(item).join(", ")}`;
      });
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  return [];
}

export default function RequestRequirement({
  request,
}: RequestRequirementProps) {
  const requirement = request.requirement?.trim() || "";
  const additionalRequirements = formatRequirements(request.requirements);

  const hasRequirements =
    requirement.length > 0 || additionalRequirements.length > 0;

  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm">

      {/* Compact Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <FileText size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold leading-5 text-gray-900">
            Work Requirements
          </h2>
          <p className="text-[11px] leading-4 text-gray-500">
            Instructions and work details
          </p>
        </div>
      </div>

      {!hasRequirements ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-green-200 bg-green-50/50 p-3">
          <ClipboardList
            size={20}
            className="shrink-0 text-green-700"
          />
          <div>
            <p className="text-xs font-semibold text-gray-800">
              No additional requirements
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
              No specific instructions provided.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">

          {requirement && (
            <div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
              <h3 className="text-xs font-semibold text-green-800">
                Main Requirement
              </h3>

              <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 text-gray-700">
                {requirement}
              </p>
            </div>
          )}

          {additionalRequirements.length > 0 && (
            <div className="rounded-lg border border-green-100 bg-white p-3">
              <h3 className="text-xs font-semibold text-gray-800">
                Additional Details
              </h3>

              <ul className="mt-1.5 space-y-1.5">
                {additionalRequirements.map((item, index) => (
                  <li
                    key={`${index}-${item}`}
                    className="flex items-start gap-2 text-xs leading-5 text-gray-700"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </section>
  );
}