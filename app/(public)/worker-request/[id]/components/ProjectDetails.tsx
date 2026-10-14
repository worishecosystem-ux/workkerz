
"use client";

import {
  Building2,
  FolderKanban,
  BriefcaseBusiness,
} from "lucide-react";

import type { WorkerRequest } from "./types";

interface ProjectDetailsProps {
  request: WorkerRequest;
}

interface ProjectItemProps {
  icon: typeof Building2;
  label: string;
  value?: string | null;
}

function ProjectItem({
  icon: Icon,
  label,
  value,
}: ProjectItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-green-100 bg-green-50/50 p-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-green-100">
        <Icon
          className="h-4 w-4 text-green-700"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-semibold leading-5 text-gray-900">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function ProjectDetails({
  request,
}: ProjectDetailsProps) {
  const hasProjectDetails = Boolean(
    request.project_name?.trim() ||
      request.project_type?.trim()
  );

  return (
    <section className="w-full min-w-0 rounded-xl border border-green-100 bg-white p-3 shadow-sm sm:p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <FolderKanban
            className="h-4 w-4 text-green-700"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900">
            Project Details
          </h2>

          <p className="text-[11px] leading-4 text-gray-500">
            Project information associated with this request
          </p>
        </div>
      </div>

      {/* Project Information */}
      {!hasProjectDetails ? (
        <div className="rounded-lg border border-dashed border-green-200 bg-green-50/50 px-3 py-5 text-center">
          <BriefcaseBusiness
            className="mx-auto h-6 w-6 text-green-700"
            aria-hidden="true"
          />

          <p className="mt-2 text-xs font-semibold text-gray-700">
            No project details available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <ProjectItem
            icon={Building2}
            label="Project Name"
            value={request.project_name}
          />

          <ProjectItem
            icon={FolderKanban}
            label="Project Type"
            value={request.project_type}
          />
        </div>
      )}
    </section>
  );
}