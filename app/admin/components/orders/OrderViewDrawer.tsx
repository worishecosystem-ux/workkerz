"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useReactToPrint } from "react-to-print";

import OrderItemsList from "./OrderItemsList";
import OrderHistory from "./OrderHistory";
import OrderHeader from "./OrderHeader";
import InvoicePreview from "./InvoicePreview";

type Props = {
  open: boolean;
  order: any;
  items: any[];
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onPaymentStatusChange: (id: string, status: string) => void;
};

export default function OrderViewDrawer({
  open,
  order,
  items,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
}: Props) {
  const [history, setHistory] = useState<any[]>([]);

  const invoiceRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     FETCH ORDER HISTORY
  ===================================================== */

  useEffect(() => {
    if (!open || !order?.id) {
      setHistory([]);
      return;
    }

    let active = true;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("[OrderHistory]", error);

        if (active) {
          setHistory([]);
        }

        return;
      }

      if (active) {
        setHistory(data ?? []);
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [open, order?.id]);

  /* =====================================================
     LOCK BODY SCROLL
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* =====================================================
     DESKTOP PRINT
  ===================================================== */

  const desktopPrint = useReactToPrint({
    contentRef: invoiceRef,

    documentTitle: order?.order_number
      ? `Invoice-${order.order_number}`
      : "Workkerz-Invoice",

    pageStyle: `
      @page {
        size: A4;
        margin: 12mm;
      }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,

    onPrintError: (location, error) => {
      console.error("[ReactToPrint]", location, error);
    },
  });

  /* =====================================================
     MOBILE PRINT
  ===================================================== */

  const mobilePrint = () => {
    const invoice = invoiceRef.current;

    if (!invoice) {
      console.error("[Invoice] Print content not found");
      return;
    }

    const html = invoice.innerHTML;

    const printWindow = window.open("", "_blank", "width=794,height=1123");

    if (!printWindow) {
      alert("Print window was blocked. Please allow pop-ups for this website.");
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            ${order?.order_number || "Workkerz Invoice"}
          </title>

          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              background: #ffffff;
              color: #0f172a;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              min-height: 100vh;
            }

            .print-container {
              width: 100%;
              max-width: 794px;
              margin: 0 auto;
              background: #ffffff;
            }

            img {
              max-width: 100%;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            @media print {
              html,
              body {
                width: 100%;
                margin: 0;
                padding: 0;
              }

              .print-container {
                width: 100%;
                max-width: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="print-container">
            ${html}
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 400);
            };

            window.onafterprint = function () {
              setTimeout(function () {
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  /* =====================================================
     PRINT HANDLER
  ===================================================== */

  const handlePrint = () => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent,
    );

    if (isMobile) {
      mobilePrint();
    } else {
      desktopPrint();
    }
  };

  /* =====================================================
     CLOSED
  ===================================================== */

  if (!open || !order) {
    return null;
  }

  return (
    <>
      {/* =================================================
          DRAWER BACKDROP
      ================================================= */}

      <div
        className="
          fixed
          inset-0
          z-[9998]
          flex
          items-end
          justify-center
          bg-black/40
          backdrop-blur-[2px]
          sm:items-center
          sm:p-3
          lg:p-5
        "
        onClick={onClose}
      >
        {/* =================================================
            DRAWER
        ================================================= */}

        <div
          onClick={(e) => e.stopPropagation()}
          className="
            flex
            h-[88dvh]
            w-full
            flex-col
            overflow-hidden
            rounded-t-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_70px_rgba(0,0,0,0.20)]
            sm:h-[94dvh]
            sm:max-w-6xl
            sm:rounded-2xl
            lg:h-[92dvh]
          "
        >
          {/* =================================================
              SINGLE HEADER
          ================================================= */}

          <div className="shrink-0">
            <OrderHeader
              order={order}
              onClose={onClose}
              onPrint={handlePrint}
              onStatusChange={onStatusChange}
              onPaymentStatusChange={onPaymentStatusChange}
            />
          </div>

          {/* =================================================
              SCROLLABLE CONTENT
          ================================================= */}

          <main
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              bg-slate-50
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-6xl
                space-y-2.5
                p-2.5
                sm:space-y-3
                sm:p-4
                lg:p-5
              "
            >
              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <section
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >
                {/* PRODUCTS HEADER */}

                <div
                  className="
                    flex
                    min-h-11
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-3
                    sm:px-4
                  "
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-emerald-50
                      "
                    >
                      <span className="text-sm">📦</span>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xs font-bold text-slate-900 sm:text-sm">
                        Products
                      </h2>

                      <p className="text-[9px] text-slate-400 sm:text-[10px]">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-slate-100
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      text-slate-600
                    "
                  >
                    {items.length}
                  </span>
                </div>

                {/* PRODUCTS */}

                <div className="min-w-0 overflow-x-auto">
                  <OrderItemsList items={items} />
                </div>
              </section>

              {/* =================================================
                  ACTIVITY
              ================================================= */}

              <section
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >
                {/* ACTIVITY HEADER */}

                <div
                  className="
                    flex
                    min-h-11
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-3
                    sm:px-4
                  "
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-50
                      "
                    >
                      <span className="text-sm">🕒</span>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xs font-bold text-slate-900 sm:text-sm">
                        Activity
                      </h2>

                      <p className="text-[9px] text-slate-400 sm:text-[10px]">
                        Order status updates
                      </p>
                    </div>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-slate-100
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      text-slate-600
                    "
                  >
                    {history.length}
                  </span>
                </div>

                {/* HISTORY */}

                {history.length > 0 ? (
                  <OrderHistory history={history} />
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div
                      className="
                        mx-auto
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                      "
                    >
                      <span className="text-sm">🕒</span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No activity yet
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Order updates will appear here.
                    </p>
                  </div>
                )}
              </section>

              {/* MOBILE BOTTOM SPACE */}

              <div className="h-2 sm:hidden" />
            </div>
          </main>
        </div>
      </div>

      {/* =====================================================
          PRINT SOURCE

          IMPORTANT:
          Do NOT use "hidden".
          react-to-print needs an actual rendered element.
      ===================================================== */}
      <div ref={invoiceRef} aria-hidden="true" className="invoice-print-source">
        <InvoicePreview order={order} items={items} />
      </div>
    </>
  );
}
