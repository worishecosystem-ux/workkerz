"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ChevronRight,
  Truck,
  CircleCheck,
  XCircle,
  MapPin,
  CalendarDays,
  IndianRupee,
  ShoppingBag,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import OrderDetails from "./OrderDetails";

/* =========================================================
   TYPES
========================================================= */

interface OrderItem {
  id: string;
  order_id?: string;

  product_id?: string;
  product_name?: string;
  product_image?: string;

  price?: number;
  qty?: number;
  quantity?: number;
  unit?: string;
}

interface Order {
  id: string;

  /* Customer-facing order number */
  order_number?: string;

  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;

  /* Order */
  status?: string;

  /* Amounts */
  total_amount?: number;
  grand_total?: number;
  total?: number;
  subtotal?: number;
  delivery?: number;
  tax?: number;

  /* Product fallback */
  product_name?: string;
  product_image?: string;

  /* Delivery */
  address?: string;
  full_address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;

  delivery_option?: string;
  delivery_slot?: string;

  /* Payment */
  payment_method?: string;
  payment_status?: string;

  /* Rejection */
  rejection_reason?: string;

  /* Dates */
  created_at: string;
  updated_at?: string;

  /* Optional joined items */
  items?: OrderItem[];
}

type Props = {
  search?: string;
};

type StatusInfo = {
  label: string;
  className: string;
  dotClassName: string;
};

const DELIVERY_DAYS = 3;

/* =========================================================
   COMPONENT
========================================================= */

export default function Orders({ search = "" }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

  const [detailsLoading, setDetailsLoading] = useState(false);

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", {
          ascending: false,
        });

      console.log("ORDERS:", data);
      console.log("ORDERS ERROR:", error);

      if (error) {
        console.error("Orders fetch error:", error);

        setOrders([]);
        return;
      }

      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error("Unexpected orders error:", error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     ORDER NUMBER
  ======================================================= */

  function getOrderNumber(order: Order) {
    return order.order_number || "Order ID unavailable";
  }

  /* =======================================================
     STATUS
  ======================================================= */

  function getStatus(order: Order) {
    return (order.status || "pending").toLowerCase().trim();
  }

  /* =======================================================
     STATUS UI
  ======================================================= */

  function getStatusInfo(status: string): StatusInfo {
    switch (status) {
      case "accepted":
      case "confirmed":
        return {
          label: "Confirmed",
          className: "border-blue-200 bg-blue-50 text-blue-700",
          dotClassName: "bg-blue-500",
        };

      case "preparing":
      case "processing":
        return {
          label: "Preparing",
          className: "border-amber-200 bg-amber-50 text-amber-700",
          dotClassName: "bg-amber-500",
        };

      case "ready":
        return {
          label: "Ready to Ship",
          className: "border-violet-200 bg-violet-50 text-violet-700",
          dotClassName: "bg-violet-500",
        };

      case "shipped":
        return {
          label: "Shipped",
          className: "border-indigo-200 bg-indigo-50 text-indigo-700",
          dotClassName: "bg-indigo-500",
        };

      case "out_for_delivery":
        return {
          label: "Out for Delivery",
          className: "border-orange-200 bg-orange-50 text-orange-700",
          dotClassName: "bg-orange-500",
        };

      case "delivered":
      case "completed":
        return {
          label: "Delivered",
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dotClassName: "bg-emerald-500",
        };

      case "rejected":
        return {
          label: "Rejected",
          className: "border-red-200 bg-red-50 text-red-700",
          dotClassName: "bg-red-500",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          className: "border-red-200 bg-red-50 text-red-700",
          dotClassName: "bg-red-500",
        };

      default:
        return {
          label: "Order Placed",
          className: "border-slate-200 bg-slate-50 text-slate-700",
          dotClassName: "bg-slate-500",
        };
    }
  }

  /* =======================================================
     CANCELLED / REJECTED
  ======================================================= */

  function isCancelled(status: string) {
    return status === "cancelled" || status === "rejected";
  }

  /* =======================================================
     ORDER AMOUNT
  ======================================================= */

  function getOrderAmount(order: Order) {
    return order.grand_total ?? order.total_amount ?? order.total ?? 0;
  }

  /* =======================================================
     EXPECTED DELIVERY
  ======================================================= */

  function getExpectedDelivery(order: Order) {
    const status = getStatus(order);

    if (isCancelled(status)) {
      return null;
    }

    /*
     * Delivered date
     */
    if (status === "delivered" || status === "completed") {
      if (order.updated_at) {
        return new Date(order.updated_at);
      }

      return new Date(order.created_at);
    }

    /*
     * Expected date
     */
    const date = new Date(order.created_at);

    date.setDate(date.getDate() + DELIVERY_DAYS);

    return date;
  }

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  function formatDeliveryDate(date: Date | null) {
    if (!date) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  /* =======================================================
     DELIVERY MESSAGE
  ======================================================= */

  function getDeliveryMessage(order: Order) {
    const status = getStatus(order);

    /*
     * Delivered
     */
    if (status === "delivered" || status === "completed") {
      const date = getExpectedDelivery(order);

      return date ? `Delivered ${formatDeliveryDate(date)}` : "Order delivered";
    }

    /*
     * Out for delivery
     */
    if (status === "out_for_delivery") {
      return "Arriving today";
    }

    /*
     * Shipped
     */
    if (status === "shipped") {
      return "Arriving soon";
    }

    /*
     * Normal ETA
     */
    const date = getExpectedDelivery(order);

    if (date) {
      return `Arriving by ${formatDeliveryDate(date)}`;
    }

    return "Delivery date will be updated soon";
  }

  /* =======================================================
     ADDRESS
  ======================================================= */

  function getAddress(order: Order) {
    return order.full_address || order.address || "";
  }

  function getLocation(order: Order) {
    return [order.city, order.district, order.state, order.pincode]
      .filter(Boolean)
      .join(", ");
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return orders;
    }

    return orders.filter((order) => {
      const orderId = (order.order_number || "").toLowerCase();

      const status = (order.status || "").toLowerCase();

      const product = (order.product_name || "").toLowerCase();

      const city = (order.city || "").toLowerCase();

      const address = (order.full_address || order.address || "").toLowerCase();

      return (
        orderId.includes(q) ||
        status.includes(q) ||
        product.includes(q) ||
        city.includes(q) ||
        address.includes(q)
      );
    });
  }, [orders, search]);

  /* =======================================================
     OPEN ORDER DETAILS
  ======================================================= */

  async function openOrderDetails(order: Order) {
    setSelectedOrder(order);
    setSelectedItems([]);
    setDetailsLoading(true);

    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", {
          ascending: true,
        });

      console.log("ORDER ITEMS:", data);

      console.log("ORDER ITEMS ERROR:", error);

      if (error) {
        console.error("Order items fetch error:", error);

        setSelectedItems([]);
        return;
      }

      setSelectedItems((data || []) as OrderItem[]);
    } catch (error) {
      console.error("Unexpected order items error:", error);

      setSelectedItems([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  function closeOrderDetails() {
    setSelectedOrder(null);
    setSelectedItems([]);
    setDetailsLoading(false);
  }

  /* =======================================================
     LOADING UI
  ======================================================= */

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 p-3 sm:p-4">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="h-[3px] bg-slate-100" />

            <div className="animate-pulse px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-slate-200" />

                  <div className="h-2 w-20 rounded bg-slate-100" />
                </div>

                <div className="h-5 w-20 rounded-full bg-slate-200" />
              </div>

              <div className="mt-2.5 h-11 rounded-lg bg-slate-100" />

              <div className="mt-2.5 h-11 rounded-lg bg-slate-100" />

              <div className="mt-2.5 flex justify-end">
                <div className="h-7 w-24 rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (filteredOrders.length === 0) {
    return (
      <div className="flex min-h-[48vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
          <ShoppingBag className="h-6 w-6 text-emerald-600" />
        </div>

        <h2 className="mt-3 text-[14px] font-bold text-slate-900">
          No orders found
        </h2>

        <p className="mt-1 max-w-xs text-[10px] leading-5 text-slate-500">
          Your E-Aurix material orders will appear here after you place an
          order.
        </p>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3 sm:p-4">
        {filteredOrders.map((order) => {
          const status = getStatus(order);

          const statusInfo = getStatusInfo(status);

          const cancelled = isCancelled(status);

          const amount = getOrderAmount(order);

          const deliveryDate = getExpectedDelivery(order);

          const address = getAddress(order);

          const location = getLocation(order);

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
            >
              {/* =========================================
                    TOP ACCENT
                ========================================= */}

              <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400" />

              <div className="px-3 py-3">
                {/* =========================================
                      HEADER
                  ========================================= */}

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

                      <p className="truncate text-[11px] font-bold text-slate-900">
                        #{getOrderNumber(order)}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[8px] text-slate-400">
                      <CalendarDays className="h-2.5 w-2.5" />

                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* STATUS */}

                  <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 ${statusInfo.className}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClassName}`}
                    />

                    <span className="text-[8px] font-bold">
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* =========================================
                      DELIVERY STATUS
                  ========================================= */}

                {!cancelled && (
                  <div
                    className={`mt-2.5 flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                      status === "out_for_delivery"
                        ? "border-orange-100 bg-orange-50"
                        : status === "delivered" || status === "completed"
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm ${
                        status === "out_for_delivery"
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {status === "delivered" || status === "completed" ? (
                        <CircleCheck className="h-4 w-4" />
                      ) : status === "out_for_delivery" ? (
                        <Truck className="h-4 w-4" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[7px] font-semibold uppercase tracking-wider ${
                          status === "out_for_delivery"
                            ? "text-orange-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {status === "delivered" || status === "completed"
                          ? "Delivery completed"
                          : "Expected delivery"}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] font-bold text-slate-900">
                        {getDeliveryMessage(order)}
                      </p>
                    </div>

                    {deliveryDate &&
                      status !== "delivered" &&
                      status !== "completed" && (
                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-[7px] text-slate-400">ETA</p>

                          <p className="text-[9px] font-bold text-slate-700">
                            {formatDeliveryDate(deliveryDate)}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* =========================================
                      ADDRESS + TOTAL
                  ========================================= */}

                <div className="mt-2.5 flex items-center gap-2">
                  {/* LOCATION ICON */}

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>

                  {/* ADDRESS */}

                  <div className="min-w-0 flex-1">
                    <p className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
                      Delivery Address
                    </p>

                    <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-700">
                      {address || "Address unavailable"}
                    </p>

                    {location && (
                      <p className="mt-0.5 truncate text-[8px] text-slate-400">
                        {location}
                      </p>
                    )}
                  </div>

                  {/* TOTAL */}

                  <div className="shrink-0 border-l border-slate-100 pl-2.5 text-right">
                    <p className="text-[7px] font-medium uppercase tracking-wider text-slate-400">
                      Total
                    </p>

                    <div className="mt-0.5 flex items-center justify-end">
                      <IndianRupee className="h-2.5 w-2.5 text-emerald-700" />

                      <span className="text-[12px] font-extrabold text-emerald-700">
                        {Number(amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================
                      CANCELLED / REJECTED
                  ========================================= */}

                {cancelled && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-2.5 py-2">
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-red-700">
                        {status === "rejected"
                          ? "Order Rejected"
                          : "Order Cancelled"}
                      </p>

                      <p className="mt-0.5 truncate text-[7px] text-red-500">
                        This order is no longer active.
                      </p>
                    </div>
                  </div>
                )}

                {/* =========================================
                      FOOTER
                  ========================================= */}

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50">
                      <ShoppingBag className="h-3 w-3 text-slate-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[7px] uppercase tracking-wider text-slate-400">
                        E-Aurix Order
                      </p>

                      <p className="max-w-[150px] truncate text-[8px] font-semibold text-slate-600">
                        Material Delivery
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openOrderDetails(order)}
                    className="flex h-7 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-[8px] font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.97]"
                  >
                    View Details
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          ORDER DETAILS
      ===================================================== */}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          items={selectedItems}
          onClose={closeOrderDetails}
        />
      )}
    </>
  );
}
