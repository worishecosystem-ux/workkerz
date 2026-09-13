"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  DeviceType,
  WorkerRequest,
} from "../types";

import {
  getDeletionReason,
  getTrashDate,
} from "../utils/requestHelpers";

/* =========================================================
   PROPS
========================================================= */

type Props = {
  requests?: WorkerRequest[];
  trashRequests?: WorkerRequest[];
  device: DeviceType;

  onView?: (request: WorkerRequest) => void;
  onRestore?: (request: WorkerRequest) => void;
  onPermanentDelete?: (request: WorkerRequest) => void;
  onOpenTrash?: () => void;
  onLeaveTrash?: () => void;

  trashUnlocked?: boolean;
  isSuperAdmin?: boolean;
};

/* =========================================================
   BOARD TYPE
========================================================= */

type BoardType =
  | "requests"
  | "under_review"
  | "confirmed"
  | "completed"
  | "trash";

/* =========================================================
   PAGINATION
========================================================= */

const CARDS_PER_PAGE = 6;

/* =========================================================
   TRASH
========================================================= */

const TRASH_RETENTION_DAYS = 30;

const DAY_MS =
  24 * 60 * 60 * 1000;

/* =========================================================
   BOARDS
========================================================= */

const boards: {
  key: BoardType;
  label: string;
  mobileLabel?: string;
  icon: typeof Inbox;
}[] = [
  {
    key: "requests",
    label: "Requests",
    mobileLabel: "Requests",
    icon: Inbox,
  },
  {
    key: "under_review",
    label: "Under Review",
    mobileLabel: "Review",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    mobileLabel: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "completed",
    label: "Completed",
    mobileLabel: "Done",
    icon: CheckCircle2,
  },
  {
    key: "trash",
    label: "Trash",
    mobileLabel: "Trash",
    icon: Trash2,
  },
];

/* =========================================================
   NORMAL BOARD
========================================================= */

function getNormalBoardRequests(
  requests: WorkerRequest[],
  board: Exclude<BoardType, "trash">,
): WorkerRequest[] {
  const statusMap: Record<
    Exclude<BoardType, "trash">,
    string
  > = {
    requests: "pending",
    under_review: "under_review",
    confirmed: "accepted",
    completed: "completed",
  };

  return requests.filter(
    (request) =>
      request.is_deleted !== true &&
      String(request.status).toLowerCase() ===
        statusMap[board],
  );
}

/* =========================================================
   DELETED AT
========================================================= */

function getDeletedAt(
  request: WorkerRequest,
): string | null {
  const value = (
    request as WorkerRequest & {
      deleted_at?: string | null;
    }
  ).deleted_at;

  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return value;
}

/* =========================================================
   RESTORE WINDOW
========================================================= */

function isWithinRestoreWindow(
  request: WorkerRequest,
): boolean {
  const deletedAt =
    getDeletedAt(request);

  if (!deletedAt) {
    return true;
  }

  const deletedTime =
    new Date(deletedAt).getTime();

  const expiresAt =
    deletedTime +
    TRASH_RETENTION_DAYS * DAY_MS;

  return Date.now() < expiresAt;
}

/* =========================================================
   DAYS REMAINING
========================================================= */

function getDaysRemaining(
  request: WorkerRequest,
): number | null {
  const deletedAt =
    getDeletedAt(request);

  if (!deletedAt) return null;

  const deletedTime =
    new Date(deletedAt).getTime();

  if (Number.isNaN(deletedTime)) {
    return null;
  }

  const expiresAt =
    deletedTime +
    TRASH_RETENTION_DAYS * DAY_MS;

  const remaining =
    expiresAt - Date.now();

  if (remaining <= 0) {
    return 0;
  }

  return Math.ceil(
    remaining / DAY_MS,
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function BookingBoard({
  requests = [],
  trashRequests = [],
  device,
  onView,
  onRestore,
  onPermanentDelete,
  onOpenTrash,
  onLeaveTrash,
  trashUnlocked = false,
  isSuperAdmin = false,
}: Props) {
  const isMobile =
    device === "mobile";

  const [
    activeBoard,
    setActiveBoard,
  ] = useState<BoardType>("requests");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    expiryTick,
    setExpiryTick,
  ] = useState(0);

  /* =======================================================
     EXPIRY REFRESH
  ======================================================= */

  useEffect(() => {
    if (activeBoard !== "trash") {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setExpiryTick(
            (value) => value + 1,
          );
        },
        60 * 1000,
      );

    return () =>
      window.clearInterval(interval);
  }, [activeBoard]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      requests:
        getNormalBoardRequests(
          requests,
          "requests",
        ).length,

      under_review:
        getNormalBoardRequests(
          requests,
          "under_review",
        ).length,

      confirmed:
        getNormalBoardRequests(
          requests,
          "confirmed",
        ).length,

      completed:
        getNormalBoardRequests(
          requests,
          "completed",
        ).length,

      trash:
        trashRequests.filter(
          (request) =>
            request.is_deleted === true,
        ).length,
    }),
    [requests, trashRequests],
  );

  /* =======================================================
     ACTIVE REQUESTS
  ======================================================= */

  const activeRequests = useMemo(() => {
    void expiryTick;

    if (activeBoard === "trash") {
      if (
        !isSuperAdmin ||
        !trashUnlocked
      ) {
        return [];
      }

      return trashRequests.filter(
        (request) =>
          request.is_deleted === true,
      );
    }

    return getNormalBoardRequests(
      requests,
      activeBoard,
    );
  }, [
    requests,
    trashRequests,
    activeBoard,
    isSuperAdmin,
    trashUnlocked,
    expiryTick,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        activeRequests.length /
          CARDS_PER_PAGE,
      ),
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedRequests =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        CARDS_PER_PAGE;

      return activeRequests.slice(
        start,
        start + CARDS_PER_PAGE,
      );
    }, [
      activeRequests,
      currentPage,
    ]);

  /* =======================================================
     ACTIVE CONFIG
  ======================================================= */

  const activeConfig =
    boards.find(
      (board) =>
        board.key === activeBoard,
    );

  /* =======================================================
     BOARD CHANGE
  ======================================================= */

  const handleBoardChange = (
    board: BoardType,
  ) => {
    if (board === "trash") {
      if (!isSuperAdmin) {
        onOpenTrash?.();
        return;
      }

      onOpenTrash?.();
      return;
    }

    if (activeBoard === "trash") {
      onLeaveTrash?.();
    }

    setActiveBoard(board);
    setCurrentPage(1);
  };

  /* =======================================================
     OPEN TRASH AFTER PIN
  ======================================================= */

  useEffect(() => {
    if (
      trashUnlocked &&
      isSuperAdmin
    ) {
      setActiveBoard("trash");
      setCurrentPage(1);
    }
  }, [
    trashUnlocked,
    isSuperAdmin,
  ]);

  /* =======================================================
     SAFETY LOCK
  ======================================================= */

  useEffect(() => {
    if (
      activeBoard === "trash" &&
      (!isSuperAdmin ||
        !trashUnlocked)
    ) {
      setActiveBoard("requests");
      setCurrentPage(1);
    }
  }, [
    activeBoard,
    isSuperAdmin,
    trashUnlocked,
  ]);

  /* =======================================================
     PAGINATION RANGE
  ======================================================= */

  const firstItem =
    activeRequests.length === 0
      ? 0
      : (currentPage - 1) *
          CARDS_PER_PAGE +
        1;

  const lastItem =
    Math.min(
      currentPage *
        CARDS_PER_PAGE,
      activeRequests.length,
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className={`
        w-full
        ${
          isMobile
            ? "mt-2"
            : "mt-5"
        }
      `}
    >
      {/* ===================================================
          TABS
      =================================================== */}

      <div
        className={`
          overflow-hidden
          border-b
          border-gray-200
          bg-white
          ${
            isMobile
              ? "rounded-t-xl"
              : "rounded-t-2xl"
          }
        `}
      >
        <div
          className="
            flex
            w-full
            overflow-x-auto
            scrollbar-none
          "
        >
          {boards.map((board) => {
            const active =
              activeBoard === board.key;

            const Icon = board.icon;

            const count =
              counts[board.key];

            const isTrash =
              board.key === "trash";

            return (
              <button
                key={board.key}
                type="button"
                onClick={() =>
                  handleBoardChange(
                    board.key,
                  )
                }
                className={`
                  relative
                  flex
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  font-black
                  transition
                  ${
                    isMobile
                      ? "min-w-[82px] px-3 py-2.5 text-[9px]"
                      : "px-5 py-3 text-[10px]"
                  }
                  ${
                    active
                      ? "text-[#FF5C39]"
                      : "text-[#64748B]"
                  }
                `}
              >
                <Icon
                  className={`
                    shrink-0
                    ${
                      isMobile
                        ? "h-3 w-3"
                        : "h-3.5 w-3.5"
                    }
                    ${
                      active
                        ? "text-[#FF5C39]"
                        : "text-[#94A3B8]"
                    }
                  `}
                />

                <span className="whitespace-nowrap">
                  {isMobile
                    ? board.mobileLabel ??
                      board.label
                    : board.label}
                </span>

                <span
                  className={`
                    flex
                    min-w-[17px]
                    items-center
                    justify-center
                    rounded-full
                    px-1
                    py-0.5
                    text-[7px]
                    font-black
                    ${
                      active
                        ? "bg-orange-50 text-[#FF5C39]"
                        : "bg-gray-100 text-[#64748B]"
                    }
                  `}
                >
                  {count}
                </span>

                {isTrash && (
                  <LockKeyhole
                    className="
                      h-2.5
                      w-2.5
                      text-[#94A3B8]
                    "
                  />
                )}

                {active && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-2
                      right-2
                      h-[2px]
                      rounded-full
                      bg-[#FF5C39]
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className={`
          flex
          items-center
          justify-between
          gap-3
          ${
            isMobile
              ? "px-0 py-2.5"
              : "px-1 py-4"
          }
        `}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2
              className={`
                truncate
                font-black
                text-[#172033]
                ${
                  isMobile
                    ? "text-xs"
                    : "text-sm"
                }
              `}
            >
              {activeConfig?.label}
            </h2>

            {activeBoard ===
              "trash" && (
              <span
                className="
                  shrink-0
                  rounded-full
                  bg-red-50
                  px-1.5
                  py-0.5
                  text-[6px]
                  font-black
                  text-red-600
                "
              >
                SECURED
              </span>
            )}
          </div>

          <p
            className={`
              mt-0.5
              truncate
              font-medium
              text-[#94A3B8]
              ${
                isMobile
                  ? "text-[8px]"
                  : "text-[9px]"
              }
            `}
          >
            {getBoardDescription(
              activeBoard,
            )}
          </p>
        </div>

        <span
          className={`
            shrink-0
            font-bold
            text-[#94A3B8]
            ${
              isMobile
                ? "text-[8px]"
                : "text-[10px]"
            }
          `}
        >
          {activeRequests.length}{" "}
          {activeRequests.length === 1
            ? "booking"
            : "bookings"}
        </span>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      {activeRequests.length === 0 ? (
        <EmptyBoard
          board={activeBoard}
          mobile={isMobile}
        />
      ) : (
        <>
          {/* =================================================
              CARDS
          ================================================= */}

          <div
            className={`
              grid
              ${
                isMobile
                  ? "grid-cols-1 gap-2"
                  : "grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
              }
            `}
          >
            {paginatedRequests.map(
              (request) => (
                <BookingCard
                  key={request.id}
                  request={request}
                  board={activeBoard}
                  mobile={isMobile}
                  onView={() =>
                    onView?.(request)
                  }
                  onRestore={() =>
                    onRestore?.(request)
                  }
                  onPermanentDelete={() =>
                    onPermanentDelete?.(
                      request,
                    )
                  }
                />
              ),
            )}
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (
            <div
              className={`
                flex
                items-center
                justify-between
                gap-2
                border
                border-gray-100
                bg-white
                ${
                  isMobile
                    ? "mt-3 rounded-xl px-2.5 py-2"
                    : "mt-4 rounded-xl px-3 py-2.5"
                }
              `}
            >
              <p
                className={`
                  font-bold
                  text-[#94A3B8]
                  ${
                    isMobile
                      ? "text-[8px]"
                      : "text-[9px]"
                  }
                `}
              >
                Showing{" "}
                <span className="text-[#172033]">
                  {firstItem}
                </span>
                –
                <span className="text-[#172033]">
                  {lastItem}
                </span>{" "}
                of{" "}
                <span className="text-[#172033]">
                  {activeRequests.length}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    font-black
                    text-[#64748B]
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    ${
                      isMobile
                        ? "h-7 w-7"
                        : "h-8 px-2.5 text-[9px]"
                    }
                  `}
                >
                  <ChevronLeft
                    className={
                      isMobile
                        ? "h-3 w-3"
                        : "h-3.5 w-3.5"
                    }
                  />

                  {!isMobile &&
                    "Previous"}
                </button>

                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#F8FAFC]
                    font-black
                    text-[#172033]
                    ${
                      isMobile
                        ? "h-7 min-w-[42px] px-1 text-[8px]"
                        : "h-8 min-w-[48px] px-2 text-[9px]"
                    }
                  `}
                >
                  {currentPage}
                  {" / "}
                  {totalPages}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    bg-[#172033]
                    font-black
                    text-white
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    ${
                      isMobile
                        ? "h-7 w-7"
                        : "h-8 px-2.5 text-[9px]"
                    }
                  `}
                >
                  {!isMobile &&
                    "Next"}

                  <ChevronRight
                    className={
                      isMobile
                        ? "h-3 w-3"
                        : "h-3.5 w-3.5"
                    }
                  />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* =========================================================
   DESCRIPTION
========================================================= */

function getBoardDescription(
  board: BoardType,
) {
  const descriptions: Record<
    BoardType,
    string
  > = {
    requests:
      "New worker booking requests",

    under_review:
      "Requests currently under review",

    confirmed:
      "Confirmed worker bookings",

    completed:
      "Successfully completed bookings",

    trash:
      "Deleted requests kept safely in trash",
  };

  return descriptions[board];
}

/* =========================================================
   EMPTY BOARD
========================================================= */

function EmptyBoard({
  board,
  mobile,
}: {
  board: BoardType;
  mobile: boolean;
}) {
  const config =
    boards.find(
      (item) =>
        item.key === board,
    );

  const Icon =
    config?.icon ?? Inbox;

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-gray-200
        bg-white
        px-5
        text-center
        ${
          mobile
            ? "min-h-[220px]"
            : "min-h-[300px]"
        }
      `}
    >
      <div
        className={`
          flex
          items-center
          justify-center
          rounded-full
          ${
            mobile
              ? "h-10 w-10"
              : "h-12 w-12"
          }
          ${
            board === "trash"
              ? "bg-red-50 text-red-400"
              : "bg-gray-50 text-gray-400"
          }
        `}
      >
        {board === "trash" ? (
          <Trash2
            className={
              mobile
                ? "h-4 w-4"
                : "h-5 w-5"
            }
          />
        ) : (
          <Icon
            className={
              mobile
                ? "h-4 w-4"
                : "h-5 w-5"
            }
          />
        )}
      </div>

      <p
        className={`
          mt-3
          font-black
          text-[#172033]
          ${
            mobile
              ? "text-[11px]"
              : "text-xs"
          }
        `}
      >
        {board === "trash"
          ? "Trash is empty"
          : `No ${config?.label}`}
      </p>

      <p
        className={`
          mt-1
          max-w-xs
          leading-4
          text-[#94A3B8]
          ${
            mobile
              ? "text-[8px]"
              : "text-[9px]"
          }
        `}
      >
        {getEmptyText(board)}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY TEXT
========================================================= */

function getEmptyText(
  board: BoardType,
) {
  const text: Record<
    BoardType,
    string
  > = {
    requests:
      "New worker booking requests will appear here.",

    under_review:
      "Requests under review will appear here.",

    confirmed:
      "Confirmed bookings will appear here.",

    completed:
      "Completed bookings will appear here.",

    trash:
      "Requests moved to trash will appear here.",
  };

  return text[board];
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  request,
  board,
  mobile,
  onView,
  onRestore,
  onPermanentDelete,
}: {
  request: WorkerRequest;
  board: BoardType;
  mobile: boolean;
  onView: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
}) {
  const [
    showPermanentDeleteConfirm,
    setShowPermanentDeleteConfirm,
  ] = useState(false);

  const restoreAllowed =
    isWithinRestoreWindow(
      request,
    );

  const daysRemaining =
    getDaysRemaining(request);

  const title =
    request.project_name ||
    request.category ||
    "Worker Request";

  const customer =
    request.requester_name ||
    request.company_name ||
    "Customer";

  /* =======================================================
     TRASH CARD
  ======================================================= */

  if (board === "trash") {
    return (
      <>
        <article
          className={`
            group
            min-w-0
            overflow-hidden
            border
            border-red-100
            bg-white
            shadow-[0_1px_4px_rgba(15,23,42,0.04)]
            ${
              mobile
                ? "rounded-xl"
                : "rounded-2xl"
            }
          `}
        >
          <div
            className={
              mobile
                ? "p-2.5"
                : "p-3.5"
            }
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`
                  flex
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-500
                  ${
                    mobile
                      ? "h-8 w-8"
                      : "h-9 w-9"
                  }
                `}
              >
                <Trash2
                  className={
                    mobile
                      ? "h-3.5 w-3.5"
                      : "h-4 w-4"
                  }
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className={`
                        truncate
                        font-black
                        text-[#172033]
                        ${
                          mobile
                            ? "text-[10px]"
                            : "text-xs"
                        }
                      `}
                    >
                      {title}
                    </h3>

                    <p
                      className={`
                        mt-0.5
                        truncate
                        font-medium
                        text-[#64748B]
                        ${
                          mobile
                            ? "text-[8px]"
                            : "text-[9px]"
                        }
                      `}
                    >
                      {customer}
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-red-50
                      px-1.5
                      py-0.5
                      text-[7px]
                      font-black
                      text-red-600
                    "
                  >
                    Trashed
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`
                space-y-1.5
                border-t
                border-gray-50
                ${
                  mobile
                    ? "mt-2 pt-2"
                    : "mt-2.5 pt-2.5"
                }
              `}
            >
              <div className="rounded-md bg-red-50/60 px-2 py-1.5">
                <p className="text-[7px] font-black uppercase tracking-wide text-red-400">
                  Delete Reason
                </p>

                <p className="mt-0.5 text-[9px] font-bold leading-4 text-red-700">
                  {getDeletionReason(
                    request,
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#94A3B8]">
                <Clock3 className="h-3 w-3 shrink-0" />

                <span className="truncate">
                  Deleted{" "}
                  {getTrashDate(request)}
                </span>
              </div>

              {restoreAllowed &&
              daysRemaining !== null ? (
                <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5 text-[8px] font-black text-emerald-600">
                  <RotateCcw className="h-3 w-3 shrink-0" />

                  <span>
                    Restore available for{" "}
                    {daysRemaining}{" "}
                    {daysRemaining === 1
                      ? "day"
                      : "days"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1.5 text-[8px] font-black text-gray-500">
                  <Clock3 className="h-3 w-3 shrink-0" />

                  <span>
                    30-day restore period expired
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#94A3B8]">
                <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[7px] font-black text-gray-500">
                  {String(
                    request.status ||
                      "unknown",
                  )
                    .replace(
                      /_/g,
                      " ",
                    )
                    .toUpperCase()}
                </span>

                <span>
                  Original status
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 border-t border-gray-100 bg-[#FAFAFA] p-2">
            <button
              type="button"
              disabled={!restoreAllowed}
              onClick={
                restoreAllowed
                  ? onRestore
                  : undefined
              }
              className={`
                flex
                h-8
                items-center
                justify-center
                gap-1
                rounded-lg
                border
                text-[9px]
                font-black
                transition
                ${
                  restoreAllowed
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                }
              `}
            >
              <RotateCcw className="h-3 w-3" />

              {restoreAllowed
                ? "Restore"
                : "Expired"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPermanentDeleteConfirm(
                  true,
                )
              }
              className="
                flex
                h-8
                items-center
                justify-center
                gap-1
                rounded-lg
                border
                border-red-100
                bg-red-50
                text-[9px]
                font-black
                text-red-600
                transition
                hover:bg-red-100
              "
            >
              <Trash2 className="h-3 w-3" />
              Delete Forever
            </button>
          </div>
        </article>

        {showPermanentDeleteConfirm && (
          <div
            className="
              fixed
              inset-0
              z-[300]
              flex
              items-center
              justify-center
              bg-black/45
              px-4
              backdrop-blur-sm
            "
          >
            <div
              className="
                w-full
                max-w-[340px]
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-[#172033]">
                    Delete Permanently?
                  </h3>

                  <p className="mt-0.5 text-[9px] font-medium text-[#94A3B8]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-[10px] font-medium leading-5 text-[#64748B]">
                  Are you sure you want to permanently
                  delete this request?
                </p>

                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <p className="truncate text-[10px] font-black text-red-700">
                    {title}
                  </p>

                  <p className="mt-0.5 truncate text-[8px] font-medium text-red-500">
                    {customer}
                  </p>
                </div>

                <p className="mt-3 text-[8px] font-bold leading-4 text-red-500">
                  Once deleted forever, this request
                  cannot be restored.
                </p>
              </div>

              <div className="flex gap-2 border-t border-gray-100 bg-[#FAFAFA] px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowPermanentDeleteConfirm(
                      false,
                    )
                  }
                  className="
                    flex
                    h-9
                    flex-1
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    text-[9px]
                    font-black
                    text-[#64748B]
                    transition
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPermanentDeleteConfirm(
                      false,
                    );

                    onPermanentDelete();
                  }}
                  className="
                    flex
                    h-9
                    flex-1
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    bg-red-600
                    text-[9px]
                    font-black
                    text-white
                    transition
                    hover:bg-red-700
                    active:scale-[0.98]
                  "
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* =======================================================
     NORMAL CARD
  ======================================================= */

  return (
    <article
      className={`
        group
        min-w-0
        overflow-hidden
        border
        border-gray-100
        bg-white
        shadow-[0_1px_4px_rgba(15,23,42,0.04)]
        transition
        hover:border-gray-200
        hover:shadow-sm
        ${
          mobile
            ? "rounded-xl"
            : "rounded-2xl"
        }
      `}
    >
      <div
        className={
          mobile
            ? "p-2.5"
            : "p-3.5"
        }
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`
              flex
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-orange-50
              text-[#FF5C39]
              ${
                mobile
                  ? "h-8 w-8"
                  : "h-9 w-9"
              }
            `}
          >
            <Users
              className={
                mobile
                  ? "h-3.5 w-3.5"
                  : "h-4 w-4"
              }
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`
                    truncate
                    font-black
                    text-[#172033]
                    ${
                      mobile
                        ? "text-[10px]"
                        : "text-xs"
                    }
                  `}
                >
                  {title}
                </h3>

                <p
                  className={`
                    mt-0.5
                    truncate
                    font-medium
                    text-[#64748B]
                    ${
                      mobile
                        ? "text-[8px]"
                        : "text-[9px]"
                    }
                  `}
                >
                  {customer}
                </p>
              </div>

              <StatusPill
                board={
                  board as Exclude<
                    BoardType,
                    "trash"
                  >
                }
                mobile={mobile}
              />
            </div>
          </div>
        </div>

        {/* META */}

        <div
          className={`
            grid
            grid-cols-2
            border-t
            border-gray-50
            ${
              mobile
                ? "mt-2 gap-1 pt-2"
                : "mt-2.5 gap-1.5 pt-2.5"
            }
          `}
        >
          <MiniMeta
            icon={<Users />}
            value={`${request.workers_required} workers`}
            mobile={mobile}
          />

          <MiniMeta
            icon={<CalendarDays />}
            value={
              request.work_date ||
              "Date pending"
            }
            mobile={mobile}
          />

          <MiniMeta
            icon={<Clock3 />}
            value={
              request.start_time ||
              "Time pending"
            }
            mobile={mobile}
          />

          <MiniMeta
            icon={<MapPin />}
            value={
              request.location ||
              "Location pending"
            }
            mobile={mobile}
          />
        </div>
      </div>

      {/* FOOTER */}

      <div
        className={`
          flex
          items-center
          justify-between
          gap-2
          border-t
          border-gray-100
          bg-[#FAFAFA]
          ${
            mobile
              ? "px-2.5 py-2"
              : "px-3.5 py-2.5"
          }
        `}
      >
        <div className="min-w-0">
          <p
            className={`
              truncate
              font-bold
              uppercase
              tracking-wide
              text-[#94A3B8]
              ${
                mobile
                  ? "text-[7px]"
                  : "text-[8px]"
              }
            `}
          >
            {request.project_type ||
              "Worker booking"}
          </p>

          <p
            className={`
              mt-0.5
              truncate
              font-black
              text-[#FF5C39]
              ${
                mobile
                  ? "text-[9px]"
                  : "text-[10px]"
              }
            `}
          >
            {request.budget != null
              ? `₹${request.budget}`
              : "Budget not specified"}
          </p>
        </div>

        <button
          type="button"
          onClick={onView}
          className={`
            flex
            shrink-0
            items-center
            gap-1
            rounded-lg
            bg-[#172033]
            font-black
            text-white
            transition
            hover:bg-[#101827]
            active:scale-[0.98]
            ${
              mobile
                ? "px-2.5 py-1.5 text-[8px]"
                : "px-3 py-1.5 text-[9px]"
            }
          `}
        >
          View

          <ArrowRight
            className={
              mobile
                ? "h-2.5 w-2.5"
                : "h-3 w-3"
            }
          />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  board,
  mobile,
}: {
  board: Exclude<
    BoardType,
    "trash"
  >;
  mobile: boolean;
}) {
  const config: Record<
    Exclude<BoardType, "trash">,
    {
      label: string;
      mobileLabel: string;
      className: string;
    }
  > = {
    requests: {
      label: "New",
      mobileLabel: "New",
      className:
        "bg-orange-50 text-[#FF5C39]",
    },

    under_review: {
      label: "Under Review",
      mobileLabel: "Review",
      className:
        "bg-amber-50 text-amber-600",
    },

    confirmed: {
      label: "Confirmed",
      mobileLabel: "Confirmed",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    completed: {
      label: "Completed",
      mobileLabel: "Done",
      className:
        "bg-blue-50 text-blue-600",
    },
  };

  const current =
    config[board];

  return (
    <span
      className={`
        shrink-0
        rounded-full
        px-1.5
        py-0.5
        font-black
        ${
          mobile
            ? "text-[7px]"
            : "px-2 py-1 text-[8px]"
        }
        ${current.className}
      `}
    >
      {mobile
        ? current.mobileLabel
        : current.label}
    </span>
  );
}

/* =========================================================
   MINI META
========================================================= */

function MiniMeta({
  icon,
  value,
  mobile,
}: {
  icon: ReactNode;
  value: string;
  mobile: boolean;
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-1
        rounded-md
        bg-[#F8FAFC]
        font-bold
        text-[#64748B]
        ${
          mobile
            ? "px-1.5 py-1.5 text-[7px]"
            : "px-1.5 py-1.5 text-[8px]"
        }
      `}
    >
      <span
        className="
          shrink-0
          text-[#94A3B8]
          [&>svg]:h-3
          [&>svg]:w-3
        "
      >
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}