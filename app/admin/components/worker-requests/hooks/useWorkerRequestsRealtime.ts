"use client";

import {
  useEffect,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  WorkerRequest,
} from "../types";

type Props = {
  onInsert?: (
    request: WorkerRequest,
  ) => void;

  onUpdate?: (
    request: WorkerRequest,
  ) => void;

  onDelete?: (
    id: string,
  ) => void;
};

export default function useWorkerRequestsRealtime({
  onInsert,
  onUpdate,
  onDelete,
}: Props) {
  useEffect(() => {
    let mounted = true;

    const channel = supabase
      .channel(
        "worker-requests-controller-live",
      )

      /* =================================================
         NEW REQUEST
      ================================================= */

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "worker_requests",
        },
        (payload) => {
          if (!mounted) return;

          const request =
            payload.new as WorkerRequest;

          if (!request?.id) {
            return;
          }

          console.log(
            "[Worker Requests] New request:",
            request.id,
          );

          onInsert?.(request);
        },
      )

      /* =================================================
         REQUEST UPDATED
      ================================================= */

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "worker_requests",
        },
        (payload) => {
          if (!mounted) return;

          const request =
            payload.new as WorkerRequest;

          if (!request?.id) {
            return;
          }

          console.log(
            "[Worker Requests] Updated:",
            request.id,
            request.status,
          );

          onUpdate?.(request);
        },
      )

      /* =================================================
         REQUEST DELETED
      ================================================= */

      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "worker_requests",
        },
        (payload) => {
          if (!mounted) return;

          const oldRequest =
            payload.old as Partial<WorkerRequest>;

          if (!oldRequest?.id) {
            return;
          }

          console.log(
            "[Worker Requests] Deleted:",
            oldRequest.id,
          );

          onDelete?.(
            String(oldRequest.id),
          );
        },
      )

      /* =================================================
         SUBSCRIBE
      ================================================= */

      .subscribe((status) => {
        if (!mounted) return;

        console.log(
          "[Worker Requests Realtime]",
          status,
        );
      });

    /* =================================================
       CLEANUP
    ================================================= */

    return () => {
      mounted = false;

      supabase.removeChannel(
        channel,
      );
    };
  }, [
    onInsert,
    onUpdate,
    onDelete,
  ]);
}