"use client";

import type {
  DeviceType,
  WorkerRequest,
  WorkerRequestsTabProps,
} from "./types";

import WorkerRequestsController from "./components/WorkerRequestsController";

/* =========================================================
   MAIN WORKER REQUESTS TAB
========================================================= */

export default function WorkerRequestsTab({
  device,
  onRequestCountChange,
  realtimeRequest,
}: WorkerRequestsTabProps) {
  return (
    <WorkerRequestsController
      device={device}
      realtimeRequest={realtimeRequest}
      onRequestCountChange={
        onRequestCountChange
      }
    />
  );
}