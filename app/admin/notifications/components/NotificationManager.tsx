"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import NotificationHeader from "./NotificationHeader";
import NotificationStats from "./NotificationStats";
import NotificationFilters from "./NotificationFilters";

import NotificationCard, {
  type Notification,
} from "./NotificationCard";

import NotificationMobileCard from "./NotificationMobileCard";
import NotificationEmpty from "./NotificationEmpty";
import NotificationCreateDrawer, {
  type NotificationForm,
  type UserOption,
} from "./NotificationCreateDrawer";

import NotificationDetailDrawer from "./NotificationDetailDrawer";
/* =====================================================
   INITIAL FORM
===================================================== */

const initialForm: NotificationForm = {
  title: "",
  message: "",
  type: "system",
  target: "global",
  user_id: "",
  icon: "📢",
  image_url: "",
  action_url: "",
};

/* =====================================================
   UUID VALIDATION
===================================================== */

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function NotificationManager() {
  /* ===================================================
     STATE
  =================================================== */

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [users, setUsers] =
    useState<UserOption[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [targetFilter, setTargetFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [showUsers, setShowUsers] =
    useState(false);

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState<Notification | null>(null);

  const [form, setForm] =
    useState<NotificationForm>(
      initialForm
    );

  /* ===================================================
     LOAD NOTIFICATIONS
  =================================================== */

  const loadNotifications =
    useCallback(
      async (refresh = false) => {
        try {
          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const {
            data,
            error,
          } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

          if (error) {
            console.error(
              "Notifications load error:",
              error
            );

            return;
          }

          setNotifications(
            (data || []) as Notification[]
          );
        } catch (error) {
          console.error(
            "Notifications load error:",
            error
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /* ===================================================
   LOAD USERS
   REAL SUPABASE AUTH USERS
=================================================== */

const loadUsers = useCallback(
  async () => {
    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "[Notifications] Session error:",
          sessionError
        );

        setUsers([]);
        return;
      }

      const session =
        sessionData.session;

      if (!session?.access_token) {
        console.error(
          "[Notifications] No active session."
        );

        setUsers([]);
        return;
      }

      const response = await fetch(
        "/api/admin/notifications?users=true",
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`,
          },

          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      let result:
        | {
            success?: boolean;
            users?: UserOption[];
            count?: number;
            error?: string;
          }
        | null = null;

      if (responseText.trim()) {
        try {
          result =
            JSON.parse(
              responseText
            );
        } catch {
          console.error(
            "[Notifications] Invalid users API response:",
            responseText
          );

          setUsers([]);
          return;
        }
      }

      console.log(
        "[Notifications] Users API response:",
        {
          status:
            response.status,

          result,
        }
      );

      if (!response.ok) {
        console.error(
          "[Notifications] Users API error:",
          {
            status:
              response.status,

            result,
          }
        );

        setUsers([]);
        return;
      }

      const nextUsers =
        Array.isArray(
          result?.users
        )
          ? result.users
          : [];

      /* ---------------------------------------------
         VALID USER FILTER
      ---------------------------------------------- */

      const validUsers =
        nextUsers.filter(
          (user) => {
            if (
              !user ||
              typeof user.id !==
                "string"
            ) {
              return false;
            }

            if (
              !isValidUUID(
                user.id
              )
            ) {
              console.warn(
                "[Notifications] Invalid Auth user ID:",
                user.id
              );

              return false;
            }

            return true;
          }
        );

      console.log(
        "[Notifications] Real Auth users loaded:",
        validUsers.length
      );

      setUsers(
        validUsers
      );
    } catch (error) {
      console.error(
        "[Notifications] User loading error:",
        error
      );

      setUsers([]);
    }
  },
  []
);
  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    void loadNotifications();
    void loadUsers();
  }, [
    loadNotifications,
    loadUsers,
  ]);

  /* ===================================================
     REALTIME
  =================================================== */

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "admin-notifications-page"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            void loadNotifications(
              true
            );

            void loadUsers();
          }
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [
    loadNotifications,
    loadUsers,
  ]);

  /* ===================================================
     STATS
  =================================================== */

  const stats = useMemo(() => {
    const total =
      notifications.length;

    const unread =
      notifications.filter(
        (item) =>
          !item.is_read
      ).length;

    const read =
      notifications.filter(
        (item) =>
          item.is_read
      ).length;

    const global =
      notifications.filter(
        (item) =>
          item.is_global
      ).length;

    return {
      total,
      unread,
      read,
      global,
    };
  }, [notifications]);

  /* ===================================================
     FILTER
  =================================================== */

  const filteredNotifications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          const title =
            notification.title
              ?.toLowerCase() ||
            "";

          const message =
            notification.message
              ?.toLowerCase() ||
            "";

          const email =
            notification.customer_email
              ?.toLowerCase() ||
            "";

          const actionUrl =
            notification.action_url
              ?.toLowerCase() ||
            "";

          const searchMatch =
            !query ||
            title.includes(query) ||
            message.includes(query) ||
            email.includes(query) ||
            actionUrl.includes(query);

          const typeMatch =
            typeFilter === "all" ||
            notification.type ===
              typeFilter;

          const targetMatch =
            targetFilter === "all" ||
            (targetFilter ===
              "global" &&
              notification.is_global) ||
            (targetFilter ===
              "user" &&
              !notification.is_global);

          return (
            searchMatch &&
            typeMatch &&
            targetMatch
          );
        }
      );
    }, [
      notifications,
      search,
      typeFilter,
      targetFilter,
    ]);

  /* ===================================================
     UPDATE FORM
  =================================================== */

  const updateForm = (
    key: keyof NotificationForm,
    value: string
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  /* ===================================================
     TYPE CHANGE
  =================================================== */

  const handleTypeChange = (
    type: string
  ) => {
    const icons: Record<
      string,
      string
    > = {
      booking: "📋",
      work: "👷",
      payment: "💳",
      offer: "🎁",
      message: "💬",
      review: "⭐",
      system: "📢",
      update: "🚀",
    };

    setForm(
      (current) => ({
        ...current,

        type,

        icon:
          icons[type] ||
          current.icon ||
          "📢",
      })
    );
  };

  /* ===================================================
     OPEN CREATE
  =================================================== */

  const openCreate = () => {
    setForm({
      ...initialForm,
    });

    setShowUsers(false);
    setShowForm(true);
  };

  /* ===================================================
     CLOSE CREATE
  =================================================== */

  const closeCreate = () => {
    if (sending) {
      return;
    }

    setShowForm(false);
    setShowUsers(false);
  };

  /* ===================================================
     SEND NOTIFICATION
  =================================================== */

  const sendNotification =
    async (
      overrideForm?: NotificationForm
    ) => {
      /*
       * Version Update can pass
       * an override form directly.
       */

      const currentForm =
        overrideForm || form;

      /* ---------------------------------------------
         VALIDATION
      ---------------------------------------------- */

      const title =
        currentForm.title.trim();

      const message =
        currentForm.message.trim();

      if (!title) {
        alert(
          "Please enter notification title."
        );

        return;
      }

      if (!message) {
        alert(
          "Please enter notification message."
        );

        return;
      }

      /* ---------------------------------------------
         USER VALIDATION
      ---------------------------------------------- */

      let safeUserId:
        | string
        | null = null;

      if (
        currentForm.target ===
        "user"
      ) {
        const selectedId =
          currentForm.user_id.trim();

        if (!selectedId) {
          alert(
            "Please select a user."
          );

          return;
        }

        if (
          !isValidUUID(
            selectedId
          )
        ) {
          console.error(
            "[Notifications] Invalid user ID:",
            selectedId
          );

          alert(
            "Invalid user selected. Please select a user again."
          );

          return;
        }

        const selectedUser =
          users.find(
            (user) =>
              user.id ===
              selectedId
          );

        if (!selectedUser) {
          console.error(
            "[Notifications] User not found:",
            selectedId
          );

          alert(
            "Please select a valid user from the list."
          );

          return;
        }

        safeUserId =
          selectedId;
      }

      try {
        setSending(true);

        /* ---------------------------------------------
           SESSION
        ---------------------------------------------- */

        const {
          data:
            sessionData,
          error:
            sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError
          );

          alert(
            sessionError.message ||
              "Unable to verify admin session."
          );

          return;
        }

        const session =
          sessionData.session;

        if (
          !session?.access_token
        ) {
          alert(
            "Admin session expired. Please login again."
          );

          return;
        }

        /* ---------------------------------------------
           IMAGE
        ---------------------------------------------- */

        const imageUrl =
          currentForm.image_url
            ?.trim() || null;

        /* ---------------------------------------------
           ACTION URL
        ---------------------------------------------- */

        const actionUrl =
          currentForm.action_url
            ?.trim() || null;

        /* ---------------------------------------------
           PAYLOAD
        ---------------------------------------------- */

        const payload = {
          title,

          message,

          type:
            currentForm.type ||
            "system",

          icon:
            currentForm.icon?.trim() ||
            "📢",

          image_url:
            imageUrl,

          action_url:
            actionUrl,

          booking_id:
            null,

          user_id:
            currentForm.target ===
            "user"
              ? safeUserId
              : null,

          customer_email:
            null,

          is_global:
            currentForm.target ===
            "global",

          is_read:
            false,
        };

        console.log(
          "[Notifications] Sending payload:",
          payload
        );

        /* ---------------------------------------------
           API REQUEST
        ---------------------------------------------- */

        const response =
          await fetch(
            "/api/admin/notifications",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        /* ---------------------------------------------
           RESPONSE
        ---------------------------------------------- */

        const responseText =
          await response.text();

        let result:
          | Record<
              string,
              unknown
            >
          | null = null;

        if (
          responseText.trim()
        ) {
          try {
            result =
              JSON.parse(
                responseText
              );
          } catch {
            result = {
              message:
                responseText,
            };
          }
        }

        console.log(
          "[Notifications] API:",
          {
            status:
              response.status,

            result,
          }
        );

        /* ---------------------------------------------
           API ERROR
        ---------------------------------------------- */

        if (!response.ok) {
          console.error(
            "[Notifications] API ERROR:",
            {
              status:
                response.status,

              statusText:
                response.statusText,

              result,

              raw:
                responseText,
            }
          );

          let errorMessage =
            "Unable to send notification.";

          if (
            typeof result?.error ===
            "string"
          ) {
            errorMessage =
              result.error;
          } else if (
            typeof result?.message ===
            "string"
          ) {
            errorMessage =
              result.message;
          } else if (
            response.status ===
            401
          ) {
            errorMessage =
              "Admin session expired. Please login again.";
          } else if (
            response.status ===
            400
          ) {
            errorMessage =
              "Invalid notification data.";
          } else if (
            response.status ===
            500
          ) {
            errorMessage =
              "Server error while creating notification.";
          }

          if (
            typeof result?.details ===
            "string"
          ) {
            errorMessage +=
              `\n\n${result.details}`;
          }

          if (
            typeof result?.hint ===
            "string"
          ) {
            errorMessage +=
              `\n\nHint: ${result.hint}`;
          }

          alert(
            errorMessage
          );

          return;
        }

        /* ---------------------------------------------
           SUCCESS
        ---------------------------------------------- */

        console.log(
          "[Notifications] Sent successfully:",
          result
        );

        setForm({
          ...initialForm,
        });

        setShowUsers(false);
        setShowForm(false);

        await Promise.all([
          loadNotifications(
            true
          ),
          loadUsers(),
        ]);

        alert(
          "Notification sent successfully."
        );
      } catch (error) {
        console.error(
          "[Notifications] Request error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to connect to notification server."
        );
      } finally {
        setSending(false);
      }
    };

  /* ===================================================
     DELETE
  =================================================== */

  const deleteNotification =
    async (
      notification: Notification
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${notification.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        const {
          error,
        } = await supabase
          .from("notifications")
          .delete()
          .eq(
            "id",
            notification.id
          );

        if (error) {
          console.error(
            "Delete notification error:",
            error
          );

          alert(
            error.message ||
              "Unable to delete notification."
          );

          return;
        }

        setNotifications(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                notification.id
            )
        );

        if (
          selectedNotification?.id ===
          notification.id
        ) {
          setSelectedNotification(
            null
          );
        }

        await loadUsers();
      } catch (error) {
        console.error(
          "Delete notification error:",
          error
        );

        alert(
          "Unable to delete notification."
        );
      }
    };

  /* ===================================================
     VIEW
  =================================================== */

  const viewNotification = (
    notification: Notification
  ) => {
    setSelectedNotification(
      notification
    );
  };

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <main className="min-h-screen bg-[#f7f8f7]">

      {/* =================================================
          HEADER
      ================================================= */}

      <NotificationHeader
        refreshing={
          refreshing
        }
        onRefresh={() =>
          void loadNotifications(
            true
          )
        }
        onCreate={
          openCreate
        }
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]

          px-3
          py-4

          sm:px-5
          sm:py-5

          lg:px-8
          lg:py-6

          xl:px-10
        "
      >

        {/* =================================================
            STATS
        ================================================= */}

        <NotificationStats
          total={
            stats.total
          }
          unread={
            stats.unread
          }
          read={
            stats.read
          }
          global={
            stats.global
          }
        />

        {/* =================================================
            MAIN PANEL
        ================================================= */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-2xl
            border
            border-gray-200/70
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.035)]

            sm:mt-6
            sm:rounded-3xl
          "
        >

          {/* =================================================
              FILTERS
          ================================================= */}

          <NotificationFilters
            search={
              search
            }
            typeFilter={
              typeFilter
            }
            targetFilter={
              targetFilter
            }
            onSearchChange={
              setSearch
            }
            onTypeChange={
              setTypeFilter
            }
            onTargetChange={
              setTargetFilter
            }
          />

          {/* =================================================
              DATA
          ================================================= */}

          {loading ? (
            <LoadingState />
          ) : filteredNotifications.length ===
            0 ? (
            <NotificationEmpty />
          ) : (
            <>

              {/* =================================================
                  LARGE TABLET / LAPTOP / DESKTOP

                  lg = 1024px+
              ================================================= */}

              <div className="hidden lg:block">

                <div className="w-full overflow-hidden">

                  <table className="w-full table-fixed">

                    <colgroup>
                      <col className="w-[38%]" />
                      <col className="w-[12%]" />
                      <col className="w-[14%]" />
                      <col className="w-[11%]" />
                      <col className="w-[15%]" />
                      <col className="w-[10%]" />
                    </colgroup>

                    <thead>

                      <tr className="border-b border-gray-100 bg-gray-50/80">

                        <th
                          className={
                            tableHeadClass
                          }
                        >
                          Notification
                        </th>

                        <th
                          className={
                            tableHeadClass
                          }
                        >
                          Type
                        </th>

                        <th
                          className={
                            tableHeadClass
                          }
                        >
                          Target
                        </th>

                        <th
                          className={
                            tableHeadClass
                          }
                        >
                          Status
                        </th>

                        <th
                          className={
                            tableHeadClass
                          }
                        >
                          Date
                        </th>

                        <th
                          className={`
                            ${tableHeadClass}
                            text-right
                          `}
                        >
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredNotifications.map(
                        (
                          notification
                        ) => (
                          <NotificationCard
                            key={
                              notification.id
                            }
                            notification={
                              notification
                            }
                            onView={() =>
                              viewNotification(
                                notification
                              )
                            }
                            onDelete={() =>
                              deleteNotification(
                                notification
                              )
                            }
                          />
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =================================================
                  MOBILE + SMALL TABLET

                  < 1024px
              ================================================= */}

              <div className="block lg:hidden">

                <div className="divide-y divide-gray-100">

                  {filteredNotifications.map(
                    (
                      notification
                    ) => (
                      <NotificationMobileCard
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                        onView={() =>
                          viewNotification(
                            notification
                          )
                        }
                        onDelete={() =>
                          deleteNotification(
                            notification
                          )
                        }
                      />
                    )
                  )}

                </div>

              </div>

            </>
          )}

        </section>

      </div>

      {/* =================================================
          CREATE DRAWER
      ================================================= */}

      <NotificationCreateDrawer
        open={
          showForm
        }
        sending={
          sending
        }
        form={
          form
        }
        users={
          users
        }
        showUsers={
          showUsers
        }
        onClose={
          closeCreate
        }
        onSend={
          sendNotification
        }
        onChange={
          updateForm
        }
        onToggleUsers={() =>
          setShowUsers(
            (value) =>
              !value
          )
        }
        onSelectUser={(
          id
        ) => {
          if (
            !isValidUUID(id)
          ) {
            console.error(
              "[Notifications] Invalid selected user:",
              id
            );

            alert(
              "Invalid user selected."
            );

            return;
          }

          updateForm(
            "user_id",
            id
          );

          setShowUsers(
            false
          );
        }}
        onTypeChange={
          handleTypeChange
        }
      />

      {/* =================================================
          DETAIL DRAWER
      ================================================= */}

      <NotificationDetailDrawer
        notification={
          selectedNotification
        }
        onClose={() =>
          setSelectedNotification(
            null
          )
        }
        onDelete={() => {
          if (
            selectedNotification
          ) {
            void deleteNotification(
              selectedNotification
            );
          }
        }}
      />

    </main>
  );
}

/* =====================================================
   TABLE HEAD
===================================================== */

const tableHeadClass = `
  px-4
  py-3.5
  text-left
  text-[10px]
  font-bold
  uppercase
  tracking-[0.08em]
  text-gray-400
`;

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="divide-y divide-gray-100">

      {[
        1,
        2,
        3,
        4,
        5,
      ].map(
        (item) => (
          <div
            key={
              item
            }
            className="
              flex
              gap-3
              p-4

              sm:gap-4
              sm:p-5
            "
          >

            <div
              className="
                h-11
                w-11
                shrink-0
                animate-pulse
                rounded-xl
                bg-gray-200
              "
            />

            <div
              className="
                min-w-0
                flex-1
                space-y-2
              "
            >

              <div
                className="
                  h-4
                  w-48
                  animate-pulse
                  rounded
                  bg-gray-200
                "
              />

              <div
                className="
                  h-3
                  w-full
                  max-w-xl
                  animate-pulse
                  rounded
                  bg-gray-200
                "
              />

              <div
                className="
                  h-3
                  w-24
                  animate-pulse
                  rounded
                  bg-gray-200
                "
              />

            </div>

          </div>
        )
      )}

    </div>
  );
}