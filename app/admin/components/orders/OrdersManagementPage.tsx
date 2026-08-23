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
  const isDesktop = !isMobile && !isTablet;

  return (
    <div
      className={
        isMobile
          ? "fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50"
          : isTablet
            ? "fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50"
            : "fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={
          isMobile
            ? "flex min-h-[64px] shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm"
            : isTablet
              ? "flex min-h-[72px] shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 py-3 shadow-sm"
              : "flex min-h-[80px] shrink-0 items-center gap-5 border-b border-slate-200 bg-white px-8 py-4 shadow-sm"
        }
      >
        {/* BACK */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className={
            isMobile
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition active:bg-slate-100 active:text-orange-600"
              : isTablet
                ? "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-orange-600"
                : "flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-orange-600"
          }
        >
          <ChevronLeft
            className={
              isMobile
                ? "h-5 w-5"
                : "h-6 w-6"
            }
          />

          {!isMobile && <span>Back</span>}
        </button>

        {/* TITLE */}

        <div className="min-w-0 flex-1">
          <h1
            className={
              isMobile
                ? "truncate text-base font-bold tracking-tight text-slate-900"
                : isTablet
                  ? "truncate text-xl font-bold tracking-tight text-slate-900"
                  : "truncate text-2xl font-bold tracking-tight text-slate-900"
            }
          >
            Order Management
          </h1>

          {isMobile ? (
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {filtered.length} of {orders.length} orders
            </p>
          ) : (
            <p
              className={
                isTablet
                  ? "mt-0.5 text-xs text-slate-500"
                  : "mt-1 text-sm text-slate-500"
              }
            >
              Search, filter and manage all orders
            </p>
          )}
        </div>

        {/* DESKTOP ORDER COUNT */}

        {isDesktop && (
          <div className="shrink-0 rounded-xl bg-slate-50 px-4 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total Orders
            </p>

            <p className="text-lg font-bold leading-none text-slate-900">
              {orders.length}
            </p>
          </div>
        )}

        {/* TABLET ORDER COUNT */}

        {isTablet && (
          <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Orders
            </p>

            <p className="text-sm font-bold leading-none text-slate-900">
              {orders.length}
            </p>
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className={
          isMobile
            ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-24"
            : isTablet
              ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pt-5 pb-8"
              : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pt-7 pb-10"
        }
      >
        {/* ===================================================
            CONTENT WIDTH
        =================================================== */}

        <div
          className={
            isMobile
              ? "w-full min-w-0"
              : isTablet
                ? "mx-auto w-full max-w-[1400px] min-w-0"
                : "mx-auto w-full max-w-[1800px] min-w-0"
          }
        >
          {/* =================================================
              SEARCH / FILTER
          ================================================= */}

          <section
            className={
              isMobile
                ? "w-full min-w-0"
                : isTablet
                  ? "w-full min-w-0"
                  : "w-full min-w-0"
            }
          >
            <OrdersSearch
              search={search}
              status={statusFilter}
              payment={paymentFilter}
              onSearch={onSearch}
              onStatus={onStatus}
              onPayment={onPayment}
              onRefresh={onRefresh}
            />
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section
            className={
              isMobile
                ? "mt-3 w-full min-w-0"
                : isTablet
                  ? "mt-5 w-full min-w-0"
                  : "mt-6 w-full min-w-0"
            }
          >
            <OrdersStats
              orders={orders}
              selectedStatus={statusFilter}
              onSelectStatus={onStatus}
            />
          </section>

          {/* =================================================
              ORDERS TABLE
          ================================================= */}

          <section
            className={
              isMobile
                ? "mt-3 w-full min-w-0"
                : isTablet
                  ? "mt-5 w-full min-w-0"
                  : "mt-6 w-full min-w-0"
            }
          >
            <div
              className={
                isMobile
                  ? "w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
                  : isTablet
                    ? "w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
                    : "w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
              }
            >
              <div
                className={
                  isMobile
                    ? "min-w-[760px]"
                    : isTablet
                      ? "min-w-[900px]"
                      : "min-w-[1000px]"
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
            </div>
          </section>

          {/* =================================================
              MOBILE RESULT INFO
          ================================================= */}

          {isMobile && (
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[10px] text-slate-400">
                Showing {filtered.length} orders
              </p>

              {selectedOrders.length > 0 && (
                <p className="text-[10px] font-semibold text-orange-600">
                  {selectedOrders.length} selected
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}