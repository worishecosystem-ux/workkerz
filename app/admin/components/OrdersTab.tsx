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

export default function OrdersTab({
  notificationOrder,
  notificationAction,
  notificationOpenKey,
  onNotificationHandled,
  onNotificationStatusChanged,
}: Props) {
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

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const number = String(order.order_number ?? "").toLowerCase();
      const name = String(order.customer_name ?? "").toLowerCase();
      const phone = String(order.customer_phone ?? "").toLowerCase();

      return (
        (!q || number.includes(q) || name.includes(q) || phone.includes(q)) &&
        (statusFilter === "All" || order.status === statusFilter) &&
        (paymentFilter === "All" || order.payment_status === paymentFilter)
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  /* ---------------- FETCH ---------------- */

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

  /* ---------------- OPEN ORDER ---------------- */

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

  /* ---------------- STATUS ---------------- */

  const updateOrderStatus = useCallback(
    async (id: string | number, status: string): Promise<boolean> => {
      const current = orders.find((o) => String(o.id) === String(id));

      if (!current) return false;

      const currentStatus = current.status;

      if (["Delivered", "Cancelled"].includes(currentStatus ?? "")) {
        alert(`Order is already ${currentStatus}. Status cannot be changed.`);
        return false;
      }

      if (
        currentStatus === "Out For Delivery" &&
        ["Pending", "Confirmed"].includes(status)
      ) {
        alert("Out For Delivery orders cannot be moved back.");
        return false;
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error("[Orders] Status error:", error);
        alert(error.message || "Unable to update order status.");
        return false;
      }

      await supabase.from("order_status_history").insert({
        order_id: id,
        status,
        note: STATUS_MESSAGES[status] ?? status,
      });

      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(id) ? { ...o, status } : o)),
      );

      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(id) ? { ...prev, status } : prev,
      );

      return true;
    },
    [orders],
  );

  /* ---------------- PAYMENT ---------------- */

  const updatePaymentStatus = useCallback(
    async (id: string | number, paymentStatus: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", id);

      if (error) {
        alert(error.message || "Unable to update payment status.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          String(o.id) === String(id)
            ? { ...o, payment_status: paymentStatus }
            : o,
        ),
      );

      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(id)
          ? { ...prev, payment_status: paymentStatus }
          : prev,
      );
    },
    [],
  );

  /* ---------------- REJECTION ---------------- */

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
    if (!order || ["Delivered", "Cancelled"].includes(order.status ?? "")) {
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
          alert(error.message || "Unable to reject orders.");
          return;
        }

        await supabase.from("order_status_history").insert(
          ids.map((id) => ({
            order_id: id,
            status: "Cancelled",
            note: `Order rejected. Reason: ${reason}`,
          })),
        );

        const idSet = new Set(ids.map(String));

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
          prev && idSet.has(String(prev.id))
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

        ids.forEach((id) => onNotificationStatusChanged?.(id));
      } catch (error) {
        console.error("[Orders] Reject error:", error);
        alert("Unable to reject orders.");
      } finally {
        setRejectLoading(false);
      }
    },
    [getFinalReason, rejectReason, onNotificationStatusChanged],
  );

  const rejectSingle = useCallback(async () => {
    if (!rejectingOrder) return;
    await rejectOrders([rejectingOrder.id]);
  }, [rejectingOrder, rejectOrders]);

  const openBulkReject = useCallback(() => {
    if (!selectedOrders.length) return;

    setRejectReason("");
    setCustomRejectReason("");
    setBulkRejecting(true);
  }, [selectedOrders.length]);

  /* ---------------- SELECTION ---------------- */

  const toggleOrder = useCallback((id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const ids = filtered.map((o) => String(o.id));

    if (ids.length && ids.every((id) => selectedOrders.includes(id))) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ids);
    }
  }, [filtered, selectedOrders]);

  /* ---------------- BULK STATUS ---------------- */

  const bulkUpdateStatus = useCallback(
    async (status: string) => {
      if (!selectedOrders.length) return;

      const invalid = orders.some((order) => {
        if (!selectedOrders.includes(String(order.id))) return false;

        if (["Delivered", "Cancelled"].includes(order.status ?? ""))
          return true;

        return (
          order.status === "Out For Delivery" &&
          ["Pending", "Confirmed"].includes(status)
        );
      });

      if (invalid) {
        alert("Some selected orders cannot be moved to this status.");
        return;
      }

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .in("id", selectedOrders);

      if (error) {
        alert(error.message || "Unable to update selected orders.");
        return;
      }

      await supabase.from("order_status_history").insert(
        selectedOrders.map((id) => ({
          order_id: id,
          status,
          note: STATUS_MESSAGES[status] ?? status,
        })),
      );

      const ids = new Set(selectedOrders);

      setOrders((prev) =>
        prev.map((o) => (ids.has(String(o.id)) ? { ...o, status } : o)),
      );

      setSelectedOrders([]);
    },
    [orders, selectedOrders],
  );

  /* ---------------- NOTIFICATION ACTION ---------------- */

  useEffect(() => {
    if (!notificationOrder?.id) return;

    let cancelled = false;

    const run = async () => {
      if (notificationAction === "reject") {
        openReject(notificationOrder);
        onNotificationHandled?.();
        return;
      }

      if (notificationAction === "accept") {
        const success = await updateOrderStatus(
          notificationOrder.id,
          "Confirmed",
        );

        if (!cancelled && success) {
          onNotificationStatusChanged?.(notificationOrder.id);
        }

        if (!cancelled) onNotificationHandled?.();
        return;
      }

      await openOrder(notificationOrder);

      if (!cancelled) onNotificationHandled?.();
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

  /* ---------------- LOADING ---------------- */

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
    filtered.every((o) => selectedOrders.includes(String(o.id)));

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50/50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            Orders Management
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {orders.length} total orders
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMore(true)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 sm:w-auto"
        >
          ☰ More Details
        </button>
      </header>

      {/* OPERATIONS */}
      <OperationsDashboard orders={orders} />

      {/* BOARDS */}
      <div className="space-y-4 sm:space-y-5">
        <NewOrdersBoard
          orders={orders}
          onView={openOrder}
          onConfirm={updateOrderStatus}
          onReject={openReject}
        />

        <ConfirmedOrdersBoard
          orders={orders}
          onView={openOrder}
          onDispatch={updateOrderStatus}
        />

        <OutForDeliveryBoard
          orders={orders}
          onView={openOrder}
          onDelivered={updateOrderStatus}
        />

        <DeliveredBoard orders={orders} onView={openOrder} />
      </div>

      {/* MORE DETAILS */}
      {showMore && (
        <div
          className="fixed inset-0 z-9999 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 lg:p-6"
          onClick={() => setShowMore(false)}
        >
          <section
            className="flex h-[96vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[92vh] sm:max-w-7xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
                  Order Management
                </h2>
                <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
                  Search, filter and manage all orders
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ✕<span className="ml-1 hidden sm:inline">Close</span>
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
              <OrdersSearch
                search={search}
                status={statusFilter}
                payment={paymentFilter}
                onSearch={setSearch}
                onStatus={setStatusFilter}
                onPayment={setPaymentFilter}
                onRefresh={fetchOrders}
              />

              <div className="mt-4 sm:mt-5">
                <OrdersStats
                  orders={orders}
                  selectedStatus={statusFilter}
                  onSelectStatus={setStatusFilter}
                />
              </div>

              <div className="mt-4 overflow-x-auto sm:mt-6">
                <OrdersTable
                  orders={filtered}
                  onView={openOrder}
                  highlightOrderId={highlightOrderId}
                  selectedOrders={selectedOrders}
                  onSelect={toggleOrder}
                  allSelected={allSelected}
                  onSelectAll={toggleSelectAll}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* NEW ORDER NOTIFICATION */}
      {notificationOrder && (
        <div className="fixed left-3 right-3 top-3 z-10002 sm:left-auto sm:right-5 sm:top-5 sm:w-105">
          <NewOrderNotification
            order={notificationOrder}
            onClose={() => onNotificationHandled?.()}
            onView={async () => {
              await openOrder(notificationOrder);
              onNotificationHandled?.();
            }}
            onAccept={async () => {
              const success = await updateOrderStatus(
                notificationOrder.id,
                "Confirmed",
              );

              if (success) {
                onNotificationStatusChanged?.(notificationOrder.id);
                onNotificationHandled?.();
              }
            }}
            onReject={() => {
              openReject(notificationOrder);
              onNotificationHandled?.();
            }}
          />
        </div>
      )}

      {/* ORDER DRAWER */}
      <OrderViewDrawer
        open={showOrder}
        order={selectedOrder}
        items={orderItems}
        onClose={() => setShowOrder(false)}
        onStatusChange={updateOrderStatus}
        onPaymentStatusChange={updatePaymentStatus}
      />

      {/* REJECT MODAL */}
      {(rejectingOrder || bulkRejecting) && (
        <RejectModal
          bulk={bulkRejecting}
          order={rejectingOrder}
          count={selectedOrders.length}
          reason={rejectReason}
          customReason={customRejectReason}
          loading={rejectLoading}
          onReasonChange={(value) => {
            setRejectReason(value);
            if (value !== "Other") setCustomRejectReason("");
          }}
          onCustomReasonChange={setCustomRejectReason}
          onClose={resetReject}
          onSubmit={
            rejectingOrder ? rejectSingle : () => rejectOrders(selectedOrders)
          }
          finalReason={getFinalReason()}
        />
      )}

      {/* BULK ACTION BAR */}
      {selectedOrders.length > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-[999] sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2">
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-2xl sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3">
            <div className="flex items-center justify-between sm:block">
              <div>
                <p className="text-[11px] text-slate-500">Selected Orders</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedOrders.length} Selected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <ActionButton
                label="Confirm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => bulkUpdateStatus("Confirmed")}
              />

              <ActionButton
                label="Dispatch"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => bulkUpdateStatus("Ready to Dispatch")}
              />

              <ActionButton
                label="Delivered"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => bulkUpdateStatus("Delivered")}
              />

              <ActionButton
                label="Reject"
                className="bg-red-600 hover:bg-red-700"
                onClick={openBulkReject}
              />

              <button
                type="button"
                onClick={() => setSelectedOrders([])}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:px-4 sm:text-sm"
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
      className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition sm:px-4 sm:text-sm ${className}`}
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
  onReasonChange: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  finalReason: string;
}) {
  return (
    <div
      className="fixed inset-0 z-10000 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {bulk ? "Reject Selected Orders" : "Reject Order"}
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
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
            onChange={(e) => onReasonChange(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="">Select a reason</option>

            {REJECTION_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {reason === "Other" && (
          <textarea
            value={customReason}
            disabled={loading}
            onChange={(e) => onCustomReasonChange(e.target.value)}
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

        <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
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
            disabled={loading || !finalReason}
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
