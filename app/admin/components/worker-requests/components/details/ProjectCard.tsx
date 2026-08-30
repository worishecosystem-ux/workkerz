"use client";

import {
  BriefcaseBusiness,
  FolderKanban,
} from "lucide-react";

import type { WorkerRequest } from "../../types";

type Props = {
  request: WorkerRequest;

  compact?: boolean;
};

function ProjectItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF5C39]">
          {icon}
        </span>

        <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#94A3B8]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}

export default function ProjectCard({
  request,
  compact = false,
}: Props) {
  const hasProject =
    Boolean(request.project_name) ||
    Boolean(request.project_type);

  if (!hasProject) {
    return null;
  }

  return (
    <section
      className="
        rounded-2xl
        border
        border-orange-100
        bg-orange-50/60
        p-3.5
        md:p-4
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF5C39] shadow-sm">
          <FolderKanban className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xs font-black text-[#172033] md:text-sm">
            Project
          </h3>

          <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
            Project information
          </p>
        </div>
      </div>

      {/* =================================================
          PROJECT DETAILS
      ================================================= */}

      <div
        className={`
          mt-3
          grid
          grid-cols-2
          gap-3
          ${
            compact
              ? ""
              : "sm:grid-cols-2"
          }
        `}
      >
        {request.project_name && (
          <ProjectItem
            icon={
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            }
            label="Project Name"
            value={
              request.project_name
            }
          />
        )}

        {request.project_type && (
          <ProjectItem
            icon={
              <FolderKanban className="h-3.5 w-3.5" />
            }
            label="Project Type"
            value={
              request.project_type
            }
          />
        )}
      </div>
    </section>
  );
}