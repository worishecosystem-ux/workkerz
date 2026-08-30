import type {
  RequestStatus,
  WorkerRequest,
} from "../types";

/* =========================================================
   STATUS
========================================================= */

export function normalizeStatus(
  status?: string | null,
): RequestStatus {
  const value = String(
    status || "pending",
  )
    .trim()
    .toLowerCase();

  const aliases: Record<
    string,
    RequestStatus
  > = {
    pending: "pending",

    under_review: "under_review",
    "under-review": "under_review",
    review: "under_review",

    accepted: "accepted",
    confirmed: "accepted",

    rejected: "rejected",

    completed: "completed",

    cancelled: "cancelled",
    canceled: "cancelled",
  };

  return (
    aliases[value] || "pending"
  );
}

/* =========================================================
   STATUS LABEL
========================================================= */

export function getStatusLabel(
  status?: string | null,
) {
  const normalized =
    normalizeStatus(status);

  const labels: Record<
    RequestStatus,
    string
  > = {
    pending: "Pending",
    under_review: "Under Review",
    accepted: "Confirmed",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[normalized];
}

/* =========================================================
   STATUS DOT
========================================================= */

export function getStatusDotClass(
  status?: string | null,
) {
  const normalized =
    normalizeStatus(status);

  const classes: Record<
    RequestStatus,
    string
  > = {
    pending: "bg-[#FF5C39]",
    under_review: "bg-blue-500",
    accepted: "bg-emerald-500",
    rejected: "bg-red-500",
    completed: "bg-blue-500",
    cancelled: "bg-gray-400",
  };

  return classes[normalized];
}

/* =========================================================
   STATUS BADGE
========================================================= */

export function getStatusBadgeClass(
  status?: string | null,
) {
  const normalized =
    normalizeStatus(status);

  const classes: Record<
    RequestStatus,
    string
  > = {
    pending:
      "bg-orange-50 text-[#FF5C39] border-orange-100",

    under_review:
      "bg-blue-50 text-blue-600 border-blue-100",

    accepted:
      "bg-emerald-50 text-emerald-700 border-emerald-100",

    rejected:
      "bg-red-50 text-red-600 border-red-100",

    completed:
      "bg-blue-50 text-blue-700 border-blue-100",

    cancelled:
      "bg-gray-100 text-gray-500 border-gray-200",
  };

  return classes[normalized];
}

/* =========================================================
   REQUEST TITLE
========================================================= */

export function getRequestTitle(
  request: WorkerRequest,
) {
  return (
    request.project_name ||
    request.category ||
    "Worker Request"
  );
}

/* =========================================================
   REQUESTER NAME
========================================================= */

export function getRequesterName(
  request: WorkerRequest,
) {
  return (
    request.requester_name ||
    request.company_name ||
    "Customer"
  );
}

/* =========================================================
   WORKER LABEL
========================================================= */

export function getWorkerLabel(
  count?: number | null,
) {
  const workers = Number(
    count || 0,
  );

  return `${workers} Worker${
    workers === 1 ? "" : "s"
  }`;
}

/* =========================================================
   TOTAL WORKERS
========================================================= */

export function getTotalWorkers(
  request: WorkerRequest,
) {
  if (
    typeof request.total_workers ===
      "number" &&
    request.total_workers > 0
  ) {
    return request.total_workers;
  }

  if (
    typeof request.workers_required ===
    "number"
  ) {
    return request.workers_required;
  }

  if (
    Array.isArray(
      request.requirements,
    )
  ) {
    return request.requirements.reduce(
      (total, group) =>
        total +
        Number(
          group.workers_required || 0,
        ),
      0,
    );
  }

  return 0;
}

/* =========================================================
   BUDGET
========================================================= */

export function formatBudget(
  budget?: number | null,
) {
  if (
    budget === null ||
    budget === undefined ||
    Number.isNaN(Number(budget))
  ) {
    return "Not specified";
  }

  return `₹${Number(
    budget,
  ).toLocaleString("en-IN")}`;
}

/* =========================================================
   DATE
========================================================= */

export function formatDate(
  date?: string | null,
) {
  if (!date) {
    return "Not specified";
  }

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

/* =========================================================
   SHORT DATE
========================================================= */

export function formatShortDate(
  date?: string | null,
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    },
  );
}

/* =========================================================
   TIME
========================================================= */

export function formatTime(
  time?: string | null,
) {
  if (!time) {
    return "Not specified";
  }

  if (
    time
      .toLowerCase()
      .includes("am") ||
    time
      .toLowerCase()
      .includes("pm")
  ) {
    return time;
  }

  const parts = time.split(":");

  if (parts.length < 2) {
    return time;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );
}

/* =========================================================
   CREATED DATE
========================================================= */

export function formatCreatedAt(
  date?: string | null,
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );
}

/* =========================================================
   TODAY CHECK
========================================================= */

export function isToday(
  date?: string | null,
) {
  if (!date) return false;

  const parsed = new Date(date);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return false;
  }

  const today = new Date();

  return (
    parsed.getDate() ===
      today.getDate() &&
    parsed.getMonth() ===
      today.getMonth() &&
    parsed.getFullYear() ===
      today.getFullYear()
  );
}

/* =========================================================
   WORK ADDRESS
========================================================= */

export function getWorkAddress(
  request: WorkerRequest,
) {
  if (
    request.full_address?.trim()
  ) {
    return request.full_address;
  }

  if (
    request.location?.trim()
  ) {
    return request.location;
  }

  const addressParts = [
    request.locality,
    request.district,
    request.state,
    request.pincode,
  ].filter(Boolean);

  if (addressParts.length) {
    return addressParts.join(", ");
  }

  if (
    request.requester_address?.trim()
  ) {
    return request.requester_address;
  }

  return "Address not available";
}

/* =========================================================
   LOCATION
========================================================= */

export function getLocationLabel(
  request: WorkerRequest,
) {
  return (
    request.locality ||
    request.district ||
    request.location ||
    "Location unavailable"
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

export function getRequirement(
  request: WorkerRequest,
) {
  return (
    request.requirement?.trim() ||
    "No specific requirement provided."
  );
}

/* =========================================================
   WORKER GROUPS
========================================================= */

export function getWorkerGroups(
  request: WorkerRequest,
) {
  if (
    !Array.isArray(
      request.requirements,
    )
  ) {
    return [];
  }

  return request.requirements.filter(
    (group) =>
      group &&
      group.category &&
      Number(
        group.workers_required,
      ) > 0,
  );
}

/* =========================================================
   REQUEST AGE
========================================================= */

export function getRequestAge(
  date?: string | null,
) {
  if (!date) return "";

  const created = new Date(date);

  if (
    Number.isNaN(
      created.getTime(),
    )
  ) {
    return "";
  }

  const minutes = Math.floor(
    (Date.now() -
      created.getTime()) /
      60000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatShortDate(date);
}

/* =========================================================
   SEARCH TEXT
========================================================= */

export function getRequestSearchText(
  request: WorkerRequest,
) {
  return [
    request.project_name,
    request.project_type,
    request.category,
    request.location,
    request.full_address,
    request.locality,
    request.district,
    request.state,
    request.pincode,
    request.requester_name,
    request.requester_mobile,
    request.requester_email,
    request.company_name,
    request.requirement,
    request.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================================================
   TRASH
========================================================= */

export function isTrashed(
  request: WorkerRequest,
) {
  return request.is_deleted === true;
}

export function getDeletionReason(
  request: WorkerRequest,
) {
  return (
    request.deletion_reason?.trim() ||
    "No reason provided"
  );
}

export function getTrashDate(
  request: WorkerRequest,
) {
  if (!request.deleted_at) {
    return "—";
  }

  const date = new Date(
    request.deleted_at,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return request.deleted_at;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );
}