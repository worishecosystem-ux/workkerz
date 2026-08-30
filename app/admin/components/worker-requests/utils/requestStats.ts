import type { RequestStatsData, WorkerRequest } from "../types";
import { isToday, normalizeStatus } from "./requestHelpers";

/* =========================================================
   CALCULATE REQUEST STATS
========================================================= */

export function calculateRequestStats(requests: WorkerRequest[]): RequestStatsData {
  const stats: RequestStatsData = {
    total: requests.length,
    pending: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
  };

  for (const request of requests) {
    const status = normalizeStatus(request.status);

    if (status === "pending") stats.pending++;
    if (status === "under_review") stats.under_review++;
    if (status === "accepted") stats.accepted++;
    if (status === "rejected") stats.rejected++;
    if (status === "completed") stats.completed++;
    if (status === "cancelled") stats.cancelled++;

    if (isToday(request.created_at)) stats.today++;
  }

  return stats;
}

/* =========================================================
   STATUS COUNT HELPER
========================================================= */

function getStatusCount(
  requests: WorkerRequest[],
  status: string,
) {
  return requests.filter(
    (request) => normalizeStatus(request.status) === status,
  ).length;
}

/* =========================================================
   PENDING
========================================================= */

export function getPendingRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "pending");
}

/* =========================================================
   UNDER REVIEW
========================================================= */

export function getUnderReviewRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "under_review");
}

/* =========================================================
   ACCEPTED / CONFIRMED
========================================================= */

export function getAcceptedRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "accepted");
}

/* =========================================================
   REJECTED
========================================================= */

export function getRejectedRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "rejected");
}

/* =========================================================
   COMPLETED
========================================================= */

export function getCompletedRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "completed");
}

/* =========================================================
   CANCELLED
========================================================= */

export function getCancelledRequestCount(requests: WorkerRequest[]) {
  return getStatusCount(requests, "cancelled");
}

/* =========================================================
   TODAY
========================================================= */

export function getTodayRequestCount(requests: WorkerRequest[]) {
  return requests.filter((request) => isToday(request.created_at)).length;
}