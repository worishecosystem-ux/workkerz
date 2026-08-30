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

  onView?: (
    request: WorkerRequest,
  ) => void;

  onRestore?: (
    request: WorkerRequest,
  ) => void;

  onPermanentDelete?: (
    request: WorkerRequest,
  ) => void;

  onOpenTrash?: () => void;

  /*
   * Called whenever user leaves Trash.
   * Controller should set trashUnlocked(false).
   */
  onLeaveTrash?: () => void;

  /*
   * True only after successful PIN verification.
   */
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
   TRASH RETENTION
========================================================= */

const TRASH_RETENTION_DAYS = 30;

const DAY_MS =
  24 *
  60 *
  60 *
  1000;

/* =========================================================
   BOARD CONFIG
========================================================= */

const boards: {
  key: BoardType;
  label: string;
  icon: typeof Inbox;
}[] = [
  {
    key: "requests",
    label: "Requests",
    icon: Inbox,
  },
  {
    key: "under_review",
    label: "Under Review",
    icon: Clock3,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
  },
  {
    key: "trash",
    label: "Trash",
    icon: Trash2,
  },
];

/* =========================================================
   NORMAL BOARD REQUESTS
========================================================= */

function getNormalBoardRequests(
  requests: WorkerRequest[],
  board: Exclude<
    BoardType,
    "trash"
  >,
): WorkerRequest[] {
  const statusMap: Record<
    Exclude<
      BoardType,
      "trash"
    >,
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
      String(
        request.status,
      ).toLowerCase() ===
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

  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return value;
}

/* =========================================================
   30 DAY RESTORE CHECK
========================================================= */

function isWithinRestoreWindow(
  request: WorkerRequest,
): boolean {
  const deletedAt =
    getDeletedAt(request);

  /*
   * Older records without deleted_at
   * remain restorable.
   */
  if (!deletedAt) {
    return true;
  }

  const deletedTime =
    new Date(
      deletedAt,
    ).getTime();

  const expiresAt =
    deletedTime +
    TRASH_RETENTION_DAYS *
      DAY_MS;

  return (
    Date.now() <
    expiresAt
  );
}

/* =========================================================
   DAYS REMAINING
========================================================= */

function getDaysRemaining(
  request: WorkerRequest,
): number | null {
  const deletedAt =
    getDeletedAt(request);

  if (!deletedAt) {
    return null;
  }

  const deletedTime =
    new Date(
      deletedAt,
    ).getTime();

  if (
    Number.isNaN(
      deletedTime,
    )
  ) {
    return null;
  }

  const expiresAt =
    deletedTime +
    TRASH_RETENTION_DAYS *
      DAY_MS;

  const remaining =
    expiresAt -
    Date.now();

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

  /* =======================================================
     ACTIVE BOARD
  ======================================================= */

  const [
    activeBoard,
    setActiveBoard,
  ] = useState<BoardType>(
    "requests",
  );

  /* =======================================================
     PAGE
  ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* =======================================================
     EXPIRY TICK
  ======================================================= */

  const [
    expiryTick,
    setExpiryTick,
  ] = useState(0);

  /*
   * Recalculate remaining restore days
   * while Trash is open.
   */
  useEffect(() => {
    if (
      activeBoard !==
      "trash"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setExpiryTick(
            (value) =>
              value + 1,
          );
        },
        60 * 1000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    activeBoard,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts =
    useMemo(
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
              request.is_deleted ===
              true,
          ).length,
      }),
      [
        requests,
        trashRequests,
      ],
    );

  /* =======================================================
     ACTIVE REQUESTS
  ======================================================= */

  const activeRequests =
    useMemo(() => {
      /*
       * Force recalculation when expiryTick changes.
       */
      void expiryTick;

      if (
        activeBoard ===
        "trash"
      ) {
        /*
         * Never display Trash until PIN
         * has been successfully verified.
         */
        if (
          !isSuperAdmin ||
          !trashUnlocked
        ) {
          return [];
        }

        return trashRequests.filter(
          (request) =>
            request.is_deleted ===
            true,
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
     TOTAL PAGES
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        activeRequests.length /
          CARDS_PER_PAGE,
      ),
    );

  /* =======================================================
     KEEP PAGE VALID
  ======================================================= */

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const paginatedRequests =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        CARDS_PER_PAGE;

      return activeRequests.slice(
        start,
        start +
          CARDS_PER_PAGE,
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
        board.key ===
        activeBoard,
    );

  /* =======================================================
     BOARD CHANGE
     
     Trash:
       1. Every click asks PIN.
       2. Does not directly open Trash.
       3. Successful PIN causes controller to set
          trashUnlocked=true.
     
     Leaving Trash:
       1. Reset PIN state through onLeaveTrash.
       2. Next Trash click asks PIN again.
  ======================================================= */

  const handleBoardChange = (
    board: BoardType,
  ) => {
    /* =====================================================
       TRASH
    ===================================================== */

    if (
      board === "trash"
    ) {
      if (!isSuperAdmin) {
        onOpenTrash?.();
        return;
      }

      /*
       * ALWAYS ask for PIN.
       *
       * Even if Trash is currently unlocked,
       * another click on Trash opens PIN again.
       */
      onOpenTrash?.();

      return;
    }

    /* =====================================================
       NORMAL BOARD
    ===================================================== */

    if (
      activeBoard ===
      "trash"
    ) {
      /*
       * Lock Trash again.
       */
      onLeaveTrash?.();
    }

    setActiveBoard(
      board,
    );

    setCurrentPage(1);
  };

  /* =======================================================
     OPEN TRASH AFTER PIN
     
     Controller calls:
       setTrashUnlocked(true)
     
     This effect then opens Trash automatically.
  ======================================================= */

  useEffect(() => {
    if (
      trashUnlocked &&
      isSuperAdmin
    ) {
      setActiveBoard(
        "trash",
      );

      setCurrentPage(1);
    }
  }, [
    trashUnlocked,
    isSuperAdmin,
  ]);

  /* =======================================================
     SAFETY
     
     If controller locks Trash while this component is
     still mounted, automatically leave the Trash board.
  ======================================================= */

  useEffect(() => {
    if (
      activeBoard ===
        "trash" &&
      (!isSuperAdmin ||
        !trashUnlocked)
    ) {
      setActiveBoard(
        "requests",
      );

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
    activeRequests.length ===
    0
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
      className={
        isMobile
          ? "mt-3"
          : "mt-5"
      }
    >
      {/* ===================================================
          TABS
      =================================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto scrollbar-none">
          {boards.map(
            (board) => {
              const active =
                activeBoard ===
                board.key;

              const Icon =
                board.icon;

              const count =
                counts[
                  board.key
                ];

              const isTrash =
                board.key ===
                "trash";

              return (
                <button
                  key={
                    board.key
                  }
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
                    gap-1.5
                    px-4
                    py-3
                    text-[10px]
                    font-black
                    transition
                    ${
                      active
                        ? "text-[#FF5C39]"
                        : "text-[#64748B]"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-3.5
                      w-3.5
                      ${
                        active
                          ? "text-[#FF5C39]"
                          : "text-[#94A3B8]"
                      }
                    `}
                  />

                  <span>
                    {isMobile &&
                    board.key ===
                      "under_review"
                      ? "Review"
                      : board.label}
                  </span>

                  {/* COUNT */}

                  <span
                    className={`
                      flex
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      px-1
                      py-0.5
                      text-[8px]
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

                  {/* TRASH LOCK */}

                  {isTrash && (
                    <LockKeyhole className="h-2.5 w-2.5 text-[#94A3B8]" />
                  )}

                  {/* ACTIVE LINE */}

                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#FF5C39]" />
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-[#172033]">
              {activeConfig?.label}
            </h2>

            {activeBoard ===
              "trash" && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[7px] font-black text-red-600">
                SECURED
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-[9px] font-medium text-[#94A3B8]">
            {getBoardDescription(
              activeBoard,
            )}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-bold text-[#94A3B8]">
          {activeRequests.length}{" "}
          {activeRequests.length ===
          1
            ? "booking"
            : "bookings"}
        </span>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      {activeRequests.length ===
      0 ? (
        <EmptyBoard
          board={
            activeBoard
          }
        />
      ) : (
        <>
          {/* =================================================
              CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {paginatedRequests.map(
              (request) => (
                <BookingCard
                  key={
                    request.id
                  }
                  request={
                    request
                  }
                  board={
                    activeBoard
                  }
                  onView={() =>
                    onView?.(
                      request,
                    )
                  }
                  onRestore={() =>
                    onRestore?.(
                      request,
                    )
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
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
              <p className="text-[9px] font-bold text-[#94A3B8]">
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
                  {
                    activeRequests.length
                  }
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    1
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
                  className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[9px] font-black text-[#64748B] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />

                  {!isMobile &&
                    "Previous"}
                </button>

                {/* PAGE */}

                <div className="flex h-8 min-w-[48px] items-center justify-center rounded-lg bg-[#F8FAFC] px-2 text-[9px] font-black text-[#172033]">
                  {currentPage}
                  {" / "}
                  {totalPages}
                </div>

                {/* NEXT */}

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
                  className="flex h-8 items-center gap-1 rounded-lg bg-[#172033] px-2.5 py-1 text-[9px] font-black text-white transition hover:bg-[#101827] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {!isMobile &&
                    "Next"}

                  <ChevronRight className="h-3.5 w-3.5" />
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
}: {
  board: BoardType;
}) {
  const config =
    boards.find(
      (item) =>
        item.key === board,
    );

  const Icon =
    config?.icon ?? Inbox;

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-5 text-center">
      <div
        className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          ${
            board ===
            "trash"
              ? "bg-red-50 text-red-400"
              : "bg-gray-50 text-gray-400"
          }
        `}
      >
        {board ===
        "trash" ? (
          <Trash2 className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      <p className="mt-3 text-xs font-black text-[#172033]">
        {board ===
        "trash"
          ? "Trash is empty"
          : `No ${config?.label}`}
      </p>

      <p className="mt-1 max-w-xs text-[9px] leading-4 text-[#94A3B8]">
        {getEmptyText(
          board,
        )}
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
  onView,
  onRestore,
  onPermanentDelete,
}: {
  request: WorkerRequest;
  board: BoardType;
  onView: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
}) {
  /* =======================================================
     PERMANENT DELETE CONFIRMATION
  ======================================================= */

  const [
    showPermanentDeleteConfirm,
    setShowPermanentDeleteConfirm,
  ] = useState(false);

  /* =======================================================
     RESTORE WINDOW
  ======================================================= */

  const restoreAllowed =
    isWithinRestoreWindow(
      request,
    );

  const daysRemaining =
    getDaysRemaining(
      request,
    );

  /* =======================================================
     BASIC DATA
  ======================================================= */

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

  if (
    board ===
    "trash"
  ) {
    return (
      <>
        <article className="group min-w-0 overflow-hidden rounded-xl border border-red-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
          {/* =================================================
              BODY
          ================================================= */}

          <div className="p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Trash2 className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[11px] font-black text-[#172033] md:text-xs">
                      {title}
                    </h3>

                    <p className="mt-0.5 truncate text-[9px] font-medium text-[#64748B]">
                      {customer}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-600">
                    Trashed
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                TRASH DETAILS
            ================================================= */}

            <div className="mt-2.5 space-y-1.5 border-t border-gray-50 pt-2.5">
              {/* DELETE REASON */}

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

              {/* DELETED DATE */}

              <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#94A3B8]">
                <Clock3 className="h-3 w-3 shrink-0" />

                <span className="truncate">
                  Deleted{" "}
                  {getTrashDate(
                    request,
                  )}
                </span>
              </div>

              {/* =================================================
                  RESTORE RETENTION
              ================================================= */}

              {restoreAllowed &&
              daysRemaining !==
                null ? (
                <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5 text-[8px] font-black text-emerald-600">
                  <RotateCcw className="h-3 w-3 shrink-0" />

                  <span>
                    Restore available for{" "}
                    {daysRemaining}{" "}
                    {daysRemaining ===
                    1
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

              {/* ORIGINAL STATUS */}

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

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="grid grid-cols-2 gap-1.5 border-t border-gray-100 bg-[#FAFAFA] p-2">
            {/* =================================================
                RESTORE
            ================================================= */}

            <button
              type="button"
              disabled={
                !restoreAllowed
              }
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

            {/* =================================================
                DELETE FOREVER
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setShowPermanentDeleteConfirm(
                  true,
                )
              }
              className="flex h-8 items-center justify-center gap-1 rounded-lg border border-red-100 bg-red-50 text-[9px] font-black text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3" />

              Delete Forever
            </button>
          </div>
        </article>

        {/* ===================================================
            PERMANENT DELETE CONFIRMATION
        =================================================== */}

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
              {/* HEADER */}

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

              {/* CONTENT */}

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

              {/* ACTIONS */}

              <div className="flex gap-2 border-t border-gray-100 bg-[#FAFAFA] px-4 py-3">
                {/* CANCEL */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPermanentDeleteConfirm(
                      false,
                    )
                  }
                  className="flex h-9 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white text-[9px] font-black text-[#64748B] transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                {/* CONFIRM */}

                <button
                  type="button"
                  onClick={() => {
                    setShowPermanentDeleteConfirm(
                      false,
                    );

                    onPermanentDelete();
                  }}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 text-[9px] font-black text-white transition hover:bg-red-700 active:scale-[0.98]"
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
    <article className="group min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.04)] transition hover:border-gray-200 hover:shadow-sm">
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5C39]">
            <Users className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-black text-[#172033] md:text-xs">
                  {title}
                </h3>

                <p className="mt-0.5 truncate text-[9px] font-medium text-[#64748B]">
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
              />
            </div>
          </div>
        </div>

        {/* META */}

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-gray-50 pt-2.5">
          <MiniMeta
            icon={<Users />}
            value={`${request.workers_required} workers`}
          />

          <MiniMeta
            icon={<CalendarDays />}
            value={
              request.work_date ||
              "Date pending"
            }
          />

          <MiniMeta
            icon={<Clock3 />}
            value={
              request.start_time ||
              "Time pending"
            }
          />

          <MiniMeta
            icon={<MapPin />}
            value={
              request.location ||
              "Location pending"
            }
          />
        </div>
      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-[#FAFAFA] px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
            {request.project_type ||
              "Worker booking"}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-black text-[#FF5C39]">
            {request.budget !=
            null
              ? `₹${request.budget}`
              : "Budget not specified"}
          </p>
        </div>

        <button
          type="button"
          onClick={
            onView
          }
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#172033] px-2.5 py-1.5 text-[9px] font-black text-white transition hover:bg-[#101827]"
        >
          View

          <ArrowRight className="h-3 w-3" />
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
}: {
  board: Exclude<
    BoardType,
    "trash"
  >;
}) {
  const config: Record<
    Exclude<
      BoardType,
      "trash"
    >,
    {
      label: string;
      className: string;
    }
  > = {
    requests: {
      label: "New",
      className:
        "bg-orange-50 text-[#FF5C39]",
    },

    under_review: {
      label: "Under Review",
      className:
        "bg-amber-50 text-amber-600",
    },

    confirmed: {
      label: "Confirmed",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    completed: {
      label: "Completed",
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
        px-2
        py-1
        text-[8px]
        font-black
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/* =========================================================
   MINI META
========================================================= */

function MiniMeta({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1 rounded-md bg-[#F8FAFC] px-1.5 py-1.5 text-[8px] font-bold text-[#64748B]">
      <span className="shrink-0 text-[#94A3B8] [&>svg]:h-3 [&>svg]:w-3">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}