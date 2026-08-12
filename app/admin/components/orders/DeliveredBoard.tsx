"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  IndianRupee,
  PackageCheck,
  Printer,
} from "lucide-react";

import InvoicePreview from "./InvoicePreview";

type Props = {
  orders: any[];
  onView: (order: any) => void;
};

export default function DeliveredBoard({
  orders,
  onView,
}: Props) {
  const [printOrder, setPrintOrder] = useState<any | null>(
    null,
  );

  const today = new Date();

  const todayDelivered = orders.filter((order) => {
    if (
      String(order?.status || "").toLowerCase() !==
        "delivered" ||
      !order?.created_at
    ) {
      return false;
    }

    const date = new Date(order.created_at);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });

  const revenue = todayDelivered.reduce(
    (sum, order) =>
      sum + Number(order?.total ?? 0),
    0,
  );

  /*
   * PRINT AFTER INVOICE IS RENDERED
   */
  useEffect(() => {
    if (!printOrder) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [printOrder]);

  /*
   * CLOSE PRINT PREVIEW AFTER PRINT
   */
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintOrder(null);
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint,
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint,
      );
    };
  }, []);

  const handlePrint = (order: any) => {
    setPrintOrder(order);
  };

  const getItems = (order: any): any[] => {
    if (Array.isArray(order?.items)) {
      return order.items;
    }

    if (Array.isArray(order?.order_items)) {
      return order.order_items;
    }

    if (Array.isArray(order?.products)) {
      return order.products;
    }

    return [];
  };

  return (
    <>
      {/* =====================================================
          PRINT CSS
      ===================================================== */}

      <style>{`
        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body > * {
            background: #ffffff !important;
          }

          .delivered-board-no-print {
            display: none !important;
          }

          .invoice-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 999999 !important;

            display: block !important;

            width: 100% !important;
            min-height: 100vh !important;

            background: #ffffff !important;
          }

          .invoice-print-container * {
            visibility: visible !important;
          }
        }

        @media screen {
          .invoice-print-container {
            position: fixed;
            left: -10000px;
            top: 0;
            z-index: -1;

            width: 900px;

            background: white;
          }
        }
      `}</style>

      {/* =====================================================
          DELIVERED BOARD
      ===================================================== */}

      <section
        className="
          delivered-board-no-print
          w-full
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-[17px] w-[17px] text-green-600" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />

                <h2 className="truncate text-[13px] font-bold text-slate-900 sm:text-sm">
                  Delivered Orders
                </h2>
              </div>

              <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
                {todayDelivered.length} order
                {todayDelivered.length !== 1
                  ? "s"
                  : ""}{" "}
                delivered today
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
                Today&apos;s Revenue
              </p>

              <div className="mt-0.5 flex items-center justify-end gap-0.5 text-sm font-bold text-green-600">
                <IndianRupee className="h-3.5 w-3.5" />

                {revenue.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600 sm:hidden">
              ₹{revenue.toLocaleString("en-IN")}
            </div>

            <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600 sm:block">
              {todayDelivered.length}
            </span>
          </div>
        </div>

        {/* BOARD */}

        <div className="bg-slate-50/50 p-2.5 sm:p-3">
          {todayDelivered.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
                <PackageCheck className="h-5 w-5 text-green-300" />
              </div>

              <p className="text-xs font-semibold text-slate-600">
                No Delivered Orders
              </p>

              <p className="mt-1 max-w-[240px] text-[10px] leading-4 text-slate-400">
                Orders completed today will appear here.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                w-full
                grid-cols-1
                gap-2.5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                2xl:grid-cols-5
              "
            >
              {todayDelivered.map((order) => {
                const deliveredDate =
                  order?.created_at
                    ? new Date(order.created_at)
                    : null;

                return (
                  <div
                    key={order.id}
                    className="
                      group
                      min-w-0
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-3
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-[1px]
                      hover:border-green-200
                      hover:shadow-md
                    "
                  >
                    {/* TOP */}

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[11px] font-bold text-slate-900">
                            #{order?.order_number || "-"}
                          </p>

                          <span className="shrink-0 rounded-full bg-green-50 px-1.5 py-0.5 text-[8px] font-bold text-green-700">
                            Delivered
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {order?.customer_name ||
                            order?.customerName ||
                            "Customer"}
                        </p>
                      </div>

                      {/* AMOUNT */}

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-slate-900">
                          ₹
                          {Number(
                            order?.total ?? 0,
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-0.5 text-[8px] text-slate-400">
                          Total
                        </p>
                      </div>
                    </div>

                    <div className="my-2.5 border-t border-slate-100" />

                    {/* INFO */}

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                          Delivered
                        </p>

                        {deliveredDate ? (
                          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-600">
                            {deliveredDate.toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}

                            {" • "}

                            {deliveredDate.toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[9px] text-slate-400">
                            -
                          </p>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 gap-1.5">
                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            onView(order)
                          }
                          title="View Order"
                          aria-label="View Order"
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            transition-colors
                            hover:bg-blue-600
                            hover:text-white
                            active:scale-95
                          "
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* PRINT */}

                        <button
                          type="button"
                          onClick={() =>
                            handlePrint(order)
                          }
                          title="Print Invoice"
                          aria-label="Print Invoice"
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            text-slate-500
                            transition-all
                            hover:bg-slate-700
                            hover:text-white
                            active:scale-95
                          "
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          INVOICE
      ===================================================== */}

      {printOrder && (
        <div
          id="invoice-print-container"
          className="invoice-print-container"
        >
          <InvoicePreview
            order={printOrder}
            items={getItems(printOrder)}
          />
        </div>
      )}
    </>
  );
}