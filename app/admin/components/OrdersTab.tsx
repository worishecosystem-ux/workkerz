"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import OrdersManagementPage from "./orders/OrdersManagementPage";
type DeviceType = "mobile" | "tablet" | "desktop";

function useDeviceType(): DeviceType {
  const getDevice = (): DeviceType => {
    if (typeof window === "undefined") return "desktop";

    const width = window.innerWidth;

    if (width < 768) return "mobile";
    if (width < 1200) return "tablet";

    return "desktop";
  };

  const [device, setDevice] = useState<DeviceType>(getDevice);

  useEffect(() => {
    const updateDevice = () => {
      setDevice(getDevice());
    };

    updateDevice();

    window.addEventListener("resize", updateDevice);

    return () => {
      window.removeEventListener("resize", updateDevice);
    };
  }, []);

  return device;
}

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
  onNotificationStatusChanged?: (id: string | number) => void;
};

const STATUS_MESSAGES: Record<string, string> = {
  Pending: "Your order has been placed successfully.",
  Confirmed: "Your order has been confirmed.",
  "Ready to Dispatch": "Your order is being prepared.",
  "Out For Delivery": "Your order is out for delivery.",
  Delivered: "Your order has been delivered successfully.",
  Cancelled: "Your order has been cancelled.",
};

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

type OrderBoardTab = "new" | "confirmed" | "dispatch" | "delivered";

export default function OrdersTab({
  notificationOrder,
  notificationAction,
  notificationOpenKey,
  onNotificationHandled,
  onNotificationStatusChanged,
}: Props) {
  const device = useDeviceType();

  const isMobile = device === "mobile";
  const isTablet = device === "tablet";
  const isDesktop = device === "desktop";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showOrder, setShowOrder] = useState(false);

  const [showMore, setShowMore] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [activeBoard, setActiveBoard] =
    useState<OrderBoardTab>("new");

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const number = String(order.order_number ?? "").toLowerCase();
      const name = String(order.customer_name ?? "").toLowerCase();
      const phone = String(order.customer_phone ?? "").toLowerCase();

      return (
        (!q ||
          number.includes(q) ||
          name.includes(q) ||
          phone.includes(q)) &&
        (statusFilter === "All" ||
          order.status === statusFilter) &&
        (paymentFilter === "All" ||
          order.payment_status === paymentFilter)
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  /* =========================================================
     FETCH
  ========================================================= */

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Orders] Fetch error:", error);
        return;
      }

      setOrders((data ?? []) as Order[]);
    } catch (error) {
      console.error("[Orders] Unexpected fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* =========================================================
     OPEN ORDER
  ========================================================= */

  const openOrder = useCallback(async (order: Order) => {
    if (order?.id == null) return;

    setSelectedOrder(order);
    setHighlightOrderId(String(order.id));
    setShowOrder(true);

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (error) {
      console.error("[Orders] Items error:", error);
      setOrderItems([]);
      return;
    }

    setOrderItems(data ?? []);
  }, []);

  /* =========================================================
     STATUS
  ========================================================= */

  const updateOrderStatus = useCallback(
    async (
      id: string | number,
      status: string,
    ): Promise<boolean> => {
      const current = orders.find(
        (o) => String(o.id) === String(id),
      );

      if (!current) return false;

      const currentStatus = current.status;

      if (
        ["Delivered", "Cancelled"].includes(
          currentStatus ?? "",
        )
      ) {
        alert(
          `Order is already ${currentStatus}. Status cannot be changed.`,
        );
        return false;
      }

      if (
        currentStatus === "Out For Delivery" &&
        ["Pending", "Confirmed"].includes(status)
      ) {
        alert(
          "Out For Delivery orders cannot be moved back.",
        );
        return false;
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("[Orders] Status error:", error);
        alert(
          error.message ||
            "Unable to update order status.",
        );
        return false;
      }

      await supabase
        .from("order_status_history")
        .insert({
          order_id: id,
          status,
          note:
            STATUS_MESSAGES[status] ?? status,
        });

      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(id)
            ? { ...o, status }
            : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev &&
        String(prev.id) === String(id)
          ? { ...prev, status }
          : prev,
      );

      return true;
    },
    [orders],
  );

  /* =========================================================
     PAYMENT
  ========================================================= */

  const updatePaymentStatus = useCallback(
    async (
      id: string | number,
      paymentStatus: string,
    ) => {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
        })
        .eq("id", id);

      if (error) {
        alert(
          error.message ||
            "Unable to update payment status.",
        );
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(id)
            ? {
                ...o,
                payment_status: paymentStatus,
              }
            : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev &&
        String(prev.id) === String(id)
          ? {
              ...prev,
              payment_status: paymentStatus,
            }
          : prev,
      );
    },
    [],
  );

  /* =========================================================
     REJECTION
  ========================================================= */

  const getFinalReason = useCallback(
    () =>
      rejectReason === "Other"
        ? customRejectReason.trim()
        : rejectReason.trim(),
    [rejectReason, customRejectReason],
  );

  const resetReject = useCallback(() => {
    if (rejectLoading) return;

    setRejectingOrder(null);
    setBulkRejecting(false);
    setRejectReason("");
    setCustomRejectReason("");
  }, [rejectLoading]);

  const openReject = useCallback((order: Order) => {
    if (
      !order ||
      ["Delivered", "Cancelled"].includes(
        order.status ?? "",
      )
    ) {
      alert(`Order is already ${order.status}.`);
      return;
    }

    setRejectingOrder(order);
    setRejectReason("");
    setCustomRejectReason("");
  }, []);

  const rejectOrders = useCallback(
    async (ids: (string | number)[]) => {
      const reason = getFinalReason();

      if (!reason) {
        alert(
          rejectReason === "Other"
            ? "Please enter the rejection reason."
            : "Please select a rejection reason.",
        );
        return;
      }

      if (!ids.length) return;

      setRejectLoading(true);

      try {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "Cancelled",
            rejection_reason: reason,
          })
          .in("id", ids);

        if (error) {
          alert(
            error.message ||
              "Unable to reject orders.",
          );
          return;
        }

        await supabase
          .from("order_status_history")
          .insert(
            ids.map((id) => ({
              order_id: id,
              status: "Cancelled",
              note: `Order rejected. Reason: ${reason}`,
            })),
          );

        const idSet = new Set(
          ids.map(String),
        );

        setOrders((prev) =>
          prev.map((o) =>
            idSet.has(String(o.id))
              ? {
                  ...o,
                  status: "Cancelled",
                  rejection_reason: reason,
                }
              : o,
          ),
        );

        setSelectedOrder((prev) =>
          prev &&
          idSet.has(String(prev.id))
            ? {
                ...prev,
                status: "Cancelled",
                rejection_reason: reason,
              }
            : prev,
        );

        setSelectedOrders([]);
        setRejectingOrder(null);
        setBulkRejecting(false);
        setRejectReason("");
        setCustomRejectReason("");

        ids.forEach((id) =>
          onNotificationStatusChanged?.(id),
        );
      } catch (error) {
        console.error(
          "[Orders] Reject error:",
          error,
        );
        alert("Unable to reject orders.");
      } finally {
        setRejectLoading(false);
      }
    },
    [
      getFinalReason,
      rejectReason,
      onNotificationStatusChanged,
    ],
  );

  const rejectSingle = useCallback(
    async () => {
      if (!rejectingOrder) return;

      await rejectOrders([
        rejectingOrder.id,
      ]);
    },
    [rejectingOrder, rejectOrders],
  );

  const openBulkReject = useCallback(() => {
    if (!selectedOrders.length) return;

    setRejectReason("");
    setCustomRejectReason("");
    setBulkRejecting(true);
  }, [selectedOrders.length]);

  /* =========================================================
     SELECTION
  ========================================================= */

  const toggleOrder = useCallback(
    (id: string) => {
      setSelectedOrders((prev) =>
        prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id],
      );
    },
    [],
  );

  const toggleSelectAll = useCallback(() => {
    const ids = filtered.map((o) =>
      String(o.id),
    );

    if (
      ids.length &&
      ids.every((id) =>
        selectedOrders.includes(id),
      )
    ) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ids);
    }
  }, [filtered, selectedOrders]);

  /* =========================================================
     BULK STATUS
  ========================================================= */

  const bulkUpdateStatus = useCallback(
    async (status: string) => {
      if (!selectedOrders.length) return;

      const invalid = orders.some((order) => {
        if (
          !selectedOrders.includes(
            String(order.id),
          )
        ) {
          return false;
        }

        if (
          ["Delivered", "Cancelled"].includes(
            order.status ?? "",
          )
        ) {
          return true;
        }

        return (
          order.status ===
            "Out For Delivery" &&
          ["Pending", "Confirmed"].includes(
            status,
          )
        );
      });

      if (invalid) {
        alert(
          "Some selected orders cannot be moved to this status.",
        );
        return;
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .in("id", selectedOrders);

      if (error) {
        alert(
          error.message ||
            "Unable to update selected orders.",
        );
        return;
      }

      await supabase
        .from("order_status_history")
        .insert(
          selectedOrders.map((id) => ({
            order_id: id,
            status,
            note:
              STATUS_MESSAGES[status] ??
              status,
          })),
        );

      const ids = new Set(
        selectedOrders,
      );

      setOrders((prev) =>
        prev.map((o) =>
          ids.has(String(o.id))
            ? { ...o, status }
            : o,
        ),
      );

      setSelectedOrders([]);
    },
    [orders, selectedOrders],
  );

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  useEffect(() => {
    if (!notificationOrder?.id) return;

    let cancelled = false;

    const run = async () => {
      if (
        notificationAction === "reject"
      ) {
        openReject(notificationOrder);
        onNotificationHandled?.();
        return;
      }

      if (
        notificationAction === "accept"
      ) {
        const success =
          await updateOrderStatus(
            notificationOrder.id,
            "Confirmed",
          );

        if (!cancelled && success) {
          onNotificationStatusChanged?.(
            notificationOrder.id,
          );
        }

        if (!cancelled) {
          onNotificationHandled?.();
        }

        return;
      }

      await openOrder(
        notificationOrder,
      );

      if (!cancelled) {
        onNotificationHandled?.();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    notificationOrder,
    notificationAction,
    notificationOpenKey,
    openOrder,
    openReject,
    updateOrderStatus,
    onNotificationHandled,
    onNotificationStatusChanged,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
          Loading orders...
        </div>
      </div>
    );
  }

  const allSelected =
    filtered.length > 0 &&
    filtered.every((o) =>
      selectedOrders.includes(
        String(o.id),
      ),
    );

  const newCount = orders.filter(
    (o) => o.status === "Pending",
  ).length;

  const confirmedCount = orders.filter(
    (o) => o.status === "Confirmed",
  ).length;

  const dispatchCount = orders.filter(
    (o) =>
      o.status === "Ready to Dispatch",
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.status === "Delivered",
  ).length;

  return (
    <div
      className={
        isMobile
          ? "min-h-screen w-full overflow-x-hidden bg-slate-50/50 px-3 pt-15 pb-24"
          : isTablet
            ? "min-h-screen w-full overflow-x-hidden bg-slate-50/50 px-5 pt-5 pb-8"
            : "min-h-screen w-full overflow-x-hidden bg-slate-50/50 px-8 pt-8 pb-8"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={
          isMobile
            ? "mb-4 flex flex-col gap-3"
            : isTablet
              ? "mb-5 flex items-center justify-between gap-5"
              : "mb-6 flex items-center justify-between gap-6"
        }
      >
        <div className="min-w-0">
          <h1
            className={
              isMobile
                ? "text-xl font-bold tracking-tight text-slate-900"
                : isTablet
                  ? "text-2xl font-bold tracking-tight text-slate-900"
                  : "text-3xl font-bold tracking-tight text-slate-900"
            }
          >
            Orders Management
          </h1>

          <p
            className={
              isMobile
                ? "mt-1 text-xs text-slate-500"
                : "mt-1 text-sm text-slate-500"
            }
          >
            {orders.length} total orders
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMore(true)}
          className={
            isMobile
              ? "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
              : "rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
          }
        >
          ☰ More Details
        </button>
      </header>

      {/* =====================================================
          OPERATIONS
      ===================================================== */}

      <OperationsDashboard
        orders={orders}
      />

      {/* =====================================================
          BOARD TABS
      ===================================================== */}

      <div
        className={
          isMobile
            ? "mb-4 mt-4 overflow-x-auto border-b border-slate-200 bg-white"
            : isTablet
              ? "mb-5 mt-5 overflow-x-auto border-b border-slate-200 bg-white"
              : "mb-6 mt-6 overflow-x-auto border-b border-slate-200 bg-white"
        }
      >
        <div className="flex min-w-max items-center">
          <BoardTab
            label="New"
            count={newCount}
            active={activeBoard === "new"}
            color="blue"
            onClick={() =>
              setActiveBoard("new")
            }
            mobile={isMobile}
          />

          <BoardTab
            label="Confirmed"
            count={confirmedCount}
            active={
              activeBoard === "confirmed"
            }
            color="indigo"
            onClick={() =>
              setActiveBoard("confirmed")
            }
            mobile={isMobile}
          />

          <BoardTab
            label="Dispatch"
            count={dispatchCount}
            active={
              activeBoard === "dispatch"
            }
            color="orange"
            onClick={() =>
              setActiveBoard("dispatch")
            }
            mobile={isMobile}
          />

          <BoardTab
            label="Delivered"
            count={deliveredCount}
            active={
              activeBoard === "delivered"
            }
            color="green"
            onClick={() =>
              setActiveBoard("delivered")
            }
            mobile={isMobile}
          />
        </div>
      </div>

      {/* =====================================================
          ACTIVE BOARD
      ===================================================== */}

      <div
        className={
          isMobile
            ? "space-y-3"
            : isTablet
              ? "space-y-4"
              : "space-y-5"
        }
      >
        {activeBoard === "new" && (
          <NewOrdersBoard
            orders={orders}
            onView={openOrder}
            onConfirm={updateOrderStatus}
            onReject={openReject}
          />
        )}

        {activeBoard ===
          "confirmed" && (
          <ConfirmedOrdersBoard
            orders={orders}
            onView={openOrder}
            onDispatch={
              updateOrderStatus
            }
          />
        )}

        {activeBoard ===
          "dispatch" && (
          <OutForDeliveryBoard
            orders={orders}
            onView={openOrder}
            onDelivered={
              updateOrderStatus
            }
          />
        )}

        {activeBoard ===
          "delivered" && (
          <DeliveredBoard
            orders={orders}
            onView={openOrder}
          />
        )}
      </div>

      {/* =====================================================
          MORE DETAILS
      ===================================================== */}

      {showMore && (
        <OrdersManagementPage
      isMobile={isMobile}
      isTablet={isTablet}
      orders={orders}
      filtered={filtered}
      search={search}
      statusFilter={statusFilter}
      paymentFilter={paymentFilter}
      highlightOrderId={highlightOrderId}
      selectedOrders={selectedOrders}
      allSelected={allSelected}
      onSearch={setSearch}
      onStatus={setStatusFilter}
      onPayment={setPaymentFilter}
      onRefresh={fetchOrders}
      onView={openOrder}
      onSelect={toggleOrder}
      onSelectAll={toggleSelectAll}
      onClose={() => setShowMore(false)}
    />
      )}

      {/* =====================================================
          NEW ORDER NOTIFICATION
      ===================================================== */}

      {notificationOrder && (
        <div
          className={
            isMobile
              ? "fixed left-3 right-3 top-3 z-[10002]"
              : "fixed right-5 top-5 z-[10002] w-[420px]"
          }
        >
          <NewOrderNotification
            order={notificationOrder}
            onClose={() =>
              onNotificationHandled?.()
            }
            onView={async () => {
              await openOrder(
                notificationOrder,
              );
              onNotificationHandled?.();
            }}
            onAccept={async () => {
              const success =
                await updateOrderStatus(
                  notificationOrder.id,
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
              openReject(
                notificationOrder,
              );
              onNotificationHandled?.();
            }}
          />
        </div>
      )}

      {/* =====================================================
          ORDER DRAWER
      ===================================================== */}

      <OrderViewDrawer
        open={showOrder}
        order={selectedOrder}
        items={orderItems}
        onClose={() =>
          setShowOrder(false)
        }
        onStatusChange={
          updateOrderStatus
        }
        onPaymentStatusChange={
          updatePaymentStatus
        }
      />

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {(rejectingOrder ||
        bulkRejecting) && (
        <RejectModal
          bulk={bulkRejecting}
          order={rejectingOrder}
          count={
            selectedOrders.length
          }
          reason={rejectReason}
          customReason={
            customRejectReason
          }
          loading={rejectLoading}
          onReasonChange={(value) => {
            setRejectReason(value);

            if (value !== "Other") {
              setCustomRejectReason(
                "",
              );
            }
          }}
          onCustomReasonChange={
            setCustomRejectReason
          }
          onClose={resetReject}
          onSubmit={
            rejectingOrder
              ? rejectSingle
              : () =>
                  rejectOrders(
                    selectedOrders,
                  )
          }
          finalReason={
            getFinalReason()
          }
        />
      )}

      {/* =====================================================
          BULK ACTION BAR
      ===================================================== */}

      {selectedOrders.length >
        0 && (
        <div
          className={
            isMobile
              ? "fixed inset-x-3 bottom-3 z-[999]"
              : "fixed bottom-5 left-1/2 z-[999] -translate-x-1/2"
          }
        >
          <div
            className={
              isMobile
                ? "rounded-2xl border border-orange-100 bg-white p-3 shadow-2xl"
                : "flex items-center gap-4 rounded-2xl border border-orange-100 bg-white px-5 py-3 shadow-2xl"
            }
          >
            <div
              className={
                isMobile
                  ? "mb-3"
                  : "shrink-0"
              }
            >
              <p className="text-[11px] text-slate-500">
                Selected Orders
              </p>

              <p className="text-sm font-bold text-slate-900">
                {selectedOrders.length}{" "}
                Selected
              </p>
            </div>

            <div
              className={
                isMobile
                  ? "grid grid-cols-2 gap-2"
                  : "flex items-center gap-2"
              }
            >
              <ActionButton
                label="Confirm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  bulkUpdateStatus(
                    "Confirmed",
                  )
                }
              />

              <ActionButton
                label="Dispatch"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() =>
                  bulkUpdateStatus(
                    "Ready to Dispatch",
                  )
                }
              />

              <ActionButton
                label="Delivered"
                className="bg-green-600 hover:bg-green-700"
                onClick={() =>
                  bulkUpdateStatus(
                    "Delivered",
                  )
                }
              />

              <ActionButton
                label="Reject"
                className="bg-red-600 hover:bg-red-700"
                onClick={
                  openBulkReject
                }
              />

              <button
                type="button"
                onClick={() =>
                  setSelectedOrders(
                    [],
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BOARD TAB
========================================================= */

function BoardTab({
  label,
  count,
  active,
  color,
  onClick,
  mobile,
}: {
  label: string;
  count: number;
  active: boolean;
  color:
    | "blue"
    | "indigo"
    | "orange"
    | "green";
  onClick: () => void;
  mobile: boolean;
}) {
  const colors = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-600",
    },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-600",
    },
    orange: {
      text: "text-orange-600",
      bg: "bg-orange-600",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-600",
    },
  };

  const c = colors[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex shrink-0 items-center font-semibold transition-colors ${
        mobile
          ? "gap-1.5 px-3 py-3 text-[12px]"
          : "gap-1.5 px-4 py-3 text-[13px]"
      } ${
        active
          ? c.text
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <span>{label}</span>

      {count > 0 && (
        <span
          className={`flex items-center justify-center rounded-full px-1 font-bold ${
            mobile
              ? "h-[17px] min-w-[17px] text-[8px]"
              : "h-[18px] min-w-[18px] text-[9px]"
          } ${
            active
              ? `${c.bg} text-white`
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {count}
        </span>
      )}

      {active && (
        <span
          className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full ${c.bg}`}
        />
      )}
    </button>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition ${className}`}
    >
      {label}
    </button>
  );
}

/* =========================================================
   REJECT MODAL
========================================================= */

function RejectModal({
  bulk,
  order,
  count,
  reason,
  customReason,
  loading,
  onReasonChange,
  onCustomReasonChange,
  onClose,
  onSubmit,
  finalReason,
}: {
  bulk: boolean;
  order: Order | null;
  count: number;
  reason: string;
  customReason: string;
  loading: boolean;
  onReasonChange: (
    value: string,
  ) => void;
  onCustomReasonChange: (
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
  finalReason: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl md:max-w-md md:rounded-2xl md:p-6"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">
              {bulk
                ? "Reject Selected Orders"
                : "Reject Order"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {bulk
                ? `${count} orders selected`
                : order?.order_number
                  ? `Order #${order.order_number}`
                  : "Reject this order"}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">
            Rejection Reason
          </label>

          <select
            value={reason}
            disabled={loading}
            onChange={(e) =>
              onReasonChange(
                e.target.value,
              )
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="">
              Select a reason
            </option>

            {REJECTION_REASONS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>
        </div>

        {reason === "Other" && (
          <textarea
            value={customReason}
            disabled={loading}
            onChange={(e) =>
              onCustomReasonChange(
                e.target.value,
              )
            }
            rows={4}
            placeholder="Enter rejection reason..."
            className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        )}

        {finalReason && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
              Rejection Reason
            </p>

            <p className="mt-1 wrap-break-word text-sm font-medium text-red-700">
              {finalReason}
            </p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              loading || !finalReason
            }
            onClick={onSubmit}
            className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Rejecting..."
              : bulk
                ? `Reject ${count}`
                : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}