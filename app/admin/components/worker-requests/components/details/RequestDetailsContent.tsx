"use client";

import type { WorkerRequest } from "../../types";

import ProjectCard from "./ProjectCard";
import WorkDetailsCard from "./WorkDetailsCard";
import WorkerGroupsCard from "./WorkerGroupsCard";
import RequesterCard from "./RequesterCard";
import WorkLocationCard from "./WorkLocationCard";
import SourceCard from "./SourceCard";

import RequestReasonCard from "../card/RequestReasonCard";

type Props = {
  request: WorkerRequest;

  compact?: boolean;
};

export default function RequestDetailsContent({
  request,
  compact = false,
}: Props) {
  return (
    <div
      className={`
        space-y-3
        ${
          compact
            ? "space-y-3"
            : "space-y-4"
        }
      `}
    >
      {/* =================================================
          PROJECT
      ================================================= */}

      <ProjectCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          WORK DETAILS
      ================================================= */}

      <WorkDetailsCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          WORKER GROUPS
      ================================================= */}

      <WorkerGroupsCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          REQUIREMENT / REASON
      ================================================= */}

      <RequestReasonCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          REQUESTER
      ================================================= */}

      <RequesterCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          LOCATION
      ================================================= */}

      <WorkLocationCard
        request={request}
        compact={compact}
      />

      {/* =================================================
          SOURCE
      ================================================= */}

      <SourceCard
        request={request}
        compact={compact}
      />
    </div>
  );
}