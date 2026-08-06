"use client";

import { useEffect, useState } from "react";
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
import { useCallback } from "react";
import { useMemo } from "react";
type Props = {
  notificationOrder?: any;
  onNotificationHandled?: () => void;
};
export default function OrdersTab({ notificationOrder, onNotificationHandled, }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showOrder, setShowOrder] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showMore, setShowMore] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);
  const filtered = useMemo(() => {
  const q = search.toLowerCase();

  return orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(q) ||
      order.customer_name?.toLowerCase().includes(q) ||
      order.customer_phone?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    const matchesPayment =
      paymentFilter === "All" ||
      order.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });
}, [orders, search, statusFilter, paymentFilter]);
  const updateOrderStatus = async (id: string, status: string) => {
    const currentOrder = orders.find((o) => o.id === id);

    if (!currentOrder) return;

    const currentStatus = currentOrder.status;

    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      alert(`Order is already ${currentStatus}. Status cannot be changed.`);
      return;
    }

    if (
      currentStatus === "Out For Delivery" &&
      (status === "Pending" || status === "Confirmed")
    ) {
      alert("Out For Delivery orders cannot be moved back.");
      return;
    }
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    await supabase.from("order_status_history").insert({
      order_id: id,
      status,
    });
    if (error) {
      return;
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );

    setSelectedOrder((prev: any) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
  };
  const toggleOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    if (selectedOrders.length === filtered.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map((o) => o.id));
    }
  };
  useEffect(() => {
  if (!notificationOrder) return;

  (async () => {
    await openOrder(notificationOrder);
    onNotificationHandled?.();
  })();
}, [notificationOrder]);
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = useCallback(async () => {
  setLoading(true);

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  setOrders(data || []);
  setLoading(false);
}, []);

  const openOrder = async (order: any) => {
    setSelectedOrder(order);

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    const openOrder = async (order: any) => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (error) return;

      setSelectedOrder(order);
      setOrderItems(data || []);
      setShowOrder(true);
    };
    if (error) {
      return;
    }

    setOrderItems(data || []);
    setShowOrder(true);
  };
  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
      })
      .eq("id", id);

    if (error) {
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              payment_status: paymentStatus,
            }
          : order,
      ),
    );

    setSelectedOrder((prev: any) =>
      prev && prev.id === id
        ? {
            ...prev,
            payment_status: paymentStatus,
          }
        : prev,
    );
  };
  const bulkUpdateStatus = async (status: string) => {
    const invalidOrders = orders.filter(
      (o) =>
        selectedOrders.includes(o.id) &&
        (o.status === "Delivered" ||
          o.status === "Cancelled" ||
          (o.status === "Out For Delivery" &&
            (status === "Pending" || status === "Confirmed"))),
    );

    if (invalidOrders.length > 0) {
      alert("Some selected orders cannot be moved to this status.");
      return;
    }
    if (selectedOrders.length === 0) return;

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .in("id", selectedOrders);

    if (error) return;

    setOrders((prev) =>
      prev.map((order) =>
        selectedOrders.includes(order.id) ? { ...order, status } : order,
      ),
    );

    await supabase.from("order_status_history").insert(
      selectedOrders.map((id) => ({
        order_id: id,
        status,
      })),
    );

    setSelectedOrders([]);
  };
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading orders...
      </div>
    );
  }
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Orders Management
          </h1>
        </div>

        <button
         onClick={() => setShowMore((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
        >
          {showMore ? (
            <>
              <span>✕</span>
              Hide Details
            </>
          ) : (
            <>
              <span>☰</span>
              More
            </>
          )}
        </button>
      </div>

      <OperationsDashboard orders={orders} />
      <NewOrdersBoard
        orders={orders}
        onView={openOrder}
        onConfirm={updateOrderStatus}
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
      <div className="mb-8 flex justify-center"></div>
      {showMore && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={() => setShowMore(false)}
        >
          <div
            className="relative h-[90vh] w-[98vw] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-8 py-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Order Management
                </h2>

                <p className="text-sm text-slate-500">
                  Search, Filter & Manage All Orders
                </p>
              </div>

              <button
                onClick={() => setShowMore(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold transition hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(90vh-80px)] overflow-y-auto p-8">
              {/* Search */}
              <OrdersSearch
                search={search}
                status={statusFilter}
                payment={paymentFilter}
                onSearch={setSearch}
                onStatus={setStatusFilter}
                onPayment={setPaymentFilter}
                onRefresh={fetchOrders}
              />
              <OrdersStats
                orders={orders}
                selectedStatus={statusFilter}
                onSelectStatus={setStatusFilter}
              />

              <div className="mt-6">
                <OrdersTable
                  orders={filtered}
                  onView={openOrder}
                  highlightOrderId={highlightOrderId}
                  selectedOrders={selectedOrders}
                  onSelect={toggleOrder}
                  allSelected={
                    filtered.length > 0 &&
                    selectedOrders.length === filtered.length
                  }
                  onSelectAll={toggleSelectAll}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <OrderViewDrawer
        open={showOrder}
        order={selectedOrder}
        items={orderItems}
        onClose={() => setShowOrder(false)}
        onStatusChange={updateOrderStatus}
        onPaymentStatusChange={updatePaymentStatus}
      />
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[999] -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-5 rounded-2xl border border-orange-200 bg-white px-6 py-4 shadow-2xl">
            <div>
              <p className="text-sm text-slate-500">Selected Orders</p>

              <p className="text-lg font-bold text-slate-900">
                {selectedOrders.length} Selected
              </p>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => bulkUpdateStatus("Confirmed")}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Confirm
              </button>

              <button
                onClick={() => bulkUpdateStatus("Ready to Dispatch")}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Dispatch
              </button>

              <button
                onClick={() => bulkUpdateStatus("Delivered")}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Delivered
              </button>

              <button
                onClick={() => bulkUpdateStatus("Cancelled")}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Cancel
              </button>

              <button
                onClick={() => setSelectedOrders([])}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
