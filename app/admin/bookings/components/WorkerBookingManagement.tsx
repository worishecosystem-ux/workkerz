"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BellRing,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import type {
  BookingNotification,
  BookingStatus,
  WorkerBooking,
} from "../types/booking";

import BookingHeader from "./BookingHeader";
import BookingStats from "./BookingStats";
import BookingTabs, {
  type BookingTab,
} from "./BookingTabs";
import BookingBoard from "./BookingBoard";
import BookingCard from "./BookingCard";
import BookingNotifications from "./BookingNotifications";
import RecentActivity from "./RecentActivity";
import BookingDetails from "./BookingDetails";

export default function WorkerBookingManagement() {
  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [bookings, setBookings] =
    useState<WorkerBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<BookingTab>("pending");

  const [selectedBooking, setSelectedBooking] =
    useState<WorkerBooking | null>(null);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [notifications, setNotifications] =
    useState<BookingNotification[]>([]);

  const [showNotificationBoard, setShowNotificationBoard] =
    useState(false);

  const [liveNotification, setLiveNotification] =
    useState<BookingNotification | null>(null);

  const [showLiveNotification, setShowLiveNotification] =
    useState(false);

  /*
   * ONLY COMPLETED BOOKINGS:
   * false = recent 5
   * true  = all completed
   */

  const [showAllCompleted, setShowAllCompleted] =
    useState(false);

  /*
   * =========================================================
   * AUDIO
   * =========================================================
   */

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const notificationBufferRef =
    useRef<AudioBuffer | null>(null);

  const audioUnlockedRef =
    useRef(false);

  const audioLoadingRef =
    useRef(false);

  const audioSourceRef =
    useRef<AudioBufferSourceNode | null>(null);

  /*
   * =========================================================
   * NOTIFICATION DEDUPLICATION
   * =========================================================
   */

  const notifiedBookingIdsRef =
    useRef<Set<string>>(new Set());

  /*
   * =========================================================
   * LIVE NOTIFICATION TIMER
   * =========================================================
   */

  const notificationTimerRef =
    useRef<number | null>(null);

  /*
   * =========================================================
   * LOAD NOTIFICATION AUDIO
   * =========================================================
   */

  const loadNotificationSound =
    useCallback(async () => {
      if (typeof window === "undefined") {
        return false;
      }

      if (notificationBufferRef.current) {
        return true;
      }

      if (audioLoadingRef.current) {
        return false;
      }

      audioLoadingRef.current = true;

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          console.error(
            "WEB AUDIO API NOT SUPPORTED"
          );

          return false;
        }

        if (!audioContextRef.current) {
          audioContextRef.current =
            new AudioContextClass();
        }

        const response =
          await fetch(
            "/sounds/notification.mp3",
            {
              cache: "force-cache",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Audio file HTTP ${response.status}`
          );
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const audioBuffer =
          await audioContextRef.current.decodeAudioData(
            arrayBuffer
          );

        notificationBufferRef.current =
          audioBuffer;

        console.log(
          "NOTIFICATION AUDIO LOADED",
          {
            duration:
              audioBuffer.duration,
          }
        );

        return true;
      } catch (error) {
        console.error(
          "NOTIFICATION AUDIO LOAD ERROR:",
          error
        );

        return false;
      } finally {
        audioLoadingRef.current =
          false;
      }
    }, []);

  /*
   * =========================================================
   * UNLOCK AUDIO
   * =========================================================
   */

  const unlockNotificationAudio =
    useCallback(async () => {
      if (typeof window === "undefined") {
        return false;
      }

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) {
          console.error(
            "AUDIO CONTEXT NOT SUPPORTED"
          );

          return false;
        }

        if (!audioContextRef.current) {
          audioContextRef.current =
            new AudioContextClass();
        }

        const context =
          audioContextRef.current;

        if (
          context.state !==
          "running"
        ) {
          await context.resume();
        }

        const loaded =
          await loadNotificationSound();

        if (!loaded) {
          return false;
        }

        if (
          context.state ===
          "running"
        ) {
          audioUnlockedRef.current =
            true;

          console.log(
            "NOTIFICATION AUDIO UNLOCKED:",
            context.state
          );

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "NOTIFICATION AUDIO UNLOCK ERROR:",
          error
        );

        audioUnlockedRef.current =
          false;

        return false;
      }
    }, [
      loadNotificationSound,
    ]);

  /*
   * =========================================================
   * FIRST USER INTERACTION
   * =========================================================
   */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let unlocked = false;

    const handleUserInteraction =
      async () => {
        if (
          audioUnlockedRef.current
        ) {
          return;
        }

        const success =
          await unlockNotificationAudio();

        if (
          success &&
          !unlocked
        ) {
          unlocked = true;

          window.removeEventListener(
            "pointerdown",
            handleUserInteraction
          );

          window.removeEventListener(
            "touchstart",
            handleUserInteraction
          );

          window.removeEventListener(
            "keydown",
            handleUserInteraction
          );

          console.log(
            "AUDIO USER INTERACTION UNLOCK COMPLETE"
          );
        }
      };

    window.addEventListener(
      "pointerdown",
      handleUserInteraction
    );

    window.addEventListener(
      "touchstart",
      handleUserInteraction
    );

    window.addEventListener(
      "keydown",
      handleUserInteraction
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleUserInteraction
      );

      window.removeEventListener(
        "touchstart",
        handleUserInteraction
      );

      window.removeEventListener(
        "keydown",
        handleUserInteraction
      );
    };
  }, [
    unlockNotificationAudio,
  ]);

  /*
   * =========================================================
   * PLAY NOTIFICATION SOUND
   * =========================================================
   *
   * SOUND ONLY FOR NEW BOOKING.
   */

  const playNotificationSound =
    useCallback(async () => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        if (
          !audioContextRef.current
        ) {
          console.warn(
            "NOTIFICATION SOUND SKIPPED — AUDIO CONTEXT NOT READY"
          );

          return;
        }

        const context =
          audioContextRef.current;

        if (
          context.state !==
          "running"
        ) {
          console.warn(
            "NOTIFICATION SOUND SKIPPED — AUDIO CONTEXT:",
            context.state
          );

          return;
        }

        if (
          !notificationBufferRef.current
        ) {
          const loaded =
            await loadNotificationSound();

          if (!loaded) {
            console.error(
              "NOTIFICATION SOUND — BUFFER NOT LOADED"
            );

            return;
          }
        }

        const buffer =
          notificationBufferRef.current;

        if (!buffer) {
          return;
        }

        if (
          audioSourceRef.current
        ) {
          try {
            audioSourceRef.current.stop();
          } catch {
            // Already stopped.
          }

          audioSourceRef.current =
            null;
        }

        const source =
          context.createBufferSource();

        const gain =
          context.createGain();

        source.buffer =
          buffer;

        gain.gain.value = 1;

        source.connect(gain);

        gain.connect(
          context.destination
        );

        audioSourceRef.current =
          source;

        source.onended = () => {
          if (
            audioSourceRef.current ===
            source
          ) {
            audioSourceRef.current =
              null;
          }
        };

        source.start(0);

        console.log(
          "NOTIFICATION SOUND PLAYED"
        );
      } catch (error) {
        console.error(
          "NOTIFICATION SOUND PLAY ERROR:",
          error
        );
      }
    }, [
      loadNotificationSound,
    ]);

  /*
   * =========================================================
   * AUDIO CLEANUP
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (
        audioSourceRef.current
      ) {
        try {
          audioSourceRef.current.stop();
        } catch {
          // Already stopped.
        }

        audioSourceRef.current =
          null;
      }

      if (
        audioContextRef.current
      ) {
        void audioContextRef.current.close();

        audioContextRef.current =
          null;
      }

      notificationBufferRef.current =
        null;

      audioUnlockedRef.current =
        false;
    };
  }, []);

  /*
   * =========================================================
   * FETCH BOOKINGS
   * =========================================================
   */

  const fetchBookings =
    useCallback(
      async (
        showLoader = false
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          setRefreshing(true);

          const {
            data,
            error,
          } = await supabase
            .from("bookings")
            .select(
              `
                id,
                booking_id,
                booking_status,
                worker_id,
                worker_name,
                worker_photo,
                worker_specialty,
                worker_rating,
                service_type,
                description,
                booking_date,
                booking_time,
                customer_name,
                customer_phone,
                customer_email,
                notes,
                total_cost,
                service_fee,
                materials_cost,
                package_price,
                grand_total,
                booking_type,
                work_status,
                worker_available,
                address_id,
                created_at
              `
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            )
            .limit(100);

          if (error) {
            console.error(
              "BOOKINGS FETCH ERROR:",
              error
            );

            return;
          }

          const formatted =
            (data || []).map(
              (item) =>
                ({
                  ...item,

                  booking_status:
                    normalizeStatus(
                      item.booking_status
                    ),
                }) as WorkerBooking
            );

          setBookings(
            formatted
          );
        } catch (error) {
          console.error(
            "BOOKINGS ERROR:",
            error
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    void fetchBookings(true);
  }, [
    fetchBookings,
  ]);

  /*
   * =========================================================
   * CREATE NEW BOOKING NOTIFICATION
   * =========================================================
   */

  const createNewBookingNotification =
    useCallback(
      (
        booking: WorkerBooking
      ) => {
        if (!booking.id) {
          return;
        }

        if (
          notifiedBookingIdsRef.current.has(
            booking.id
          )
        ) {
          return;
        }

        notifiedBookingIdsRef.current.add(
          booking.id
        );

        const notification: BookingNotification =
          {
            id:
              `${booking.id}-new`,

            type:
              "new",

            title:
              "New booking request",

            message:
              `${booking.customer_name || "Customer"} • ${
                booking.service_type ||
                "Worker service"
              } • #${
                booking.booking_id ||
                booking.id
              }`,

            bookingId:
              booking.id,

            createdAt:
              booking.created_at ||
              new Date().toISOString(),

            read:
              false,
          };

        setNotifications(
          (current) => [
            notification,
            ...current,
          ]
        );

        setLiveNotification(
          notification
        );

        setShowLiveNotification(
          true
        );

        void playNotificationSound();

        if (
          notificationTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            notificationTimerRef.current
          );
        }

        notificationTimerRef.current =
          window.setTimeout(
            () => {
              setShowLiveNotification(
                false
              );
            },
            6000
          );
      },
      [
        playNotificationSound,
      ]
    );

  /*
   * =========================================================
   * REALTIME
   * =========================================================
   */

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "worker-bookings-management-live"
        )

        /*
         * INSERT = NEW BOOKING
         */

        .on(
          "postgres_changes",
          {
            event:
              "INSERT",

            schema:
              "public",

            table:
              "bookings",
          },
          (payload) => {
            console.log(
              "NEW BOOKING:",
              payload.new
            );

            const newBooking =
              normalizeBooking(
                payload.new as Partial<WorkerBooking>
              );

            setBookings(
              (current) => {
                const exists =
                  current.some(
                    (item) =>
                      item.id ===
                      newBooking.id
                  );

                if (exists) {
                  return current;
                }

                return [
                  newBooking,
                  ...current,
                ];
              }
            );

            createNewBookingNotification(
              newBooking
            );

            setActiveTab(
              "pending"
            );
          }
        )

        /*
         * UPDATE = NO NOTIFICATION
         */

        .on(
          "postgres_changes",
          {
            event:
              "UPDATE",

            schema:
              "public",

            table:
              "bookings",
          },
          (payload) => {
            console.log(
              "BOOKING UPDATED:",
              payload.new
            );

            const updated =
              normalizeBooking(
                payload.new as Partial<WorkerBooking>
              );

            setBookings(
              (current) =>
                current.map(
                  (item) =>
                    item.id ===
                    updated.id
                      ? {
                          ...item,
                          ...updated,
                        }
                      : item
                )
            );
          }
        )

        /*
         * SUBSCRIBE
         */

        .subscribe(
          (status) => {
            console.log(
              "BOOKINGS REALTIME:",
              status
            );
          }
        );

    /*
     * BACKUP REFRESH
     */

    const interval =
      window.setInterval(
        () => {
          void fetchBookings(false);
        },
        5000
      );

    return () => {
      window.clearInterval(
        interval
      );

      supabase.removeChannel(
        channel
      );
    };
  }, [
    fetchBookings,
    createNewBookingNotification,
  ]);

  /*
   * =========================================================
   * NOTIFICATION TIMER CLEANUP
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (
        notificationTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          notificationTimerRef.current
        );
      }
    };
  }, []);

  /*
   * =========================================================
   * UPDATE BOOKING
   * =========================================================
   */

  const updateBooking =
    async (
      booking: WorkerBooking,
      status: BookingStatus,
      workStatus?: string,
      workerAvailable?: boolean
    ) => {
      const key =
        `${booking.id}-${status}`;

      try {
        setActionLoading(
          key
        );

        const update: Record<
          string,
          unknown
        > = {
          booking_status:
            status,
        };

        if (
          workStatus !==
          undefined
        ) {
          update.work_status =
            workStatus;
        }

        if (
          workerAvailable !==
          undefined
        ) {
          update.worker_available =
            workerAvailable;
        }

        const {
          error,
        } = await supabase
          .from("bookings")
          .update(update)
          .eq(
            "id",
            booking.id
          );

        if (error) {
          console.error(
            "STATUS UPDATE:",
            error
          );

          return;
        }

        setBookings(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                booking.id
                  ? {
                      ...item,

                      booking_status:
                        status,

                      work_status:
                        workStatus ??
                        item.work_status,

                      worker_available:
                        workerAvailable ??
                        item.worker_available,
                    }
                  : item
            )
        );

        await fetchBookings(
          false
        );
      } catch (error) {
        console.error(
          "UPDATE BOOKING ERROR:",
          error
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  /*
   * =========================================================
   * ACTIONS
   * =========================================================
   */

  const acceptBooking = (
    booking: WorkerBooking
  ) => {
    return updateBooking(
      booking,
      "confirmed",
      "scheduled",
      true
    );
  };

  const rejectBooking = (
    booking: WorkerBooking
  ) => {
    return updateBooking(
      booking,
      "rejected",
      "completed",
      true
    );
  };

  const startWork = (
    booking: WorkerBooking
  ) => {
    return updateBooking(
      booking,
      "confirmed",
      "active",
      false
    );
  };

  const completeWork = (
    booking: WorkerBooking
  ) => {
    return updateBooking(
      booking,
      "completed",
      "completed",
      true
    );
  };

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const searchedBookings =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return bookings;
      }

      return bookings.filter(
        (booking) =>
          [
            booking.booking_id,
            booking.worker_name,
            booking.customer_name,
            booking.customer_phone,
            booking.service_type,
            booking.worker_specialty,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    query
                  )
            )
      );
    }, [
      bookings,
      search,
    ]);

  /*
   * =========================================================
   * BOARD DATA
   * =========================================================
   */

  const pendingBookings =
    searchedBookings.filter(
      (booking) =>
        booking.booking_status ===
        "pending"
    );

  const confirmedBookings =
    searchedBookings.filter(
      (booking) =>
        booking.booking_status ===
          "confirmed" &&
        booking.work_status !==
          "active"
    );

  const outOfWorkBookings =
    searchedBookings.filter(
      (booking) =>
        booking.booking_status ===
          "confirmed" &&
        booking.work_status ===
          "active"
    );

  const completedBookings =
    searchedBookings.filter(
      (booking) =>
        booking.booking_status ===
        "completed"
    );

  const rejectedBookings =
    searchedBookings.filter(
      (booking) =>
        booking.booking_status ===
        "rejected"
    );

  /*
   * =========================================================
   * COMPLETED BOOKINGS
   *
   * ONLY COMPLETED:
   * RECENT 5 BY created_at
   * =========================================================
   */

  const recentCompletedBookings =
    useMemo(() => {
      return [...completedBookings]
        .sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ).getTime() -
            new Date(
              a.created_at || 0
            ).getTime()
        )
        .slice(0, 5);
    }, [
      completedBookings,
    ]);

  const displayedCompletedBookings =
    showAllCompleted
      ? completedBookings
      : recentCompletedBookings;

  /*
   * =========================================================
   * COUNTS
   * =========================================================
   */

  const counts = {
    pending:
      bookings.filter(
        (b) =>
          b.booking_status ===
          "pending"
      ).length,

    confirmed:
      bookings.filter(
        (b) =>
          b.booking_status ===
            "confirmed" &&
          b.work_status !==
            "active"
      ).length,

    outOfWork:
      bookings.filter(
        (b) =>
          b.booking_status ===
            "confirmed" &&
          b.work_status ===
            "active"
      ).length,

    completed:
      bookings.filter(
        (b) =>
          b.booking_status ===
          "completed"
      ).length,

    rejected:
      bookings.filter(
        (b) =>
          b.booking_status ===
          "rejected"
      ).length,
  };

  /*
   * =========================================================
   * ACTIVE BOARD
   * =========================================================
   */

  const activeBookings =
    activeTab === "pending"
      ? pendingBookings
      : activeTab === "confirmed"
        ? confirmedBookings
        : activeTab === "outOfWork"
          ? outOfWorkBookings
          : activeTab === "completed"
            ? displayedCompletedBookings
            : rejectedBookings;

  /*
   * =========================================================
   * BOARD INFO
   * =========================================================
   */

  const boardInfo = {
    pending: {
      title:
        "Pending Bookings",

      subtitle:
        "New worker booking requests",

      color:
        "red" as const,
    },

    confirmed: {
      title:
        "Confirmed Bookings",

      subtitle:
        "Accepted worker assignments",

      color:
        "blue" as const,
    },

    outOfWork: {
      title:
        "Out of Work",

      subtitle:
        "Workers currently working",

      color:
        "orange" as const,
    },

    completed: {
      title:
        "Completed Bookings",

      subtitle:
        showAllCompleted
          ? "All successfully completed bookings"
          : "Recent completed bookings",

      color:
        "green" as const,
    },

    rejected: {
      title:
        "Cancelled Bookings",

      subtitle:
        "Rejected booking requests",

      color:
        "rose" as const,
    },
  };

  const currentBoard =
    boardInfo[activeTab];

  /*
   * =========================================================
   * NOTIFICATION SELECT
   * =========================================================
   */

  function handleNotification(
    notification: BookingNotification
  ) {
    setNotifications(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item
        )
    );

    setShowLiveNotification(
      false
    );

    if (
      notification.bookingId
    ) {
      const booking =
        bookings.find(
          (item) =>
            item.id ===
            notification.bookingId
        );

      if (booking) {
        setSelectedBooking(
          booking
        );

        setShowNotificationBoard(
          false
        );
      }
    }
  }

  /*
   * =========================================================
   * OPEN NOTIFICATION BOARD
   * =========================================================
   */

  function openNotificationBoard() {
    void unlockNotificationAudio();

    setShowNotificationBoard(
      true
    );

    setShowLiveNotification(
      false
    );
  }

  /*
   * =========================================================
   * CLOSE NOTIFICATION BOARD
   * =========================================================
   */

  function closeNotificationBoard() {
    setShowNotificationBoard(
      false
    );
  }

  /*
   * =========================================================
   * CLEAR NOTIFICATIONS
   * =========================================================
   */

  function clearNotifications() {
    setNotifications([]);

    setShowLiveNotification(
      false
    );

    setLiveNotification(
      null
    );

    notifiedBookingIdsRef.current.clear();
  }

  /*
   * =========================================================
   * TAB CHANGE
   * =========================================================
   *
   * When entering Completed:
   * always show recent 5.
   */

  function handleTabChange(
    tab: BookingTab
  ) {
    setActiveTab(tab);

    if (tab === "completed") {
      setShowAllCompleted(false);
    }
  }

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  async function handleRefresh() {
    void unlockNotificationAudio();

    await fetchBookings(
      false
    );
  }

  /*
   * =========================================================
   * UNREAD COUNT
   * =========================================================
   */

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.read
    ).length;

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <BookingHeader
          search={search}
          onSearch={setSearch}
          notificationCount={0}
          refreshing
          onRefresh={
            handleRefresh
          }
          onNotificationClick={
            openNotificationBoard
          }
        />

        <div className="mx-auto max-w-[1600px] p-5 lg:p-7">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            {Array.from({
              length: 5,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    h-28
                    animate-pulse
                    rounded-2xl
                    bg-white
                  "
                />
              )
            )}
          </div>

          <div
            className="
              mt-5
              h-12
              animate-pulse
              rounded-xl
              bg-white
            "
          />

          <div
            className="
              mt-5
              h-[500px]
              animate-pulse
              rounded-2xl
              bg-white
            "
          />

          <div
            className="
              mt-5
              h-[300px]
              animate-pulse
              rounded-2xl
              bg-white
            "
          />
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#F7F9FC]">

      {/* =====================================================
          LIVE NOTIFICATION
      ===================================================== */}

      {showLiveNotification &&
        liveNotification && (
          <div
            className="
              fixed
              right-5
              top-5
              z-[9999]
              w-[360px]
              max-w-[calc(100vw-24px)]
              animate-in
              slide-in-from-right-8
              fade-in
              duration-300
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_18px_50px_rgba(15,23,42,0.18)]
              "
            >
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500" />

              <button
                type="button"
                onClick={() =>
                  setShowLiveNotification(
                    false
                  )
                }
                className="
                  absolute
                  right-3
                  top-3
                  z-10
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-500
                  transition
                  hover:bg-slate-200
                  hover:text-slate-800
                "
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleNotification(
                    liveNotification
                  )
                }
                className="
                  flex
                  w-full
                  items-start
                  gap-3
                  p-4
                  text-left
                  transition
                  hover:bg-slate-50
                "
              >
                <div className="relative shrink-0">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-red-50
                      text-red-600
                    "
                  >
                    <BellRing
                      className="h-5 w-5"
                      strokeWidth={2.5}
                    />
                  </div>

                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-red-500
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>

                <div className="min-w-0 flex-1 pr-5">
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        rounded-full
                        bg-red-50
                        px-2
                        py-0.5
                        text-[8px]
                        font-black
                        uppercase
                        tracking-wide
                        text-red-600
                      "
                    >
                      New Booking
                    </span>

                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  </div>

                  <h3 className="mt-2 text-[13px] font-black text-slate-900">
                    {
                      liveNotification.title
                    }
                  </h3>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                    {
                      liveNotification.message
                    }
                  </p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-red-600">
                      Tap to view booking
                    </span>

                    <span className="text-[9px] text-slate-300">
                      •
                    </span>

                    <span className="text-[9px] text-slate-400">
                      Just now
                    </span>
                  </div>
                </div>
              </button>

              <div className="h-[2px] w-full bg-slate-100">
                <div
                  className="
                    h-full
                    animate-[notificationProgress_6s_linear_forwards]
                    bg-red-500
                  "
                />
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          NOTIFICATION BOARD
      ===================================================== */}

      {showNotificationBoard && (
        <>
          <button
            type="button"
            aria-label="Close notification board"
            onClick={
              closeNotificationBoard
            }
            className="
              fixed
              inset-0
              z-[100]
              cursor-default
              bg-slate-900/30
              backdrop-blur-[2px]
            "
          />

          <aside
            className="
              fixed
              right-0
              top-0
              z-[101]
              flex
              h-screen
              w-[390px]
              max-w-[calc(100vw-20px)]
              flex-col
              bg-white
              shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
              animate-in
              slide-in-from-right
              duration-300
            "
          >
            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-slate-200
                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-600
                  "
                >
                  <BellRing
                    className="h-5 w-5"
                    strokeWidth={2.4}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-black text-slate-900">
                      Notifications
                    </h2>

                    {unreadCount > 0 && (
                      <span
                        className="
                          flex
                          h-5
                          min-w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-red-500
                          px-1.5
                          text-[8px]
                          font-black
                          text-white
                        "
                      >
                        {unreadCount >
                        9
                          ? "9+"
                          : unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                    New booking notifications
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeNotificationBoard
                }
                aria-label="Close notifications"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                  transition
                  hover:bg-slate-200
                  hover:text-slate-800
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <BookingNotifications
                notifications={
                  notifications
                }
                onSelect={
                  handleNotification
                }
                onClear={
                  clearNotifications
                }
              />
            </div>
          </aside>
        </>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <BookingHeader
        search={search}
        onSearch={setSearch}
        notificationCount={
          unreadCount
        }
        refreshing={
          refreshing
        }
        onRefresh={
          handleRefresh
        }
        onNotificationClick={
          openNotificationBoard
        }
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mx-auto max-w-[1600px] p-5 lg:p-7">

        <BookingStats
          pending={
            counts.pending
          }
          confirmed={
            counts.confirmed
          }
          outOfWork={
            counts.outOfWork
          }
          completed={
            counts.completed
          }
          rejected={
            counts.rejected
          }
        />

        <div className="mt-5 rounded-xl bg-white px-4">
          <BookingTabs
            active={
              activeTab
            }
            onChange={
              handleTabChange
            }
            counts={
              counts
            }
          />
        </div>

        {/* =================================================
            BOOKING BOARD
        ================================================= */}

        <div className="mt-5">

          {/* =================================================
              COMPLETED MORE BUTTON
          ================================================= */}

          {activeTab ===
            "completed" &&
            completedBookings.length >
              5 && (
              <div className="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setShowAllCompleted(
                      (current) =>
                        !current
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-black
                    text-emerald-600
                    transition
                    hover:bg-emerald-100
                    active:scale-95
                  "
                >
                  {showAllCompleted
                    ? "Recent 5"
                    : `More (${completedBookings.length})`}
                </button>
              </div>
            )}

          <BookingBoard
            title={
              currentBoard.title
            }
            subtitle={
              currentBoard.subtitle
            }
            count={
              activeBookings.length
            }
            color={
              currentBoard.color
            }
          >
            {activeBookings.length ===
            0 ? (
              <EmptyBoard
                title={
                  activeTab ===
                  "pending"
                    ? "No new bookings"
                    : activeTab ===
                        "confirmed"
                      ? "No confirmed bookings"
                      : activeTab ===
                          "outOfWork"
                        ? "No active work"
                        : activeTab ===
                            "completed"
                          ? "No completed work"
                          : "No cancelled bookings"
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {activeBookings.map(
                  (
                    booking
                  ) => (
                    <BookingCard
                      key={
                        booking.id
                      }
                      booking={
                        booking
                      }
                      mode={
                        activeTab
                      }
                      actionLoading={
                        actionLoading
                      }
                      onView={() =>
                        setSelectedBooking(
                          booking
                        )
                      }
                      onConfirm={() =>
                        acceptBooking(
                          booking
                        )
                      }
                      onReject={() =>
                        rejectBooking(
                          booking
                        )
                      }
                      onStartWork={() =>
                        startWork(
                          booking
                        )
                      }
                      onComplete={() =>
                        completeWork(
                          booking
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </BookingBoard>
        </div>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <div className="mt-5">
          <RecentActivity
            bookings={
              bookings
            }
          />
        </div>
      </div>

      {/* =====================================================
          BOOKING DETAILS
      ===================================================== */}

      <BookingDetails
        booking={
          selectedBooking
        }
        onClose={() =>
          setSelectedBooking(
            null
          )
        }
      />
    </div>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeStatus(
  status: unknown
): BookingStatus {
  if (
    status === "confirmed" ||
    status === "completed" ||
    status === "rejected"
  ) {
    return status;
  }

  return "pending";
}

function normalizeBooking(
  booking: Partial<WorkerBooking>
): WorkerBooking {
  return {
    id:
      booking.id ||
      crypto.randomUUID(),

    booking_id:
      booking.booking_id ||
      "UNKNOWN",

    booking_status:
      normalizeStatus(
        booking.booking_status
      ),

    worker_id:
      booking.worker_id ??
      null,

    worker_name:
      booking.worker_name ??
      null,

    worker_photo:
      booking.worker_photo ??
      null,

    worker_specialty:
      booking.worker_specialty ??
      null,

    worker_rating:
      booking.worker_rating ??
      null,

    service_type:
      booking.service_type ??
      null,

    description:
      booking.description ??
      null,

    booking_date:
      booking.booking_date ??
      null,

    booking_time:
      booking.booking_time ??
      null,

    customer_name:
      booking.customer_name ??
      null,

    customer_phone:
      booking.customer_phone ??
      null,

    customer_email:
      booking.customer_email ??
      null,

    notes:
      booking.notes ??
      null,

    total_cost:
      booking.total_cost ??
      0,

    service_fee:
      booking.service_fee ??
      0,

    materials_cost:
      booking.materials_cost ??
      0,

    package_price:
      booking.package_price ??
      0,

    grand_total:
      booking.grand_total ??
      0,

    booking_type:
      booking.booking_type ??
      null,

    work_status:
      booking.work_status ??
      "scheduled",

    worker_available:
      booking.worker_available ??
      true,

    address_id:
      booking.address_id ??
      null,

    created_at:
      booking.created_at ||
      new Date().toISOString(),
  };
}

function EmptyBoard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
          <span className="text-xl">
            —
          </span>
        </div>

        <h3 className="mt-3 text-sm font-black text-slate-700">
          {title}
        </h3>

        <p className="mt-1 text-[10px] text-slate-400">
          New activity will appear
          here automatically.
        </p>
      </div>
    </div>
  );
}