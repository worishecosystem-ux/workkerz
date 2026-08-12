"use client";

import { forwardRef } from "react";
import { Printer, X } from "lucide-react";

type Props = {
  order: any;
  items?: any[];
  onClose?: () => void;
  onPrint?: () => void;
};

const InvoicePreview = forwardRef<HTMLDivElement, Props>(
  ({ order, items = [], onClose, onPrint }, ref) => {
    const formatMoney = (value: any) => {
      const number = Number(value ?? 0);

      if (!Number.isFinite(number)) {
        return "Rs. 0";
      }

      return `Rs. ${number.toLocaleString("en-IN")}`;
    };

    const createdAt = order?.created_at
      ? new Date(order.created_at)
      : new Date();

    const invoiceDate = createdAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const invoiceTime = createdAt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const invoiceNumber = order?.order_number || order?.id || "-";

    const paymentStatus = String(
      order?.payment_status || "Pending",
    );

    const isPaid = paymentStatus.toLowerCase() === "paid";

    const handlePrint = () => {
      if (onPrint) {
        onPrint();
        return;
      }

      window.print();
    };

    return (
      <div className="invoice-container w-full bg-slate-100">
        {/* MOBILE ACTIONS */}

        {(onClose || onPrint) && (
          <div className="invoice-actions fixed bottom-0 left-0 right-0 z-[9999] flex gap-2 border-t border-slate-200 bg-white p-3 shadow-lg sm:hidden">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-700"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
          </div>
        )}

        {/* PRINTABLE INVOICE */}

        <div
          ref={ref}
          className="invoice-print-area mx-auto w-full max-w-[900px] bg-white p-4 text-slate-900 sm:p-10"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {/* HEADER */}

          <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
            <div className="min-w-0">
              <h1 className="m-0 text-2xl font-black tracking-tight sm:text-3xl">
                WORISH ECOSYSTEM
              </h1>

              <p className="mt-1 text-xs font-extrabold tracking-widest text-slate-600">
                PRIVATE LIMITED
              </p>

              <p className="mt-1 text-[10px] font-semibold text-slate-500">
                Digital Workforce & Marketplace
              </p>

              <p className="mt-4 text-xs font-extrabold text-slate-700">
                TAX INVOICE / BILL
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Number
              </p>

              <p className="mt-1 text-lg font-extrabold">
                #{invoiceNumber}
              </p>

              <p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Date
              </p>

              <p className="mt-1 text-[11px] font-semibold">
                {invoiceDate}
              </p>

              <p className="text-[9px] text-slate-500">
                {invoiceTime}
              </p>
            </div>
          </div>

          {/* COMPANY */}

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 rounded-lg bg-slate-50 px-3 py-2 text-[9px]">
            <div className="flex gap-2">
              <span className="font-bold uppercase text-slate-400">
                Billed By
              </span>

              <strong>
                WORISH ECOSYSTEM PRIVATE LIMITED
              </strong>
            </div>

            {order?.gstin && (
              <div className="flex gap-2">
                <span className="font-bold uppercase text-slate-400">
                  GSTIN
                </span>

                <strong>{order.gstin}</strong>
              </div>
            )}
          </div>

          {/* CUSTOMER + DELIVERY */}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                Bill To
              </p>

              <p className="text-sm font-extrabold">
                {order?.customer_name ||
                  order?.customerName ||
                  "Customer"}
              </p>

              {order?.customer_phone && (
                <p className="mt-1 text-[11px] text-slate-600">
                  {order.customer_phone}
                </p>
              )}

              {order?.customer_email && (
                <p className="mt-1 break-all text-[11px] text-slate-600">
                  {order.customer_email}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                Delivery Address
              </p>

              <p className="break-words text-xs font-bold leading-5">
                {order?.address ||
                  order?.delivery_address ||
                  "Address not available"}
              </p>

              {(order?.city || order?.pincode) && (
                <p className="mt-1 text-[10px] text-slate-600">
                  {order?.city || ""}

                  {order?.city && order?.pincode
                    ? " - "
                    : ""}

                  {order?.pincode || ""}
                </p>
              )}

              {order?.delivery_option && (
                <p className="mt-2 text-[10px] text-slate-500">
                  Delivery:{" "}
                  <strong>
                    {order.delivery_option}
                  </strong>
                </p>
              )}

              {order?.delivery_slot && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Slot:{" "}
                  <strong>
                    {order.delivery_slot}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* PRODUCTS */}

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="w-[48%] px-3 py-2 text-left text-[9px] font-extrabold uppercase">
                    Product
                  </th>

                  <th className="w-[14%] px-3 py-2 text-center text-[9px] font-extrabold uppercase">
                    Qty
                  </th>

                  <th className="w-[19%] px-3 py-2 text-right text-[9px] font-extrabold uppercase">
                    Rate
                  </th>

                  <th className="w-[19%] px-3 py-2 text-right text-[9px] font-extrabold uppercase">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item: any, index: number) => {
                    const quantity = Number(
                      item?.qty ??
                        item?.quantity ??
                        1,
                    );

                    const price = Number(
                      item?.price ??
                        item?.unit_price ??
                        item?.unitPrice ??
                        0,
                    );

                    const productName =
                      item?.product_name ??
                      item?.productName ??
                      item?.name ??
                      "Product";

                    return (
                      <tr
                        key={
                          item?.id ??
                          item?.product_id ??
                          index
                        }
                      >
                        <td className="break-words border-t border-slate-200 px-3 py-2.5 text-xs font-semibold">
                          {productName}
                        </td>

                        <td className="border-t border-slate-200 px-3 py-2.5 text-center text-xs">
                          {quantity}
                        </td>

                        <td className="border-t border-slate-200 px-3 py-2.5 text-right text-xs">
                          {formatMoney(price)}
                        </td>

                        <td className="border-t border-slate-200 px-3 py-2.5 text-right text-xs font-extrabold">
                          {formatMoney(
                            price * quantity,
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t border-slate-200 px-3 py-8 text-center text-xs text-slate-400"
                    >
                      No product details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAYMENT + TOTAL */}

          <div className="mt-6 flex flex-col justify-between gap-8 sm:flex-row">
            <div className="min-w-[180px]">
              <p className="mb-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                Payment Details
              </p>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between gap-5">
                  <span className="text-slate-500">
                    Method
                  </span>

                  <strong>
                    {order?.payment_method || "COD"}
                  </strong>
                </div>

                <div className="flex justify-between gap-5">
                  <span className="text-slate-500">
                    Status
                  </span>

                  <strong>{paymentStatus}</strong>
                </div>

                {order?.transaction_id && (
                  <div className="flex justify-between gap-5">
                    <span className="text-slate-500">
                      Transaction
                    </span>

                    <strong className="break-all">
                      {order.transaction_id}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-[300px]">
              <div className="flex justify-between py-1 text-xs text-slate-500">
                <span>Subtotal</span>

                <strong>
                  {formatMoney(order?.subtotal)}
                </strong>
              </div>

              <div className="flex justify-between py-1 text-xs text-slate-500">
                <span>Delivery</span>

                <strong>
                  {formatMoney(order?.delivery)}
                </strong>
              </div>

              <div className="flex justify-between py-1 text-xs text-slate-500">
                <span>Tax</span>

                <strong>
                  {formatMoney(order?.tax)}
                </strong>
              </div>

              <div className="mt-2 flex justify-between border-t-2 border-slate-900 pt-3 text-base font-black">
                <span>Total Amount</span>

                <strong>
                  {formatMoney(order?.total)}
                </strong>
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="mt-5 flex items-center justify-between">
            <span
              className={
                isPaid
                  ? "rounded-full bg-green-100 px-3 py-1 text-[9px] font-extrabold uppercase text-green-700"
                  : "rounded-full bg-amber-100 px-3 py-1 text-[9px] font-extrabold uppercase text-amber-700"
              }
            >
              {paymentStatus}
            </span>

            {String(order?.status || "").toLowerCase() ===
              "delivered" && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-[9px] font-extrabold uppercase text-green-700">
                Delivered
              </span>
            )}
          </div>

          {/* FOOTER */}

          <div className="mt-8 border-t border-slate-200 pt-4 text-center">
            <p className="text-[11px] font-bold">
              Thank you for choosing Workkerz.
            </p>

            <p className="mt-1 text-[10px] font-extrabold text-slate-700">
              WORISH ECOSYSTEM PRIVATE LIMITED
            </p>

            <p className="mx-auto mt-1 max-w-lg text-[9px] text-slate-400">
              This is a computer-generated invoice and
              does not require a physical signature.
            </p>
          </div>
        </div>

        {/* PRINT CSS */}

        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            body * {
              visibility: hidden !important;
            }

            .invoice-print-area,
            .invoice-print-area * {
              visibility: visible !important;
            }

            .invoice-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            .invoice-actions {
              display: none !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </div>
    );
  },
);

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;