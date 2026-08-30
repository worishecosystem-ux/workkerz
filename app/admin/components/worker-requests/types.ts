/* =========================================================
   DEVICE
========================================================= */

export type DeviceType =
  | "mobile"
  | "tablet"
  | "desktop";

/* =========================================================
   REQUEST STATUS
========================================================= */

export type RequestStatus =
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

/* =========================================================
   ADMIN STATUS UPDATE
========================================================= */

export type StatusType =
  | "under_review"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

/* =========================================================
   FILTER
========================================================= */

export type RequestFilter =
  | "all"
  | "pending"
  | "under_review"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

/* =========================================================
   SORT
========================================================= */

export type RequestSort =
  | "newest"
  | "oldest"
  | "workers_high"
  | "workers_low"
  | "budget_high"
  | "budget_low";

/* =========================================================
   WORKER REQUIREMENT
========================================================= */

export type WorkerRequirement = {
  category: string;
  workers_required: number;
};

/* =========================================================
   WORKER REQUEST
========================================================= */

export type WorkerRequest = {
  id: string;

  /* WORK DETAILS */

  workers_required: number;
  category: string;
  work_date: string;

  start_time?: string | null;
  duration?: string | null;
  budget?: number | null;

  requirement?: string | null;

  requirements?: WorkerRequirement[] | null;

  /* LOCATION */

  location: string;

  full_address?: string | null;
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;

  /* PROJECT */

  project_name?: string | null;
  project_type?: string | null;
  total_workers?: number | null;

  /* REQUESTER */

  requester_type?: string | null;
  requester_name?: string | null;
  requester_mobile?: string | null;
  requester_email?: string | null;

  company_name?: string | null;
  gstin?: string | null;
  requester_address?: string | null;
  requester_user_id?: string | null;

  /* META */

  status: RequestStatus;

  source?: string | null;

  created_at: string;

  /* =======================================================
     TRASH
  ======================================================= */

  is_deleted?: boolean | null;

  deleted_at?: string | null;

  deletion_reason?: string | null;
};

/* =========================================================
   REQUEST STATS
========================================================= */

export type RequestStatsData = {
  total: number;
  pending: number;
  under_review: number;
  accepted: number;
  rejected: number;
  completed: number;
  cancelled: number;
  today: number;
};

/* =========================================================
   NOTIFICATION TYPE
========================================================= */

export type RequestNotificationType =
  | "request_created"
  | "request_under_review"
  | "request_accepted"
  | "request_rejected"
  | "worker_assigned"
  | "work_started"
  | "work_completed"
  | "request_cancelled";

/* =========================================================
   REQUEST NOTIFICATION
========================================================= */

export type RequestNotification = {
  id?: string;

  type: RequestNotificationType;

  title: string;
  message: string;

  request_id: string;

  customer_user_id?: string | null;
  customer_email?: string | null;

  is_read?: boolean;

  created_at?: string;
};

/* =========================================================
   MAIN COMPONENT PROPS
========================================================= */

export type WorkerRequestsTabProps = {
  device: DeviceType;

  onRequestCountChange?: (
    count: number,
  ) => void;

  realtimeRequest?: WorkerRequest | null;
};