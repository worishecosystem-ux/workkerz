"use client";

import {
  useEffect,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  WorkerRequest,
} from "../types";

/* =========================================================
   TYPES
========================================================= */

export type CustomerRequestNotification = {
  id: string;

  type:
    | "request_created"
    | "request_accepted"
    | "request_rejected"
    | "request_completed"
    | "request_cancelled";

  title: string;

  message: string;

  requestId: string;

  status: string;

  createdAt: string;

  request?: WorkerRequest;
};

type Props = {
  userId?: string | null;

  onNotification?: (
    notification: CustomerRequestNotification,
  ) => void;
};

/* =========================================================
   STATUS MESSAGE
========================================================= */

function createNotification(
  request: WorkerRequest,
): CustomerRequestNotification | null {
  const status = String(
    request.status || "",
  ).toLowerCase();

  const requestId =
    String(request.id);

  const createdAt =
    request.created_at ||
    new Date().toISOString();

  const project =
    request.project_name ||
    request.category ||
    "Worker request";

  switch (status) {
    case "accepted":
      return {
        id: `${requestId}-accepted-${createdAt}`,
        type: "request_accepted",
        title: "Request Accepted",
        message: `Your ${project} request has been accepted.`,
        requestId,
        status,
        createdAt,
        request,
      };

    case "rejected":
      return {
        id: `${requestId}-rejected-${createdAt}`,
        type: "request_rejected",
        title: "Request Update",
        message: `Your ${project} request was not accepted.`,
        requestId,
        status,
        createdAt,
        request,
      };

    case "completed":
      return {
        id: `${requestId}-completed-${createdAt}`,
        type: "request_completed",
        title: "Work Completed",
        message: `Your ${project} request has been marked completed.`,
        requestId,
        status,
        createdAt,
        request,
      };

    case "cancelled":
      return {
        id: `${requestId}-cancelled-${createdAt}`,
        type: "request_cancelled",
        title: "Request Cancelled",
        message: `Your ${project} request has been cancelled.`,
        requestId,
        status,
        createdAt,
        request,
      };

    default:
      return null;
  }
}

/* =========================================================
   HOOK
========================================================= */

export default function useCustomerRequestNotifications({
  userId,
  onNotification,
}: Props) {
  useEffect(() => {
    if (!userId) {
      return;
    }

    let mounted = true;

    const channelName =
      `customer-request-notifications-${userId}`;

    const channel = supabase
      .channel(channelName)

      /* =================================================
         REQUEST STATUS UPDATE
      ================================================= */

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "worker_requests",
          filter: `requester_user_id=eq.${userId}`,
        },
        (payload) => {
          if (!mounted) {
            return;
          }

          const request =
            payload.new as WorkerRequest;

          if (!request?.id) {
            return;
          }

          const notification =
            createNotification(
              request,
            );

          if (!notification) {
            return;
          }

          console.log(
            "[Customer Request Notification]",
            notification,
          );

          onNotification?.(
            notification,
          );
        },
      )

      /* =================================================
         SUBSCRIBE
      ================================================= */

      .subscribe((status) => {
        if (!mounted) {
          return;
        }

        console.log(
          "[Customer Request Notifications]",
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
    userId,
    onNotification,
  ]);
}