"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import OrdersTable from "./orders/OrdersTable";
import OrdersSearch from "./orders/OrdersSearch";
import OrderViewDrawer from "./orders/OrderViewDrawer";
import OrdersStats from "./orders/OrdersStats";
import NewOrdersBoard from "./orders/NewOrdersBoard";
import ConfirmedOrdersBoard from "./orders/ConfirmedOrdersBoard";
import OutForDeliveryBoard from "./orders/OutForDeliveryBoard";
import DeliveredBoard from "./orders/DeliveredBoard";
import OperationsDashboard from "./orders/OperationsDashboard";
import NewOrderNotification from "./orders/NewOrderNotification";
/* =====================================================
   TYPES
===================================================== */

type Order = {
  id: string | number;

  order_number?: string | null;

  customer_name?: string | null;

  customer_phone?: string | null;

  status?: string | null;

  payment_status?: string | null;

  rejection_reason?: string | null;

  created_at?: string | null;

  [key: string]: any;
};

type Props = {
  notificationOrder?: Order | null;
  notificationAction?: "view" | "accept" | "reject" | null;
  notificationOpenKey?: number;
  onNotificationHandled?: () => void;
  onNotificationStatusChanged?: (
    orderId: string | number,
  ) => void;
};

/* =====================================================
   STATUS MESSAGES
===================================================== */

const statusMessages: Record<string, string> = {
  Pending:
    "Your order has been placed successfully.",

  Confirmed:
    "Your order has been confirmed.",

  "Ready to Dispatch":
    "Your order is being prepared.",

  "Out For Delivery":
    "Your order is out for delivery.",

  Delivered:
    "Your order has been delivered successfully.",

  Cancelled:
    "Your order has been cancelled.",
};

/* =====================================================
   REJECTION REASONS
===================================================== */

const REJECTION_REASONS = [
  "Product unavailable",
  "Seller unavailable",
  "Delivery unavailable",
  "Payment issue",
  "Invalid order",
  "Customer request",
  "Duplicate order",
  "Other",
];

/* =====================================================
   COMPONENT
===================================================== */

export default function OrdersTab({
  notificationOrder,
  notificationAction,
  notificationOpenKey,
  onNotificationHandled,
  onNotificationStatusChanged,
}: Props) {
  /* ===================================================
     ORDERS
  =================================================== */

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* ===================================================
     SEARCH / FILTER
  =================================================== */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [paymentFilter, setPaymentFilter] =
    useState("All");

  /* ===================================================
     ORDER DRAWER
  =================================================== */

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [orderItems, setOrderItems] =
    useState<any[]>([]);

  const [showOrder, setShowOrder] =
    useState(false);

  /* ===================================================
     UI
  =================================================== */

  const [showMore, setShowMore] =
    useState(false);

  const [highlightOrderId, setHighlightOrderId] =
    useState<string | null>(null);

  /* ===================================================
     BULK SELECTION
  =================================================== */

  const [selectedOrders, setSelectedOrders] =
    useState<string[]>([]);

  /* ===================================================
     SINGLE REJECTION
  =================================================== */

  const [rejectingOrder, setRejectingOrder] =
    useState<Order | null>(null);

  const [rejectReason, setRejectReason] =
    useState("");

  const [customRejectReason, setCustomRejectReason] =
    useState("");

  const [rejectLoading, setRejectLoading] =
    useState(false);

  /* ===================================================
     BULK REJECTION
  =================================================== */

  const [bulkRejecting, setBulkRejecting] =
    useState(false);

  /* ===================================================
     FILTERED ORDERS
  =================================================== */

  const filtered = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase();

    return orders.filter(
      (order) => {
        const orderNumber =
          String(
            order.order_number ?? "",
          ).toLowerCase();

        const customerName =
          String(
            order.customer_name ?? "",
          ).toLowerCase();

        const customerPhone =
          String(
            order.customer_phone ?? "",
          ).toLowerCase();

        const matchesSearch =
          !q ||
          orderNumber.includes(q) ||
          customerName.includes(q) ||
          customerPhone.includes(q);

        const matchesStatus =
          statusFilter === "All" ||
          order.status ===
            statusFilter;

        const matchesPayment =
          paymentFilter === "All" ||
          order.payment_status ===
            paymentFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment
        );
      },
    );
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  /* ===================================================
     FETCH ORDERS
  =================================================== */

  const fetchOrders =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const {
            data,
            error,
          } =
            await supabase
              .from("orders")
              .select("*")
              .order(
                "created_at",
                {
                  ascending: false,
                },
              );

          if (error) {
            console.error(
              "[Orders] Fetch error:",
              error,
            );

            return;
          }

          setOrders(
            (data ?? []) as Order[],
          );
        } catch (error) {
          console.error(
            "[Orders] Unexpected fetch error:",
            error,
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchOrders();
  }, [
    fetchOrders,
  ]);

  /* ===================================================
     OPEN ORDER
  =================================================== */

  const openOrder =
    useCallback(
      async (
        order: Order,
      ) => {
        if (
          order?.id ===
            undefined ||
          order?.id ===
            null
        ) {
          return;
        }

        console.log(
          "[Orders] Opening order:",
          order.id,
        );

        /*
         * Set order immediately.
         */
        setSelectedOrder(
          order,
        );

        /*
         * Highlight order.
         */
        setHighlightOrderId(
          String(order.id),
        );

        /*
         * Open drawer immediately.
         *
         * This makes notification View Order
         * work even if order_items takes time.
         */
        setShowOrder(
          true,
        );

        /*
         * Fetch order items.
         */
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "order_items",
            )
            .select("*")
            .eq(
              "order_id",
              order.id,
            );

        if (error) {
          console.error(
            "[Orders] Order items error:",
            error,
          );

          setOrderItems(
            [],
          );

          return;
        }

        setOrderItems(
          data ?? [],
        );
      },
      [],
    );


  /* ===================================================
     UPDATE ORDER STATUS
  =================================================== */

  const updateOrderStatus =
    useCallback(
      async (
        id: string,
        status: string,
      ): Promise<boolean> => {
        const currentOrder =
          orders.find(
            (
              order,
            ) =>
              String(
                order.id,
              ) ===
              String(id),
          );

        if (
          !currentOrder
        ) {
          return false;
        }

        const currentStatus =
          currentOrder.status;

        /* ---------------------------------------------
           FINAL STATUS
        --------------------------------------------- */

        if (
          currentStatus ===
            "Delivered" ||
          currentStatus ===
            "Cancelled"
        ) {
          alert(
            `Order is already ${currentStatus}. Status cannot be changed.`,
          );

          return false;
        }

        /* ---------------------------------------------
           PREVENT BACKWARD MOVEMENT
        --------------------------------------------- */

        if (
          currentStatus ===
            "Out For Delivery" &&
          (
            status ===
              "Pending" ||
            status ===
              "Confirmed"
          )
        ) {
          alert(
            "Out For Delivery orders cannot be moved back.",
          );

          return false;
        }

        /* ---------------------------------------------
           UPDATE ORDER
        --------------------------------------------- */

        const {
          error,
        } =
          await supabase
            .from(
              "orders",
            )
            .update({
              status,
            })
            .eq(
              "id",
              id,
            );

        if (
          error
        ) {
          console.error(
            "[Orders] Status update error:",
            error,
          );

          alert(
            error.message ||
              "Unable to update order status.",
          );

          return false;
        }

        /* ---------------------------------------------
           STATUS HISTORY
        --------------------------------------------- */

        const {
          error:
            timelineError,
        } =
          await supabase
            .from(
              "order_status_history",
            )
            .insert({
              order_id:
                id,

              status,

              note:
                statusMessages[
                  status
                ] ??
                status,
            });

        if (
          timelineError
        ) {
          console.error(
            "[Orders] Timeline error:",
            timelineError,
          );
        }

        /* ---------------------------------------------
           LOCAL STATE
        --------------------------------------------- */

        setOrders(
          (
            prev,
          ) =>
            prev.map(
              (
                order,
              ) =>
                String(
                  order.id,
                ) ===
                String(id)
                  ? {
                      ...order,
                      status,
                    }
                  : order,
            ),
        );

        /* ---------------------------------------------
           DRAWER
        --------------------------------------------- */

        setSelectedOrder(
          (
            prev,
          ) =>
            prev &&
            String(
              prev.id,
            ) ===
              String(id)
              ? {
                  ...prev,
                  status,
                }
              : prev,
        );
        return true;
      },
      [
        orders,
      ],
    );

  /* ===================================================
     OPEN REJECT MODAL
  =================================================== */

  const openRejectModal =
    useCallback(
      (
        order: Order,
      ) => {
        if (
          !order
        ) {
          return;
        }

        if (
          order.status ===
            "Delivered" ||
          order.status ===
            "Cancelled"
        ) {
          alert(
            `Order is already ${order.status}.`,
          );

          return;
        }

        setRejectingOrder(
          order,
        );

        setRejectReason(
          "",
        );

        setCustomRejectReason(
          "",
        );
      },
      [],
    );

  /* ===================================================
     HANDLE NOTIFICATION ACTION
  =================================================== */

  useEffect(() => {
    if (!notificationOrder) {
      return;
    }

    if (
      notificationOrder.id === undefined ||
      notificationOrder.id === null
    ) {
      return;
    }

    let cancelled = false;

    const handleAction = async () => {
      console.log(
        "[Orders] Notification action:",
        notificationAction,
        notificationOrder.id,
      );

      if (notificationAction === "reject") {
        openRejectModal(notificationOrder);

        onNotificationHandled?.();
        return;
      }

      if (notificationAction === "accept") {
        const success =
          await updateOrderStatus(
            String(notificationOrder.id),
            "Confirmed",
          );

        if (cancelled) {
          return;
        }

        if (success) {
          onNotificationStatusChanged?.(
            notificationOrder.id,
          );
        }

        onNotificationHandled?.();
        return;
      }

      await openOrder(
        notificationOrder,
      );

      if (!cancelled) {
        onNotificationHandled?.();
      }
    };

    handleAction();

    return () => {
      cancelled = true;
    };
  }, [
    notificationOrder,
    notificationAction,
    notificationOpenKey,
    openOrder,
    openRejectModal,
    updateOrderStatus,
    onNotificationHandled,
    onNotificationStatusChanged,
  ]);

  /* ===================================================
     CLOSE REJECT MODAL
  =================================================== */

  const closeRejectModal =
    useCallback(
      () => {
        if (
          rejectLoading
        ) {
          return;
        }

        setRejectingOrder(
          null,
        );

        setRejectReason(
          "",
        );

        setCustomRejectReason(
          "",
        );
      },
      [
        rejectLoading,
      ],
    );

  /* ===================================================
     FINAL REJECTION REASON
  =================================================== */

  const getFinalRejectReason =
    useCallback(
      () => {
        if (
          rejectReason ===
          "Other"
        ) {
          return customRejectReason
            .trim();
        }

        return rejectReason
          .trim();
      },
      [
        rejectReason,
        customRejectReason,
      ],
    );

  /* ===================================================
     REJECT ONE ORDER
  =================================================== */

  const rejectOrder =
    useCallback(
      async () => {
        if (
          !rejectingOrder
        ) {
          return;
        }

        const reason =
          getFinalRejectReason();

        if (
          !reason
        ) {
          alert(
            rejectReason ===
              "Other"
              ? "Please enter the rejection reason."
              : "Please select a rejection reason.",
          );

          return;
        }

        setRejectLoading(
          true,
        );

        try {
          /* -------------------------------------------
             UPDATE ORDER
          -------------------------------------------- */

          const {
            error,
          } =
            await supabase
              .from(
                "orders",
              )
              .update({
                status:
                  "Cancelled",

                rejection_reason:
                  reason,
              })
              .eq(
                "id",
                rejectingOrder.id,
              );

          if (
            error
          ) {
            console.error(
              "[Orders] Reject error:",
              error,
            );

            alert(
              error.message ||
                "Unable to reject order.",
            );

            return;
          }

          /* -------------------------------------------
             TIMELINE
          -------------------------------------------- */

          const {
            error:
              timelineError,
          } =
            await supabase
              .from(
                "order_status_history",
              )
              .insert({
                order_id:
                  rejectingOrder.id,

                status:
                  "Cancelled",

                note:
                  `Order rejected. Reason: ${reason}`,
              });

          if (
            timelineError
          ) {
            console.error(
              "[Orders] Rejection timeline error:",
              timelineError,
            );
          }

          /* -------------------------------------------
             LOCAL STATE
          -------------------------------------------- */

          setOrders(
            (
              prev,
            ) =>
              prev.map(
                (
                  order,
                ) =>
                  String(
                    order.id,
                  ) ===
                  String(
                    rejectingOrder.id,
                  )
                    ? {
                        ...order,
                        status:
                          "Cancelled",
                        rejection_reason:
                          reason,
                      }
                    : order,
              ),
          );

          /* -------------------------------------------
             UPDATE DRAWER
          -------------------------------------------- */

          setSelectedOrder(
            (
              prev,
            ) =>
              prev &&
              String(
                prev.id,
              ) ===
                String(
                  rejectingOrder.id,
                )
                ? {
                    ...prev,
                    status:
                      "Cancelled",
                    rejection_reason:
                      reason,
                  }
                : prev,
          );

          /* -------------------------------------------
             REMOVE FROM SELECTION
          -------------------------------------------- */

          setSelectedOrders(
            (
              prev,
            ) =>
              prev.filter(
                (
                  id,
                ) =>
                  String(
                    id,
                  ) !==
                  String(
                    rejectingOrder.id,
                  ),
              ),
          );

          /* -------------------------------------------
             NOTIFICATION
          -------------------------------------------- */

          onNotificationStatusChanged?.(
            rejectingOrder.id,
          );

          /* -------------------------------------------
             CLOSE
          -------------------------------------------- */

          setRejectingOrder(
            null,
          );

          setRejectReason(
            "",
          );

          setCustomRejectReason(
            "",
          );
        } catch (
          error
        ) {
          console.error(
            "[Orders] Reject unexpected error:",
            error,
          );

          alert(
            "Unable to reject order.",
          );
        } finally {
          setRejectLoading(
            false,
          );
        }
      },
      [
        rejectingOrder,
        getFinalRejectReason,
        rejectReason,
        onNotificationStatusChanged,
      ],
    );

  /* ===================================================
     UPDATE PAYMENT STATUS
  =================================================== */

  const updatePaymentStatus =
    useCallback(
      async (
        id: string,
        paymentStatus: string,
      ) => {
        const {
          error,
        } =
          await supabase
            .from(
              "orders",
            )
            .update({
              payment_status:
                paymentStatus,
            })
            .eq(
              "id",
              id,
            );

        if (
          error
        ) {
          console.error(
            "[Orders] Payment update error:",
            error,
          );

          alert(
            error.message ||
              "Unable to update payment status.",
          );

          return;
        }

        setOrders(
          (
            prev,
          ) =>
            prev.map(
              (
                order,
              ) =>
                String(
                  order.id,
                ) ===
                String(id)
                  ? {
                      ...order,
                      payment_status:
                        paymentStatus,
                    }
                  : order,
            ),
        );

        setSelectedOrder(
          (
            prev,
          ) =>
            prev &&
            String(
              prev.id,
            ) ===
              String(id)
              ? {
                  ...prev,
                  payment_status:
                    paymentStatus,
                }
              : prev,
        );
      },
      [],
    );

  /* ===================================================
     TOGGLE ORDER
  =================================================== */

  const toggleOrder =
    useCallback(
      (
        id: string,
      ) => {
        setSelectedOrders(
          (
            prev,
          ) =>
            prev.includes(
              id,
            )
              ? prev.filter(
                  (
                    item,
                  ) =>
                    item !==
                    id,
                )
              : [
                  ...prev,
                  id,
                ],
        );
      },
      [],
    );

  /* ===================================================
     SELECT ALL
  =================================================== */

  const toggleSelectAll =
    useCallback(
      () => {
        const filteredIds =
          filtered.map(
            (
              order,
            ) =>
              String(
                order.id,
              ),
          );

        const allSelected =
          filteredIds.length >
            0 &&
          filteredIds.every(
            (
              id,
            ) =>
              selectedOrders.includes(
                id,
              ),
          );

        if (
          allSelected
        ) {
          setSelectedOrders(
            [],
          );
        } else {
          setSelectedOrders(
            filteredIds,
          );
        }
      },
      [
        filtered,
        selectedOrders,
      ],
    );

  /* ===================================================
     BULK UPDATE STATUS
  =================================================== */

  const bulkUpdateStatus =
    useCallback(
      async (
        status: string,
      ) => {
        if (
          selectedOrders.length ===
          0
        ) {
          return;
        }

        const invalidOrders =
          orders.filter(
            (
              order,
            ) => {
              const id =
                String(
                  order.id,
                );

              return (
                selectedOrders.includes(
                  id,
                ) &&
                (
                  order.status ===
                    "Delivered" ||
                  order.status ===
                    "Cancelled" ||
                  (
                    order.status ===
                      "Out For Delivery" &&
                    (
                      status ===
                        "Pending" ||
                      status ===
                        "Confirmed"
                    )
                  )
                )
              );
            },
          );

        if (
          invalidOrders.length >
          0
        ) {
          alert(
            "Some selected orders cannot be moved to this status.",
          );

          return;
        }

        const {
          error,
        } =
          await supabase
            .from(
              "orders",
            )
            .update({
              status,
            })
            .in(
              "id",
              selectedOrders,
            );

        if (
          error
        ) {
          console.error(
            "[Orders] Bulk update error:",
            error,
          );

          alert(
            error.message ||
              "Unable to update selected orders.",
          );

          return;
        }

        setOrders(
          (
            prev,
          ) =>
            prev.map(
              (
                order,
              ) =>
                selectedOrders.includes(
                  String(
                    order.id,
                  ),
                )
                  ? {
                      ...order,
                      status,
                    }
                  : order,
            ),
        );

        const {
          error:
            timelineError,
        } =
          await supabase
            .from(
              "order_status_history",
            )
            .insert(
              selectedOrders.map(
                (
                  id,
                ) => ({
                  order_id:
                    id,

                  status,

                  note:
                    statusMessages[
                      status
                    ] ??
                    status,
                }),
              ),
            );

        if (
          timelineError
        ) {
          console.error(
            "[Orders] Bulk timeline error:",
            timelineError,
          );
        }

        setSelectedOrders(
          [],
        );
      },
      [
        orders,
        selectedOrders,
      ],
    );

  /* ===================================================
     OPEN BULK REJECT
  =================================================== */

  const openBulkReject =
    useCallback(
      () => {
        if (
          selectedOrders.length ===
          0
        ) {
          return;
        }

        setBulkRejecting(
          true,
        );

        setRejectReason(
          "",
        );

        setCustomRejectReason(
          "",
        );
      },
      [
        selectedOrders.length,
      ],
    );

  /* ===================================================
     CLOSE BULK REJECT
  =================================================== */

  const closeBulkReject =
    useCallback(
      () => {
        if (
          rejectLoading
        ) {
          return;
        }

        setBulkRejecting(
          false,
        );

        setRejectReason(
          "",
        );

        setCustomRejectReason(
          "",
        );
      },
      [
        rejectLoading,
      ],
    );

  /* ===================================================
     REJECT SELECTED ORDERS
  =================================================== */

  const rejectSelectedOrders =
    useCallback(
      async () => {
        const reason =
          getFinalRejectReason();

        if (
          !reason
        ) {
          alert(
            rejectReason ===
              "Other"
              ? "Please enter the rejection reason."
              : "Please select a rejection reason.",
          );

          return;
        }

        if (
          selectedOrders.length ===
          0
        ) {
          return;
        }

        setRejectLoading(
          true,
        );

        try {
          const eligibleOrders =
            orders.filter(
              (
                order,
              ) =>
                selectedOrders.includes(
                  String(
                    order.id,
                  ),
                ) &&
                order.status !==
                  "Delivered" &&
                order.status !==
                  "Cancelled",
            );

          if (
            eligibleOrders.length ===
            0
          ) {
            alert(
              "No eligible orders selected.",
            );

            return;
          }

          const eligibleIds =
            eligibleOrders.map(
              (
                order,
              ) =>
                order.id,
            );

          /* -------------------------------------------
             UPDATE
          -------------------------------------------- */

          const {
            error,
          } =
            await supabase
              .from(
                "orders",
              )
              .update({
                status:
                  "Cancelled",

                rejection_reason:
                  reason,
              })
              .in(
                "id",
                eligibleIds,
              );

          if (
            error
          ) {
            console.error(
              "[Orders] Bulk rejection error:",
              error,
            );

            alert(
              error.message ||
                "Unable to reject selected orders.",
            );

            return;
          }

          /* -------------------------------------------
             TIMELINE
          -------------------------------------------- */

          const {
            error:
              timelineError,
          } =
            await supabase
              .from(
                "order_status_history",
              )
              .insert(
                eligibleIds.map(
                  (
                    id,
                  ) => ({
                    order_id:
                      id,

                    status:
                      "Cancelled",

                    note:
                      `Order rejected. Reason: ${reason}`,
                  }),
                ),
              );

          if (
            timelineError
          ) {
            console.error(
              "[Orders] Bulk rejection timeline error:",
              timelineError,
            );
          }

          /* -------------------------------------------
             LOCAL
          -------------------------------------------- */

          const eligibleIdStrings =
            eligibleIds.map(
              (
                id,
              ) =>
                String(
                  id,
                ),
            );

          setOrders(
            (
              prev,
            ) =>
              prev.map(
                (
                  order,
                ) =>
                  eligibleIdStrings.includes(
                    String(
                      order.id,
                    ),
                  )
                    ? {
                        ...order,
                        status:
                          "Cancelled",
                        rejection_reason:
                          reason,
                      }
                    : order,
              ),
          );

          setSelectedOrder(
            (
              prev,
            ) => {
              if (
                !prev
              ) {
                return prev;
              }

              if (
                eligibleIdStrings.includes(
                  String(
                    prev.id,
                  ),
                )
              ) {
                return {
                  ...prev,
                  status:
                    "Cancelled",
                  rejection_reason:
                    reason,
                };
              }

              return prev;
            },
          );

          setSelectedOrders(
            [],
          );

          setBulkRejecting(
            false,
          );

          setRejectReason(
            "",
          );

          setCustomRejectReason(
            "",
          );
        } catch (
          error
        ) {
          console.error(
            "[Orders] Bulk rejection unexpected error:",
            error,
          );

          alert(
            "Unable to reject selected orders.",
          );
        } finally {
          setRejectLoading(
            false,
          );
        }
      },
      [
        orders,
        selectedOrders,
        getFinalRejectReason,
        rejectReason,
      ],
    );

  /* ===================================================
     LOADING
  =================================================== */

  if (
    loading
  ) {
    return (
      <div className="flex h-96 items-center justify-center">

        <div className="text-sm font-medium text-slate-500">
          Loading orders...
        </div>

      </div>
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Orders Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {orders.length} total orders
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setShowMore(
              (
                prev,
              ) =>
                !prev,
            )
          }
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
        >
          {showMore ? (
            <>
              <span>
                ✕
              </span>

              Hide Details
            </>
          ) : (
            <>
              <span>
                ☰
              </span>

              More
            </>
          )}
        </button>

      </div>

      {/* =================================================
          OPERATIONS
      ================================================= */}

      <OperationsDashboard
        orders={
          orders
        }
      />

      {/* =================================================
          NEW ORDERS
      ================================================= */}

      <NewOrdersBoard
        orders={
          orders
        }
        onView={
          openOrder
        }
        onConfirm={
          updateOrderStatus
        }
        onReject={
          openRejectModal
        }
      />

      {/* =================================================
          CONFIRMED
      ================================================= */}

      <ConfirmedOrdersBoard
        orders={
          orders
        }
        onView={
          openOrder
        }
        onDispatch={
          updateOrderStatus
        }
      />

      {/* =================================================
          OUT FOR DELIVERY
      ================================================= */}

      <OutForDeliveryBoard
        orders={
          orders
        }
        onView={
          openOrder
        }
        onDelivered={
          updateOrderStatus
        }
      />

      {/* =================================================
          DELIVERED
      ================================================= */}

      <DeliveredBoard
        orders={
          orders
        }
        onView={
          openOrder
        }
      />

      {/* =================================================
          MORE DETAILS
      ================================================= */}

      {showMore && (
        <div
          className="
            fixed
            inset-0
            z-9999
            flex
            items-center
            justify-center
            bg-black/50
            p-6
            backdrop-blur-sm
          "
          onClick={() =>
            setShowMore(
              false,
            )
          }
        >

          <div
            className="
              relative
              h-[90vh]
              w-[98vw]
              max-w-7xl
              overflow-hidden
              rounded-3xl
              bg-white
              shadow-2xl
            "
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div
              className="
                sticky
                top-0
                z-20
                flex
                items-center
                justify-between
                border-b
                bg-white
                px-8
                py-5
              "
            >

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Order Management
                </h2>

                <p className="text-sm text-slate-500">
                  Search, Filter & Manage All Orders
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMore(
                    false,
                  )
                }
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-2
                  font-semibold
                  transition
                  hover:bg-slate-100
                "
              >
                ✕ Close
              </button>

            </div>

            {/* CONTENT */}

            <div
              className="
                h-[calc(90vh-80px)]
                overflow-y-auto
                p-8
              "
            >

              <OrdersSearch
                search={
                  search
                }
                status={
                  statusFilter
                }
                payment={
                  paymentFilter
                }
                onSearch={
                  setSearch
                }
                onStatus={
                  setStatusFilter
                }
                onPayment={
                  setPaymentFilter
                }
                onRefresh={
                  fetchOrders
                }
              />

              <OrdersStats
                orders={
                  orders
                }
                selectedStatus={
                  statusFilter
                }
                onSelectStatus={
                  setStatusFilter
                }
              />

              <div className="mt-6">

                <OrdersTable
                  orders={
                    filtered
                  }
                  onView={
                    openOrder
                  }
                  highlightOrderId={
                    highlightOrderId
                  }
                  selectedOrders={
                    selectedOrders
                  }
                  onSelect={
                    toggleOrder
                  }
                  allSelected={
                    filtered.length >
                      0 &&
                    filtered.every(
                      (
                        order,
                      ) =>
                        selectedOrders.includes(
                          String(
                            order.id,
                          ),
                        ),
                    )
                  }
                  onSelectAll={
                    toggleSelectAll
                  }
                />

              </div>

            </div>

          </div>

        </div>
      )}
{/* =================================================
    NEW ORDER NOTIFICATION
================================================= */}

{notificationOrder && (
  <div
    className="
      fixed
      right-5
      top-5
      z-[10002]
      w-[min(420px,calc(100vw-2rem))]
    "
  >
    <NewOrderNotification
      order={notificationOrder}

      onClose={() => {
        onNotificationHandled?.();
      }}

      onView={async () => {
        await openOrder(notificationOrder);
        onNotificationHandled?.();
      }}

      onAccept={async () => {
        const success = await updateOrderStatus(
          String(notificationOrder.id),
          "Confirmed",
        );

        if (success) {
          onNotificationStatusChanged?.(
            notificationOrder.id,
          );

          onNotificationHandled?.();
        }
      }}

      onReject={() => {
        openRejectModal(notificationOrder);
        onNotificationHandled?.();
      }}
    />
  </div>
)}
      {/* =================================================
          ORDER DRAWER
      ================================================= */}

      <OrderViewDrawer
        open={
          showOrder
        }
        order={
          selectedOrder
        }
        items={
          orderItems
        }
        onClose={() =>
          setShowOrder(
            false,
          )
        }
        onStatusChange={
          updateOrderStatus
        }
        onPaymentStatusChange={
          updatePaymentStatus
        }
      />

      {/* =================================================
          SINGLE REJECT MODAL
      ================================================= */}

      {rejectingOrder && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onClick={
            closeRejectModal
          }
        >

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Reject Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {rejectingOrder.order_number
                    ? `Order #${rejectingOrder.order_number}`
                    : "Reject this order"}
                </p>

              </div>

              <button
                type="button"
                disabled={
                  rejectLoading
                }
                onClick={
                  closeRejectModal
                }
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                  disabled:opacity-50
                "
              >
                ✕
              </button>

            </div>

            {/* REASON */}

            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-700">
                Rejection Reason
              </label>

              <select
                value={
                  rejectReason
                }
                onChange={(
                  event,
                ) => {
                  setRejectReason(
                    event.target.value,
                  );

                  if (
                    event.target.value !==
                    "Other"
                  ) {
                    setCustomRejectReason(
                      "",
                    );
                  }
                }}
                disabled={
                  rejectLoading
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                  disabled:bg-slate-100
                "
              >

                <option value="">
                  Select a reason
                </option>

                {REJECTION_REASONS.map(
                  (
                    reason,
                  ) => (
                    <option
                      key={
                        reason
                      }
                      value={
                        reason
                      }
                    >
                      {reason}
                    </option>
                  ),
                )}

              </select>

            </div>

            {/* CUSTOM */}

            {rejectReason ===
              "Other" && (
              <div className="mt-4">

                <label className="text-sm font-semibold text-slate-700">
                  Enter Reason
                </label>

                <textarea
                  value={
                    customRejectReason
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomRejectReason(
                      event.target.value,
                    )
                  }
                  disabled={
                    rejectLoading
                  }
                  rows={4}
                  placeholder="Enter the reason for rejecting this order..."
                  className="
                    mt-2
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-100
                    disabled:bg-slate-100
                  "
                />

              </div>
            )}

            {/* PREVIEW */}

            {getFinalRejectReason() && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  p-3
                "
              >

                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  Rejection Reason
                </p>

                <p className="mt-1 text-sm font-medium text-red-700">
                  {
                    getFinalRejectReason()
                  }
                </p>

              </div>
            )}

            {/* ACTIONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={
                  rejectLoading
                }
                onClick={
                  closeRejectModal
                }
                className="
                  flex-1
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  rejectLoading ||
                  !getFinalRejectReason()
                }
                onClick={
                  rejectOrder
                }
                className="
                  flex-1
                  rounded-xl
                  bg-red-500
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {rejectLoading
                  ? "Rejecting..."
                  : "Confirm Reject"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          BULK ACTION BAR
      ================================================= */}

      {selectedOrders.length >
        0 && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-[999]
            -translate-x-1/2
          "
        >

          <div
            className="
              flex
              items-center
              gap-5
              rounded-2xl
              border
              border-orange-200
              bg-white
              px-6
              py-4
              shadow-2xl
            "
          >

            <div>

              <p className="text-sm text-slate-500">
                Selected Orders
              </p>

              <p className="text-lg font-bold text-slate-900">
                {
                  selectedOrders.length
                }{" "}
                Selected
              </p>

            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  bulkUpdateStatus(
                    "Confirmed",
                  )
                }
                className="
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                Confirm
              </button>

              <button
                type="button"
                onClick={() =>
                  bulkUpdateStatus(
                    "Ready to Dispatch",
                  )
                }
                className="
                  rounded-xl
                  bg-orange-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-orange-700
                "
              >
                Dispatch
              </button>

              <button
                type="button"
                onClick={() =>
                  bulkUpdateStatus(
                    "Delivered",
                  )
                }
                className="
                  rounded-xl
                  bg-green-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-green-700
                "
              >
                Delivered
              </button>

              <button
                type="button"
                onClick={
                  openBulkReject
                }
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrders(
                    [],
                  )
                }
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                "
              >
                Clear
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          BULK REJECT MODAL
      ================================================= */}

      {bulkRejecting && (
        <div
          className="
            fixed
            inset-0
            z-[10001]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onClick={
            closeBulkReject
          }
        >

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Reject Selected Orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedOrders.length
                  }{" "}
                  orders selected
                </p>

              </div>

              <button
                type="button"
                disabled={
                  rejectLoading
                }
                onClick={
                  closeBulkReject
                }
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  transition
                  hover:bg-slate-100
                "
              >
                ✕
              </button>

            </div>

            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-700">
                Rejection Reason
              </label>

              <select
                value={
                  rejectReason
                }
                onChange={(
                  event,
                ) => {
                  setRejectReason(
                    event.target.value,
                  );

                  if (
                    event.target.value !==
                    "Other"
                  ) {
                    setCustomRejectReason(
                      "",
                    );
                  }
                }}
                disabled={
                  rejectLoading
                }
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              >

                <option value="">
                  Select a reason
                </option>

                {REJECTION_REASONS.map(
                  (
                    reason,
                  ) => (
                    <option
                      key={
                        reason
                      }
                      value={
                        reason
                      }
                    >
                      {reason}
                    </option>
                  ),
                )}

              </select>

            </div>

            {rejectReason ===
              "Other" && (
              <textarea
                value={
                  customRejectReason
                }
                onChange={(
                  event,
                ) =>
                  setCustomRejectReason(
                    event.target.value,
                  )
                }
                disabled={
                  rejectLoading
                }
                rows={4}
                placeholder="Enter rejection reason..."
                className="
                  mt-4
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              />
            )}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={
                  rejectLoading
                }
                onClick={
                  closeBulkReject
                }
                className="
                  flex-1
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  rejectLoading ||
                  !getFinalRejectReason()
                }
                onClick={
                  rejectSelectedOrders
                }
                className="
                  flex-1
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {rejectLoading
                  ? "Rejecting..."
                  : `Reject ${selectedOrders.length} Orders`}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}