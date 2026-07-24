"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Eye, XCircle, Briefcase, User } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;

  worker_id: string;

  booking_id: string;

  booking_status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rejected";

  worker_name: string;

  worker_photo: string;

  worker_specialty: string;

  worker_rating: number;

  service_type: string;

  description: string;

  booking_date: string;

  booking_time: string;

  customer_name: string;

  customer_phone: string;

  customer_email: string;

  notes: string;

  customer_addresses: {
    house_no: string | null;
    address: string | null;
    landmark: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
  } | null;

  total_cost: number;

  service_fee: number;

  materials_cost: number;

  grand_total: number;

  created_at: string;
};

export default function BookingsTab() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Booking | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "confirmed" | "completed" | "rejected"
  >("pending");

  const [search, setSearch] = useState("");

  // FETCH

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const { data, error } = await supabase
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
    created_at,

    customer_addresses (
      house_no,
      address,
      landmark,
      city,
      district,
      state,
      pincode
    )
  `,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.log("SUPABASE ERROR =>", error);

        toast.error(error.message);

        return;
      }

      const formatted: Booking[] = (data ?? []).map((item: any) => ({
  ...item,
  customer_addresses: item.customer_addresses?.[0] ?? null,
}));

setOrders(formatted);
    } catch (err) {
      console.log("FETCH ERROR =>", err);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // LOAD
  useEffect(() => {
    fetchOrders();

    // AUTO REFRESH EVERY 2 SEC
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 2000);

    // REALTIME
    const channel = supabase
      .channel("bookings-live-channel")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchOrders();
        },
      )

      .subscribe();

    return () => {
      clearInterval(refreshInterval);

      supabase.removeChannel(channel);
    };
  }, []);

  // LOAD

  // UPDATE STATUS
  const updateStatus = async (
    id: string,
    status: "confirmed" | "completed" | "rejected",
  ) => {
    try {
      setActionLoading(`${id}-${status}`);

      const order = orders.find((i) => i.id === id);

      if (!order) return;

      const { error } = await supabase
        .from("bookings")
        .update({
          booking_status: status,
        })
        .eq("id", id);

      if (error) {
        toast.error("Failed to update status");
        return;
      }

      await fetchOrders();

      toast.success(
        status === "confirmed"
          ? "Booking Confirmed"
          : status === "rejected"
            ? "Booking Rejected"
            : "Work Completed",
      );
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading(null);
    }
  };

  // FILTER
  const filteredOrders = orders.filter((item) => {
    const statusMatch = item.booking_status === activeTab;

    const searchMatch =
      !search ||
      item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      item.worker_name.toLowerCase().includes(search.toLowerCase()) ||
      item.booking_id.toLowerCase().includes(search.toLowerCase()) ||
      item.customer_phone.includes(search);

    const dateMatch = !filterDate || item.booking_date === filterDate;

    const serviceMatch = !serviceFilter || item.service_type === serviceFilter;

    // QUICK FILTERS
    let quickMatch = true;

    if (quickFilter === "today") {
      const today = new Date().toISOString().split("T")[0];

      quickMatch = item.created_at.startsWith(today);
    }

    if (quickFilter === "upcoming") {
      quickMatch = new Date(item.booking_date) >= new Date();
    }

    if (quickFilter === "high") {
      quickMatch = item.grand_total >= 1000;
    }

    return (
      statusMatch && searchMatch && dateMatch && serviceMatch && quickMatch
    );
  });

  // COMPLETED WORKERS
  const completedWorkers = [
    ...new Set(
      orders
        .filter((o) => o.booking_status === "completed")
        .map((o) => o.worker_name),
    ),
  ];

  {
    refreshing && (
      <div className="fixed top-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl">
        Refreshing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A]">
            Orders Dashboard
          </h1>

          <p className="text-sm text-[#64748B] mt-1">Manage booking requests</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 px-5 py-4 shadow-sm">
          <div className="text-xs text-[#94A3B8]">Total Orders</div>

          <div className="text-3xl font-black text-[#FF5C39]">
            {orders.length}
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-white rounded-[28px] border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {/* SEARCH */}
          <div className="xl:col-span-2">
            <input
              type="text"
              placeholder="Search customer, worker, booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 outline-none focus:border-[#FF5C39]"
            />
          </div>

          {/* DATE FILTER */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full h-12 rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 outline-none focus:border-[#FF5C39]"
            />
          </div>

          {/* SERVICE FILTER */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full h-12 rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 outline-none focus:border-[#FF5C39]"
            >
              <option value="">All Services</option>

              {[...new Set(orders.map((o) => o.service_type))].map(
                (service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* CLEAR */}
          <button
            onClick={() => {
              setSearch("");
              setFilterDate("");
              setServiceFilter("");
            }}
            className="h-12 rounded-2xl bg-[#0F172A] hover:bg-black text-white text-sm font-black transition-all"
          >
            Clear Filters
          </button>
        </div>

        {/* QUICK FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1">
          <button
            onClick={() => setQuickFilter("today")}
            className={`px-4 h-9 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              quickFilter === "today"
                ? "bg-[#FF5C39] text-white"
                : "bg-[#F8FAFC] border border-gray-200 text-[#0F172A]"
            }`}
          >
            Today Orders
          </button>

          <button
            onClick={() => setQuickFilter("upcoming")}
            className={`px-4 h-9 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              quickFilter === "upcoming"
                ? "bg-blue-500 text-white"
                : "bg-[#F8FAFC] border border-gray-200 text-[#0F172A]"
            }`}
          >
            Upcoming Work
          </button>

          <button
            onClick={() => setQuickFilter("high")}
            className={`px-4 h-9 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
              quickFilter === "high"
                ? "bg-emerald-500 text-white"
                : "bg-[#F8FAFC] border border-gray-200 text-[#0F172A]"
            }`}
          >
            High Amount
          </button>

          <button
            onClick={() => setQuickFilter("")}
            className="px-4 h-9 rounded-2xl bg-gray-100 text-[#0F172A] text-xs font-black whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === "pending"}
          label={`Pending (${
            orders.filter((i) => i.booking_status === "pending").length
          })`}
          color="yellow"
          onClick={() => setActiveTab("pending")}
        />

        <TabButton
          active={activeTab === "confirmed"}
          label={`Confirmed (${
            orders.filter((i) => i.booking_status === "confirmed").length
          })`}
          color="emerald"
          onClick={() => setActiveTab("confirmed")}
        />

        <TabButton
          active={activeTab === "completed"}
          label={`Completed (${
            orders.filter((i) => i.booking_status === "completed").length
          })`}
          color="blue"
          onClick={() => setActiveTab("completed")}
        />

        <TabButton
          active={activeTab === "rejected"}
          label={`Rejected (${
            orders.filter((i) => i.booking_status === "rejected").length
          })`}
          color="rose"
          onClick={() => setActiveTab("rejected")}
        />
      </div>

      {/* LOADING */}
      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      {/* EMPTY */}
      {!loading && filteredOrders.length === 0 && activeTab !== "completed" && (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
          <div className="text-xl font-black text-[#0F172A]">
            No Orders Found
          </div>
        </div>
      )}

      {/* COMPLETED DASHBOARD */}
      {activeTab === "completed" && (
        <div>
          {/* TOP */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">
                Completed Work Dashboard
              </h2>

              <p className="text-sm text-[#64748B] mt-1">
                Worker wise completed history
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 px-5 py-4 shadow-sm">
              <div className="text-xs text-[#94A3B8]">Workers</div>

              <div className="text-3xl font-black text-blue-600">
                {completedWorkers.length}
              </div>
            </div>
          </div>

          {/* FOLDERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedWorkers.map((worker) => {
              const workerOrders = orders.filter(
                (o) =>
                  o.booking_status === "completed" && o.worker_name === worker,
              );

              return (
                <button
                  key={worker}
                  onClick={() =>
                    setSelectedWorker(selectedWorker === worker ? null : worker)
                  }
                  className={`rounded-[28px] border p-5 text-left transition-all ${
                    selectedWorker === worker
                      ? "bg-blue-50 border-blue-200 shadow-lg"
                      : "bg-white border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-7 h-7 text-blue-600" />
                      </div>

                      <div>
                        <div className="text-lg font-black text-[#0F172A]">
                          {worker}
                        </div>

                        <div className="text-sm text-[#64748B] mt-1">
                          Work History
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-600 text-white text-sm font-black px-3 py-2 rounded-2xl">
                      {workerOrders.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* HISTORY */}
          {selectedWorker && (
            <div className="mt-6 bg-white rounded-4xl border border-gray-100 p-5 shadow-sm">
              <div className="text-2xl font-black text-[#0F172A]">
                {selectedWorker}
              </div>

              <div className="space-y-3 mt-5">
                {orders
                  .filter(
                    (o) =>
                      o.booking_status === "completed" &&
                      o.worker_name === selectedWorker,
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#F8FAFC] border border-gray-100 rounded-3xl p-4"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm font-black text-[#0F172A]">
                            {order.service_type}
                          </div>

                          <div className="text-xs text-[#64748B] mt-1">
                            Customer: {order.customer_name}
                          </div>

                          <div className="text-xs text-[#64748B] mt-1">
                            #{order.booking_id}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="h-10 px-4 rounded-2xl bg-[#0F172A] text-white text-xs font-black"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NORMAL CARDS */}
      {activeTab !== "completed" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-[28px] p-4 shadow-sm hover:shadow-lg transition-all"
            >
              {/* TOP */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-black text-[#0F172A]">
                    {order.service_type}
                  </div>

                  <div className="text-[11px] text-[#64748B] mt-1">
                    #{order.booking_id}
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black capitalize ${
                    order.booking_status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.booking_status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {order.booking_status}
                </div>
              </div>

              {/* CUSTOMER */}
              <div className="mt-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF4EF] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#FF5C39]" />
                </div>

                <div>
                  <div className="text-sm font-black text-[#0F172A]">
                    {order.customer_name}
                  </div>

                  <div className="text-xs text-[#64748B] mt-1">
                    {order.customer_phone}
                  </div>
                </div>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-[#FFF8F5] rounded-2xl p-3 border border-[#FFE8DD]">
                  <div className="text-[9px] text-[#94A3B8] font-bold uppercase">
                    Request
                  </div>

                  <div className="text-xs font-black text-[#0F172A] mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>

                <div className="bg-[#F4FAFF] rounded-2xl p-3 border border-[#DFF1FF]">
                  <div className="text-[9px] text-[#94A3B8] font-bold uppercase">
                    Work Schedule
                  </div>

                  <div className="text-xs font-black text-[#0F172A] mt-1">
                    {new Date(order.booking_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 space-y-2">
                {/* VIEW FULL DETAILS */}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full h-11 rounded-2xl border border-gray-200 bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-black flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  View Full Details
                </button>

                {/* PENDING BUTTONS */}
                {order.booking_status === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* CONFIRM */}
                    <button
                      disabled={actionLoading === `${order.id}-confirmed`}
                      onClick={() => updateStatus(order.id, "confirmed")}
                      className={`h-10 rounded-2xl text-white text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.97] ${
                        actionLoading === `${order.id}-confirmed`
                          ? "bg-emerald-400 cursor-not-allowed"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {actionLoading === `${order.id}-confirmed` ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </>
                      )}
                    </button>

                    {/* REJECT */}
                    <button
                      disabled={actionLoading === `${order.id}-rejected`}
                      onClick={() => updateStatus(order.id, "rejected")}
                      className={`h-10 rounded-2xl text-white text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.97] ${
                        actionLoading === `${order.id}-rejected`
                          ? "bg-rose-400 cursor-not-allowed"
                          : "bg-rose-500 hover:bg-rose-600"
                      }`}
                    >
                      {actionLoading === `${order.id}-rejected` ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* CONFIRMED BUTTON */}
                {order.booking_status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="w-full h-10 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black transition-all flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}

                {/* REJECTED LABEL */}
                {order.booking_status === "rejected" && (
                  <div className="w-full h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Booking Rejected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-5">
          <div className="w-full max-w-6xl bg-[#F8FAFC] rounded-4xl overflow-hidden max-h-[95vh] overflow-y-auto shadow-2xl border border-white/50 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* HEADER */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl font-black text-[#0F172A]">
                  Booking Details
                </div>

                <div className="text-sm text-[#64748B] mt-1">
                  #{selectedOrder.booking_id}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-11 h-11 rounded-2xl border border-gray-200 bg-white hover:bg-[#F8FAFC] text-xl"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* LEFT SIDE */}
                <div className="xl:col-span-2 space-y-5">
                  {/* CUSTOMER */}
                  <div className="bg-white rounded-[30px] border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF4EF] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#FF5C39]" />
                      </div>

                      <div>
                        <div className="text-xl font-black text-[#0F172A]">
                          Customer Details
                        </div>

                        <div className="text-sm text-[#64748B]">
                          Booking customer information
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Customer Name"
                        value={selectedOrder.customer_name}
                      />

                      <InfoRow
                        label="Phone Number"
                        value={selectedOrder.customer_phone}
                      />

                      <InfoRow
                        label="Email Address"
                        value={selectedOrder.customer_email}
                      />

                      <InfoRow
                        label="Notes"
                        value={selectedOrder.notes || "No Notes"}
                      />
                    </div>
                  </div>

                  {/* BOOKING */}
                  <div className="bg-white rounded-[30px] border border-gray-100 p-5 shadow-sm">
                    <div className="text-xl font-black text-[#0F172A] mb-5">
                      Booking Information
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        label="Booking ID"
                        value={`#${selectedOrder.booking_id}`}
                      />

                      <InfoRow
                        label="Service Type"
                        value={selectedOrder.service_type}
                      />

                      <InfoRow
                        label="Request Date"
                        value={new Date(
                          selectedOrder.created_at,
                        ).toLocaleString("en-IN")}
                      />

                      <InfoRow
                        label="Work Date"
                        value={new Date(
                          `${selectedOrder.booking_date} ${selectedOrder.booking_time}`,
                        ).toLocaleString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      />

                      <InfoRow
                        label="Booking Status"
                        value={selectedOrder.booking_status}
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="bg-white rounded-[30px] border border-gray-100 p-5 shadow-sm">
                    <div className="text-xl font-black text-[#0F172A] mb-4">
                      Full Address
                    </div>

                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 text-sm text-[#475569] leading-7">
                      {selectedOrder.customer_addresses?.house_no},{" "}
                      {selectedOrder.customer_addresses?.address},{" "}
                      {selectedOrder.customer_addresses?.landmark},{" "}
                      {selectedOrder.customer_addresses?.city},{" "}
                      {selectedOrder.customer_addresses?.district},{" "}
                      {selectedOrder.customer_addresses?.state}-
                      {selectedOrder.customer_addresses?.pincode}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-5">
                  {/* WORKER CARD */}
                  <div className="bg-white rounded-[30px] border border-gray-100 p-5 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={
                          selectedOrder.worker_photo ||
                          "https://placehold.co/200x200/png"
                        }
                        alt=""
                        className="w-24 h-24 rounded-[28px] object-cover border-4 border-[#FFF4EF]"
                      />

                      <div className="mt-4">
                        <div className="text-2xl font-black text-[#0F172A]">
                          {selectedOrder.worker_name}
                        </div>

                        <div className="text-sm text-[#64748B] mt-1">
                          {selectedOrder.worker_specialty}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <InfoRow
                        label="Worker Rating"
                        value={`${selectedOrder.worker_rating} ⭐`}
                      />

                      <InfoRow
                        label="Service"
                        value={selectedOrder.service_type}
                      />
                    </div>
                  </div>

                  {/* PAYMENT */}
                  <div className="bg-linear-to-br from-[#0F172A] to-[#111827] rounded-[30px] p-6 text-white shadow-xl">
                    <div className="text-2xl font-black mb-6">
                      Payment Summary
                    </div>

                    <div className="space-y-4">
                      <PriceLine
                        label="Worker Charges"
                        value={`₹${selectedOrder.total_cost}`}
                      />

                      <PriceLine
                        label="Platform Fee"
                        value={`₹${selectedOrder.service_fee}`}
                      />

                      <PriceLine
                        label="Materials Cost"
                        value={`₹${selectedOrder.materials_cost}`}
                      />
                    </div>

                    <div className="h-px bg-white/10 my-6" />

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-sm text-white/60">Grand Total</div>

                        <div className="text-4xl font-black mt-1">
                          ₹{selectedOrder.grand_total}
                        </div>
                      </div>

                      <div className="bg-white/10 px-4 py-2 rounded-2xl text-sm font-bold">
                        Paid
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-white/70">{label}</div>

      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

// TAB BUTTON
function TabButton({
  active,
  label,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color: string;
}) {
  const activeColors: Record<string, string> = {
    yellow: "bg-yellow-500 text-white shadow-lg shadow-yellow-200",
    emerald: "bg-emerald-500 text-white shadow-lg shadow-emerald-200",
    blue: "bg-blue-500 text-white shadow-lg shadow-blue-200",
    rose: "bg-rose-500 text-white shadow-lg shadow-rose-200",
  };

  return (
    <button
      onClick={onClick}
      className={`px-5 h-11 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
        active
          ? activeColors[color]
          : "bg-white border border-gray-200 text-[#0F172A]"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl px-4 py-3 hover:border-[#FFD9CC] transition-all">
      <div className="text-[11px] uppercase tracking-wider font-black text-[#94A3B8]">
        {label}
      </div>

      <div className="text-sm font-black text-[#0F172A] mt-2 wrap-break-word leading-6">
        {value || "—"}
      </div>
    </div>
  );
}

// DETAIL CARD
function DetailCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="bg-[#F8FAFC] rounded-3xl p-5">
      <div className="text-lg font-black text-[#0F172A] mb-5">{title}</div>

      <div className="space-y-4">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex justify-between gap-5 border-b border-dashed border-gray-200 pb-3"
          >
            <span className="text-sm text-[#64748B]">{row[0]}</span>

            <span className="text-sm font-bold text-right text-[#0F172A] max-w-[60%] wrap-break-word">
              {row[1] || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
