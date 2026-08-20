"use client";
import { ChevronLeft } from "lucide-react";
import OrdersTable from "./OrdersTable";
import OrdersSearch from "./OrdersSearch";
import OrdersStats from "./OrdersStats";

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

type OrdersManagementPageProps = {
  isMobile: boolean;
  isTablet: boolean;
  orders: Order[];
  filtered: Order[];
  search: string;
  statusFilter: string;
  paymentFilter: string;
  highlightOrderId: string | null;
  selectedOrders: string[];
  allSelected: boolean;

  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onPayment: (value: string) => void;
  onRefresh: () => void;

  onView: (order: Order) => void;
  onSelect: (id: string) => void;
  onSelectAll: () => void;

  onClose: () => void;
};

export default function OrdersManagementPage({
  isMobile,
  isTablet,
  orders,
  filtered,
  search,
  statusFilter,
  paymentFilter,
  highlightOrderId,
  selectedOrders,
  allSelected,

  onSearch,
  onStatus,
  onPayment,
  onRefresh,

  onView,
  onSelect,
  onSelectAll,

  onClose,
}: OrdersManagementPageProps) {
  return (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-[9999] flex h-screen w-screen flex-col overflow-hidden bg-slate-50 pt-0"
          : isTablet
            ? "fixed inset-0 z-[9999] flex h-screen w-screen flex-col overflow-hidden bg-slate-50 pt-0"
            : "fixed inset-0 z-[9999] flex h-screen w-screen flex-col overflow-hidden bg-slate-50 pt-0"
      }
    >
      {/* =====================================================
          FULL SCREEN HEADER
      ===================================================== */}

      <header
        className={
          isMobile
            ? "flex min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 pt-15 shadow-sm"
            : isTablet
              ? "flex min-h-18 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 py-3 shadow-sm"
              : "flex min-h-19 shrink-0 items-center gap-5 border-b border-slate-200 bg-white px-8 py-4 shadow-sm"
        }
      >
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className={
            isMobile
              ? "flex h-10 w-10 shrink-0 items-center justify-center bg-transparent text-slate-700 active:text-orange-600"
              : "flex h-10 shrink-0 items-center justify-center gap-2 bg-transparent px-1 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
          }
        >
          <ChevronLeft className="h-6 w-6" />

          {!isMobile && <span>Back</span>}
        </button>

        {/* TEXT */}
        <div className="min-w-0">
          <h1
            className={
              isMobile
                ? "truncate text-lg font-bold tracking-tight text-slate-900"
                : isTablet
                  ? "truncate text-xl font-bold tracking-tight text-slate-900"
                  : "truncate text-2xl font-bold tracking-tight text-slate-900"
            }
          >
            Order Management
          </h1>

          {!isMobile && (
            <p
              className={
                isTablet
                  ? "mt-0.5 text-xs text-slate-500"
                  : "mt-0.5 text-sm text-slate-500"
              }
            >
              Search, filter and manage all orders
            </p>
          )}
        </div>
      </header>

      {/* =====================================================
          FULL SCREEN CONTENT
      ===================================================== */}

      <main
        className={
          isMobile
            ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pt-4 pb-24"
            : isTablet
              ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pt-5 pb-8"
              : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pt-7 pb-10"
        }
      >
        {/* ===================================================
            SEARCH / FILTER
        =================================================== */}

        <OrdersSearch
          search={search}
          status={statusFilter}
          payment={paymentFilter}
          onSearch={onSearch}
          onStatus={onStatus}
          onPayment={onPayment}
          onRefresh={onRefresh}
        />

        {/* ===================================================
            STATS
        =================================================== */}

        <div className={isMobile ? "mt-4" : isTablet ? "mt-5" : "mt-6"}>
          <OrdersStats
            orders={orders}
            selectedStatus={statusFilter}
            onSelectStatus={onStatus}
          />
        </div>

        {/* ===================================================
            ORDERS TABLE
        =================================================== */}

        <div
          className={
            isMobile
              ? "mt-4 overflow-x-auto"
              : isTablet
                ? "mt-5 overflow-x-auto"
                : "mt-6 overflow-x-auto"
          }
        >
          <OrdersTable
            orders={filtered}
            onView={onView}
            highlightOrderId={highlightOrderId}
            selectedOrders={selectedOrders}
            onSelect={onSelect}
            allSelected={allSelected}
            onSelectAll={onSelectAll}
          />
        </div>
      </main>
    </div>
  );
}
