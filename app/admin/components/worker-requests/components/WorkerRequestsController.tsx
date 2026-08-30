"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  DeviceType,
  StatusType,
  WorkerRequest,
} from "../types";

import useWorkerRequestsRealtime from "../hooks/useWorkerRequestsRealtime";

import WorkerRequestsHeader from "./header/WorkerRequestsHeader";
import BookingBoard from "./BookingBoard";

import RequestSkeleton from "./states/RequestSkeleton";
import RequestError from "./states/RequestError";

import RequestDetailDrawer from "./drawer/RequestDetailDrawer";

import TrashPinModal from "../trash/TrashPinModal";

/* =========================================================
   PROPS
========================================================= */

type Props = {
  device: DeviceType;

  realtimeRequest?: WorkerRequest | null;

  onRequestCountChange?: (
    count: number,
  ) => void;
};

/* =========================================================
   CONTROLLER
========================================================= */

export default function WorkerRequestsController({
  device,
  onRequestCountChange,
}: Props) {
  /* =======================================================
     NORMAL REQUESTS
  ======================================================= */

  const [requests, setRequests] =
    useState<WorkerRequest[]>([]);

  /* =======================================================
     TRASH REQUESTS

     Deleted requests are kept separately.
  ======================================================= */

  const [trashRequests, setTrashRequests] =
    useState<WorkerRequest[]>([]);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selected, setSelected] =
    useState<WorkerRequest | null>(null);

  const [updating, setUpdating] =
    useState<string | null>(null);

  /* =======================================================
     TRASH SECURITY
  ======================================================= */

  const [isSuperAdmin, setIsSuperAdmin] =
    useState(false);

  /*
   * true only after the current PIN verification.
   *
   * This is reset whenever user leaves Trash.
   */
  const [trashUnlocked, setTrashUnlocked] =
    useState(false);

  const [showTrashPinModal, setShowTrashPinModal] =
    useState(false);

  /* =======================================================
     DEVICE
  ======================================================= */

  const isMobile =
    device === "mobile";

  /* =======================================================
     LOAD ADMIN
  ======================================================= */

  const loadAdmin = useCallback(
    async () => {
      try {
        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const session =
          sessionData.session;

        if (!session?.access_token) {
          setIsSuperAdmin(false);
          return;
        }

        const response =
          await fetch(
            "/api/admin/me",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },

              credentials:
                "include",

              cache:
                "no-store",
            },
          );

        const result =
          await response
            .json()
            .catch(
              () => null,
            );

        if (!response.ok) {
          console.error(
            "[Worker Requests] Admin auth:",
            result,
          );

          setIsSuperAdmin(false);
          return;
        }

        setIsSuperAdmin(
          result?.isSuperAdmin === true,
        );
      } catch (err) {
        console.error(
          "[Worker Requests] Admin check:",
          err,
        );

        setIsSuperAdmin(false);
      }
    },
    [],
  );

  /* =======================================================
     INITIAL ADMIN CHECK
  ======================================================= */

  useEffect(() => {
    void loadAdmin();
  }, [
    loadAdmin,
  ]);

  /* =======================================================
     LOAD NORMAL REQUESTS
  ======================================================= */

  const loadRequests =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const {
            data,
            error: fetchError,
          } =
            await supabase
              .from(
                "worker_requests",
              )
              .select("*")
              .eq(
                "is_deleted",
                false,
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                },
              );

          if (fetchError) {
            throw fetchError;
          }

          setRequests(
            (data ??
              []) as WorkerRequest[],
          );
        } catch (err) {
          console.error(
            "[Worker Requests]",
            err,
          );

          setError(
            "Unable to load worker requests.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /* =======================================================
     LOAD TRASH REQUESTS
     
     Only Super Admin + verified PIN.
  ======================================================= */

  const loadTrashRequests =
    useCallback(
      async () => {
        if (
          !isSuperAdmin ||
          !trashUnlocked
        ) {
          return;
        }

        try {
          setError(null);

          const {
            data,
            error:
              trashError,
          } =
            await supabase
              .from(
                "worker_requests",
              )
              .select("*")
              .eq(
                "is_deleted",
                true,
              )
              .order(
                "deleted_at",
                {
                  ascending:
                    false,
                  nullsFirst:
                    false,
                },
              );

          if (trashError) {
            throw trashError;
          }

          setTrashRequests(
            (data ??
              []) as WorkerRequest[],
          );
        } catch (err) {
          console.error(
            "[Worker Requests Trash]",
            err,
          );

          setError(
            "Unable to load deleted requests.",
          );
        }
      },
      [
        isSuperAdmin,
        trashUnlocked,
      ],
    );

  /* =======================================================
     INITIAL NORMAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadRequests();
  }, [
    loadRequests,
  ]);

  /* =======================================================
     LOAD TRASH AFTER PIN VERIFICATION
  ======================================================= */

  useEffect(() => {
    if (
      isSuperAdmin &&
      trashUnlocked
    ) {
      void loadTrashRequests();
    }
  }, [
    isSuperAdmin,
    trashUnlocked,
    loadTrashRequests,
  ]);

  /* =======================================================
     REALTIME INSERT
  ======================================================= */

  const handleRealtimeInsert =
    useCallback(
      (
        request: WorkerRequest,
      ) => {
        /* =================================================
           DELETED REQUEST
        ================================================= */

        if (
          request.is_deleted
        ) {
          if (
            isSuperAdmin &&
            trashUnlocked
          ) {
            setTrashRequests(
              (previous) => {
                const exists =
                  previous.some(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                      String(
                        request.id,
                      ),
                  );

                if (exists) {
                  return previous;
                }

                return [
                  request,
                  ...previous,
                ];
              },
            );
          }

          return;
        }

        /* =================================================
           NORMAL REQUEST
        ================================================= */

        setRequests(
          (previous) => {
            const exists =
              previous.some(
                (item) =>
                  String(
                    item.id,
                  ) ===
                  String(
                    request.id,
                  ),
              );

            if (exists) {
              return previous;
            }

            return [
              request,
              ...previous,
            ];
          },
        );
      },
      [
        isSuperAdmin,
        trashUnlocked,
      ],
    );

  /* =======================================================
     REALTIME UPDATE
  ======================================================= */

  const handleRealtimeUpdate =
    useCallback(
      (
        request: WorkerRequest,
      ) => {
        /* =================================================
           REQUEST MOVED TO TRASH
        ================================================= */

        if (
          request.is_deleted
        ) {
          /* Remove from normal requests */

          setRequests(
            (previous) =>
              previous.filter(
                (item) =>
                  String(
                    item.id,
                  ) !==
                  String(
                    request.id,
                  ),
              ),
          );

          /* Add/update Trash only if unlocked */

          if (
            isSuperAdmin &&
            trashUnlocked
          ) {
            setTrashRequests(
              (previous) => {
                const exists =
                  previous.some(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                      String(
                        request.id,
                      ),
                  );

                if (exists) {
                  return previous.map(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                        String(
                          request.id,
                        )
                        ? request
                        : item,
                  );
                }

                return [
                  request,
                  ...previous,
                ];
              },
            );
          }

          /* Close drawer */

          setSelected(
            (previous) =>
              previous &&
              String(
                previous.id,
              ) ===
                String(
                  request.id,
                )
                ? null
                : previous,
          );

          return;
        }

        /* =================================================
           NORMAL UPDATE
        ================================================= */

        setRequests(
          (previous) =>
            previous.map(
              (item) =>
                String(
                  item.id,
                ) ===
                  String(
                    request.id,
                  )
                  ? request
                  : item,
            ),
        );

        /* Remove restored request from Trash */

        setTrashRequests(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item.id,
                ) !==
                String(
                  request.id,
                ),
            ),
        );

        /* Selected request */

        setSelected(
          (previous) =>
            previous &&
            String(
              previous.id,
            ) ===
              String(
                request.id,
              )
              ? request
              : previous,
        );
      },
      [
        isSuperAdmin,
        trashUnlocked,
      ],
    );

  /* =======================================================
     REALTIME DELETE
  ======================================================= */

  const handleRealtimeDelete =
    useCallback(
      (
        id: string,
      ) => {
        setRequests(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item.id,
                ) !==
                String(id),
            ),
        );

        setTrashRequests(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item.id,
                ) !==
                String(id),
            ),
        );

        setSelected(
          (previous) =>
            previous &&
            String(
              previous.id,
            ) ===
              String(id)
              ? null
              : previous,
        );
      },
      [],
    );

  /* =======================================================
     REALTIME CONNECTION
  ======================================================= */

  useWorkerRequestsRealtime({
    onInsert:
      handleRealtimeInsert,

    onUpdate:
      handleRealtimeUpdate,

    onDelete:
      handleRealtimeDelete,
  });

  /* =======================================================
     PENDING COUNT
  ======================================================= */

  const pendingCount =
    requests.filter(
      (request) =>
        String(
          request.status,
        ).toLowerCase() ===
        "pending",
    ).length;

  /* =======================================================
     REQUEST COUNT CALLBACK
  ======================================================= */

  useEffect(() => {
    onRequestCountChange?.(
      pendingCount,
    );
  }, [
    pendingCount,
    onRequestCountChange,
  ]);

  /* =======================================================
     VIEW REQUEST
  ======================================================= */

  const handleViewRequest =
    useCallback(
      (
        request: WorkerRequest,
      ) => {
        setSelected(request);
      },
      [],
    );

  /* =======================================================
     CLOSE DRAWER
  ======================================================= */

  const handleCloseDrawer =
    useCallback(() => {
      setSelected(null);
    }, []);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus =
    useCallback(
      async (
        id: string,
        status: StatusType,
      ) => {
        try {
          setUpdating(id);
          setError(null);

          const {
            data,
            error: updateError,
          } =
            await supabase
              .from(
                "worker_requests",
              )
              .update({
                status,
              })
              .eq(
                "id",
                id,
              )
              .select("*")
              .maybeSingle();

          if (updateError) {
            throw updateError;
          }

          if (!data) {
            throw new Error(
              "Worker request was not updated.",
            );
          }

          const updated =
            data as WorkerRequest;

          setRequests(
            (previous) =>
              previous.map(
                (request) =>
                  String(
                    request.id,
                  ) ===
                    String(id)
                    ? updated
                    : request,
              ),
          );

          setSelected(
            (previous) =>
              previous &&
              String(
                previous.id,
              ) ===
                String(id)
                ? updated
                : previous,
          );
        } catch (err) {
          console.error(
            "[Worker Request Status]",
            err,
          );

          setError(
            "Unable to update request status.",
          );
        } finally {
          setUpdating(null);
        }
      },
      [],
    );

  /* =======================================================
     MOVE TO TRASH
  ======================================================= */

  const moveToTrash =
    useCallback(
      async (
        id: string,
        reason: string,
      ) => {
        const cleanReason =
          reason.trim();

        if (!cleanReason) {
          setError(
            "Delete reason is required.",
          );

          return false;
        }

        try {
          setUpdating(id);
          setError(null);

          const {
            data,
            error:
              trashError,
          } =
            await supabase
              .from(
                "worker_requests",
              )
              .update({
                is_deleted:
                  true,

                deleted_at:
                  new Date().toISOString(),

                deletion_reason:
                  cleanReason,
              })
              .eq(
                "id",
                id,
              )
              .select("*")
              .maybeSingle();

          if (trashError) {
            throw trashError;
          }

          if (!data) {
            throw new Error(
              "Request was not moved to trash.",
            );
          }

          const deletedRequest =
            data as WorkerRequest;

          /* Remove normal */

          setRequests(
            (previous) =>
              previous.filter(
                (request) =>
                  String(
                    request.id,
                  ) !==
                  String(id),
              ),
          );

          /* Add to Trash if currently unlocked */

          if (
            isSuperAdmin &&
            trashUnlocked
          ) {
            setTrashRequests(
              (previous) => {
                const exists =
                  previous.some(
                    (request) =>
                      String(
                        request.id,
                      ) ===
                      String(id),
                  );

                if (exists) {
                  return previous.map(
                    (request) =>
                      String(
                        request.id,
                      ) ===
                        String(id)
                        ? deletedRequest
                        : request,
                  );
                }

                return [
                  deletedRequest,
                  ...previous,
                ];
              },
            );
          }

          setSelected(null);

          return true;
        } catch (err) {
          console.error(
            "[Worker Request Trash]",
            err,
          );

          setError(
            "Unable to move request to trash.",
          );

          return false;
        } finally {
          setUpdating(null);
        }
      },
      [
        isSuperAdmin,
        trashUnlocked,
      ],
    );

  /* =======================================================
     OPEN TRASH
     
     IMPORTANT:
     Every Trash click opens PIN.
  ======================================================= */

  const handleOpenTrash =
    useCallback(() => {
      if (!isSuperAdmin) {
        setError(
          "Only Super Admin can access Trash.",
        );

        return;
      }

      /*
       * Always lock again before opening modal.
       */
      setTrashUnlocked(false);

      /*
       * Clear current Trash data while
       * PIN is being entered.
       */
      setTrashRequests([]);

      /*
       * Open PIN modal.
       */
      setShowTrashPinModal(true);
    }, [
      isSuperAdmin,
    ]);

  /* =======================================================
     TRASH VERIFIED
     
     After successful PIN:
     1. Close modal
     2. Unlock Trash
     3. BookingBoard automatically switches
        to Trash.
  ======================================================= */

  const handleTrashVerified =
    useCallback(() => {
      setShowTrashPinModal(false);

      setError(null);

      setTrashUnlocked(true);
    }, []);

  /* =======================================================
     CLOSE PIN MODAL
  ======================================================= */

  const handleCloseTrashPin =
    useCallback(() => {
      setShowTrashPinModal(false);

      /*
       * Do not keep Trash unlocked if
       * PIN modal is cancelled.
       */
      setTrashUnlocked(false);

      setTrashRequests([]);
    }, []);

  /* =======================================================
     LEAVE TRASH
     
     BookingBoard calls this whenever user selects
     another tab.
     
     This guarantees next Trash click asks PIN again.
  ======================================================= */

  const handleLeaveTrash =
    useCallback(() => {
      setTrashUnlocked(false);

      setTrashRequests([]);
    }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className={
          isMobile
            ? "min-h-screen bg-[#F8FAFC] p-3"
            : "min-h-screen bg-[#F8FAFC] p-5 lg:p-7"
        }
      >
        <WorkerRequestsHeader
          pendingCount={0}
          totalCount={0}
          loading
          onRefresh={
            loadRequests
          }
          mobile={isMobile}
        />

        <RequestSkeleton
          mobile={isMobile}
          count={4}
        />
      </div>
    );
  }

  /* =======================================================
     FULL ERROR
  ======================================================= */

  if (
    error &&
    requests.length === 0
  ) {
    return (
      <div
        className={
          isMobile
            ? "min-h-screen bg-[#F8FAFC] p-3"
            : "min-h-screen bg-[#F8FAFC] p-5 lg:p-7"
        }
      >
        <WorkerRequestsHeader
          pendingCount={0}
          totalCount={0}
          loading={false}
          onRefresh={
            loadRequests
          }
          mobile={isMobile}
        />

        <RequestError
          message={error}
          onRetry={
            loadRequests
          }
          mobile={isMobile}
        />
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      className={
        isMobile
          ? "min-h-screen bg-[#F8FAFC] p-3"
          : "min-h-screen bg-[#F8FAFC] p-5 lg:p-7"
      }
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <WorkerRequestsHeader
        pendingCount={
          pendingCount
        }
        totalCount={
          requests.length
        }
        loading={
          loading
        }
        onRefresh={
          loadRequests
        }
        mobile={
          isMobile
        }
      />

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
          {error}
        </div>
      )}

      {/* ===================================================
          BOOKING BOARD
      =================================================== */}

      <BookingBoard
        requests={
          requests
        }

        trashRequests={
          trashRequests
        }

        device={
          device
        }

        onView={
          handleViewRequest
        }

        onOpenTrash={
          handleOpenTrash
        }

        onLeaveTrash={
          handleLeaveTrash
        }

        trashUnlocked={
          trashUnlocked
        }

        isSuperAdmin={
          isSuperAdmin
        }
      />

      {/* ===================================================
          DETAIL DRAWER
      =================================================== */}

      {selected && (
        <RequestDetailDrawer
          request={
            selected
          }

          device={
            device
          }

          updating={
            updating
          }

          onClose={
            handleCloseDrawer
          }

          onUpdate={
            updateStatus
          }

          onTrash={
            moveToTrash
          }
        />
      )}

      {/* ===================================================
          TRASH PIN MODAL
      =================================================== */}

      {isSuperAdmin && (
        <TrashPinModal
          open={
            showTrashPinModal
          }

          onClose={
            handleCloseTrashPin
          }

          onVerified={
            handleTrashVerified
          }
        />
      )}
    </div>
  );
}