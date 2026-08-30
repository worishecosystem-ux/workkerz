"use client";

import {
  useEffect,
} from "react";

import {
  useCustomerNotificationContext,
} from "../../context/CustomerNotificationContext";

import CustomerRequestNotificationToast from "./CustomerRequestNotificationToast";

type Props = {
  onViewRequest?: (
    requestId: string,
  ) => void;

  autoCloseMs?: number;
};

export default function CustomerRequestNotificationProvider({
  onViewRequest,
  autoCloseMs = 5000,
}: Props) {
  const {
    latestNotification,
    closeLatest,
  } =
    useCustomerNotificationContext();

  /* =======================================================
     AUTO CLOSE
  ======================================================= */

  useEffect(() => {
    if (!latestNotification) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        closeLatest();
      }, autoCloseMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    latestNotification,
    closeLatest,
    autoCloseMs,
  ]);

  /* =======================================================
     VIEW REQUEST
  ======================================================= */

  const handleViewRequest = (
    requestId: string,
  ) => {
    closeLatest();

    onViewRequest?.(
      requestId,
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <CustomerRequestNotificationToast
      notification={
        latestNotification
      }
      onClose={
        closeLatest
      }
      onViewRequest={
        handleViewRequest
      }
    />
  );
}