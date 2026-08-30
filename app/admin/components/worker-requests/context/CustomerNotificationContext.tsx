"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CustomerRequestNotification,
} from "../hooks/useCustomerRequestNotifications";

import useCustomerRequestNotifications from "../hooks/useCustomerRequestNotifications";

import useCustomerNotificationSound from "../hooks/useCustomerNotificationSound";

/* =========================================================
   TYPES
========================================================= */

export type StoredCustomerNotification =
  CustomerRequestNotification & {
    read: boolean;
  };

type CustomerNotificationContextValue = {
  notifications: StoredCustomerNotification[];

  unreadCount: number;

  latestNotification:
    | CustomerRequestNotification
    | null;

  markAsRead: (
    id: string,
  ) => void;

  markAllAsRead: () => void;

  deleteNotification: (
    id: string,
  ) => void;

  clearAll: () => void;

  closeLatest: () => void;

  playNotificationSound: () => Promise<void>;
};

type Props = {
  children: ReactNode;

  userId?: string | null;

  soundEnabled?: boolean;
};

/* =========================================================
   CONTEXT
========================================================= */

const CustomerNotificationContext =
  createContext<
    CustomerNotificationContextValue | undefined
  >(undefined);

/* =========================================================
   STORAGE
========================================================= */

function getStorageKey(
  userId: string,
) {
  return `workkerz-customer-notifications-${userId}`;
}

/* =========================================================
   PROVIDER
========================================================= */

export default function CustomerNotificationProvider({
  children,
  userId,
  soundEnabled = true,
}: Props) {
  const [
    notifications,
    setNotifications,
  ] = useState<
    StoredCustomerNotification[]
  >([]);

  const [
    latestNotification,
    setLatestNotification,
  ] =
    useState<CustomerRequestNotification | null>(
      null,
    );

  /* =======================================================
     SOUND
  ======================================================= */

  const {
    play,
  } = useCustomerNotificationSound({
    enabled: soundEnabled,
  });

  /* =======================================================
     LOAD STORAGE
  ======================================================= */

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLatestNotification(null);
      return;
    }

    try {
      const stored =
        localStorage.getItem(
          getStorageKey(userId),
        );

      if (!stored) {
        setNotifications([]);
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (
        Array.isArray(parsed)
      ) {
        setNotifications(
          parsed.slice(0, 50),
        );
      }
    } catch (error) {
      console.error(
        "[Customer Notification Context]",
        error,
      );

      setNotifications([]);
    }
  }, [userId]);

  /* =======================================================
     SAVE STORAGE
  ======================================================= */

  useEffect(() => {
    if (!userId) {
      return;
    }

    try {
      localStorage.setItem(
        getStorageKey(userId),
        JSON.stringify(
          notifications,
        ),
      );
    } catch (error) {
      console.error(
        "[Customer Notification Storage]",
        error,
      );
    }
  }, [
    notifications,
    userId,
  ]);

  /* =======================================================
     REALTIME NOTIFICATION
  ======================================================= */

  const handleNotification =
    useCallback(
      (
        notification: CustomerRequestNotification,
      ) => {
        setNotifications(
          (previous) => {
            const exists =
              previous.some(
                (item) =>
                  item.id ===
                  notification.id,
              );

            if (exists) {
              return previous;
            }

            return [
              {
                ...notification,
                read: false,
              },
              ...previous,
            ].slice(0, 50);
          },
        );

        setLatestNotification(
          notification,
        );

        if (soundEnabled) {
          void play();
        }
      },
      [
        play,
        soundEnabled,
      ],
    );

  /* =======================================================
     REALTIME HOOK
  ======================================================= */

  useCustomerRequestNotifications({
    userId,

    onNotification:
      handleNotification,
  });

  /* =======================================================
     MARK READ
  ======================================================= */

  const markAsRead =
    useCallback(
      (id: string) => {
        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      read: true,
                    }
                  : item,
            ),
        );
      },
      [],
    );

  /* =======================================================
     MARK ALL READ
  ======================================================= */

  const markAllAsRead =
    useCallback(() => {
      setNotifications(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              read: true,
            }),
          ),
      );
    }, []);

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteNotification =
    useCallback(
      (id: string) => {
        setNotifications(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !== id,
            ),
        );
      },
      [],
    );

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const clearAll =
    useCallback(() => {
      setNotifications([]);
    }, []);

  /* =======================================================
     CLOSE LATEST
  ======================================================= */

  const closeLatest =
    useCallback(() => {
      setLatestNotification(
        null,
      );
    }, []);

  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            !item.read,
        ).length,
      [notifications],
    );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value =
    useMemo<CustomerNotificationContextValue>(
      () => ({
        notifications,

        unreadCount,

        latestNotification,

        markAsRead,

        markAllAsRead,

        deleteNotification,

        clearAll,

        closeLatest,

        playNotificationSound:
          play,
      }),
      [
        notifications,
        unreadCount,
        latestNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        closeLatest,
        play,
      ],
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <CustomerNotificationContext.Provider
      value={value}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useCustomerNotificationContext() {
  const context =
    useContext(
      CustomerNotificationContext,
    );

  if (!context) {
    throw new Error(
      "useCustomerNotificationContext must be used inside CustomerNotificationProvider",
    );
  }

  return context;
}