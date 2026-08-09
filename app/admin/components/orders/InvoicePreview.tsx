"use client";

import { forwardRef } from "react";
import { Printer, X } from "lucide-react";

type Props = {
  order: any;
  items: any[];
  onClose?: () => void;
  onPrint?: () => void;
};

const InvoicePreview = forwardRef<HTMLDivElement, Props>(
  ({ order, items, onClose, onPrint }, ref) => {
    const formatMoney = (value: any) =>
      `₹${Number(value || 0).toLocaleString("en-IN")}`;

    const date = order?.created_at
      ? new Date(order.created_at)
      : new Date();

    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="invoice-wrapper">
        {/* =====================================================
            MOBILE ACTION BAR
            IMPORTANT: outside print ref
        ===================================================== */}

        {(onClose || onPrint) && (
          <div className="invoice-mobile-actions">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="invoice-close-button"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="invoice-print-button"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            )}
          </div>
        )}

        {/* =====================================================
            ACTUAL PRINTABLE INVOICE
        ===================================================== */}

        <div ref={ref} className="invoice">
          {/* HEADER */}

          <div className="invoice-header">
            <div className="brand-section">
              <h1 className="brand-name">
                WORISH ECOSYSTEM
              </h1>

              <p className="brand-tagline">
                Digital Workforce & Marketplace
              </p>

              <div className="invoice-label">
                INVOICE
              </div>
            </div>

            <div className="invoice-meta">
              <p className="meta-label">
                Invoice Number
              </p>

              <h2 className="invoice-number">
                #{order?.order_number || "-"}
              </h2>

              <p className="invoice-date">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* CUSTOMER + DELIVERY */}

          <div className="info-grid">
            <div className="info-card">
              <p className="section-label">
                Customer
              </p>

              <p className="customer-name">
                {order?.customer_name || "-"}
              </p>

              {order?.customer_phone && (
                <p className="info-text">
                  {order.customer_phone}
                </p>
              )}

              {order?.customer_email && (
                <p className="info-text break-text">
                  {order.customer_email}
                </p>
              )}
            </div>

            <div className="info-card">
              <p className="section-label">
                Delivery Address
              </p>

              <p className="address-text">
                {order?.address || "-"}
              </p>

              {(order?.city || order?.pincode) && (
                <p className="info-text">
                  {order?.city || "-"}
                  {order?.pincode &&
                    ` - ${order.pincode}`}
                </p>
              )}

              {order?.delivery_option && (
                <p className="delivery-text">
                  Delivery:{" "}
                  <strong>
                    {order.delivery_option}
                  </strong>
                </p>
              )}

              {order?.delivery_slot && (
                <p className="delivery-text">
                  Slot:{" "}
                  <strong>
                    {order.delivery_slot}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* PRODUCTS */}

          <div className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="product-column">
                    Product
                  </th>

                  <th className="qty-column">
                    Qty
                  </th>

                  <th className="rate-column">
                    Rate
                  </th>

                  <th className="total-column">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {items?.length ? (
                  items.map(
                    (item: any, index: number) => {
                      const qty = Number(
                        item.qty || 0,
                      );

                      const price = Number(
                        item.price || 0,
                      );

                      return (
                        <tr
                          key={
                            item.id || index
                          }
                        >
                          <td className="product-name">
                            {item.product_name ||
                              "-"}
                          </td>

                          <td className="qty">
                            {qty}
                          </td>

                          <td className="rate">
                            {formatMoney(price)}
                          </td>

                          <td className="item-total">
                            {formatMoney(
                              price * qty,
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="empty-products"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAYMENT + SUMMARY */}

          <div className="bottom-section">
            <div className="payment-section">
              <p className="section-label">
                Payment Details
              </p>

              <div className="payment-list">
                <div className="payment-row">
                  <span>Method</span>

                  <strong>
                    {order?.payment_method ||
                      "COD"}
                  </strong>
                </div>

                <div className="payment-row">
                  <span>Status</span>

                  <strong>
                    {order?.payment_status ||
                      "Pending"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="summary">
              <div className="summary-row">
                <span>Subtotal</span>

                <strong>
                  {formatMoney(
                    order?.subtotal,
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <strong>
                  {formatMoney(
                    order?.delivery,
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>Tax</span>

                <strong>
                  {formatMoney(order?.tax)}
                </strong>
              </div>

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  {formatMoney(order?.total)}
                </strong>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="invoice-footer">
            <p className="thank-you">
              Thank you for choosing Workkerz.
            </p>

            <p className="generated-text">
              This is a computer-generated invoice
              and does not require a physical
              signature.
            </p>
          </div>
        </div>

        {/* =====================================================
            CSS
        ===================================================== */}

        <style>{`
          * {
            box-sizing: border-box;
          }

          .invoice-wrapper {
            width: 100%;
            background: #f1f5f9;
          }

          /* ===================================================
             MOBILE ACTION BAR
          =================================================== */

          .invoice-mobile-actions {
            display: none;
          }

          .invoice-close-button,
          .invoice-print-button {
            border: 0;
            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 7px;

            height: 42px;

            border-radius: 11px;

            padding: 0 15px;

            font-family: Arial, Helvetica, sans-serif;

            font-size: 13px;
            font-weight: 700;
          }

          .invoice-close-button {
            flex: 1;
            background: #f1f5f9;
            color: #334155;
          }

          .invoice-print-button {
            flex: 1.4;
            background: #0f172a;
            color: white;
          }

          /* ===================================================
             INVOICE
          =================================================== */

          .invoice {
            width: 100%;
            max-width: 900px;

            margin: 0 auto;

            padding: 40px;

            background: #ffffff;

            color: #0f172a;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            font-size: 14px;
            line-height: 1.45;
          }

          .invoice *,
          .invoice *::before,
          .invoice *::after {
            box-sizing: border-box;
          }

          /* ===================================================
             HEADER
          =================================================== */

          .invoice-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 30px;

            padding-bottom: 22px;

            border-bottom: 2px solid #0f172a;
          }

          .brand-section {
            min-width: 0;
          }

          .brand-name {
            margin: 0;

            font-size: 30px;
            line-height: 1;

            font-weight: 900;

            letter-spacing: -0.8px;
          }

          .brand-tagline {
            margin: 7px 0 0;

            color: #64748b;

            font-size: 11px;
            font-weight: 600;
          }

          .invoice-label {
            margin-top: 17px;

            color: #334155;

            font-size: 13px;
            font-weight: 800;
          }

          .invoice-meta {
            min-width: 150px;
            text-align: right;
          }

          .meta-label {
            margin: 0;

            color: #94a3b8;

            font-size: 9px;
            font-weight: 700;

            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .invoice-number {
            margin: 4px 0 0;

            font-size: 18px;
            font-weight: 800;
          }

          .invoice-date {
            margin: 7px 0 0;

            color: #64748b;

            font-size: 11px;
          }

          /* ===================================================
             INFO
          =================================================== */

          .info-grid {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 18px;

            margin-top: 24px;
          }

          .info-card {
            min-width: 0;

            padding: 16px;

            border: 1px solid #e2e8f0;

            border-radius: 10px;

            background: #fff;
          }

          .section-label {
            margin: 0 0 9px;

            color: #94a3b8;

            font-size: 9px;
            font-weight: 800;

            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .customer-name {
            margin: 0;

            font-size: 14px;
            font-weight: 800;
          }

          .info-text {
            margin: 5px 0 0;

            color: #475569;

            font-size: 11px;
          }

          .break-text {
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .address-text {
            margin: 0;

            font-size: 13px;
            font-weight: 700;

            line-height: 1.5;

            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .delivery-text {
            margin: 7px 0 0;

            color: #64748b;

            font-size: 10px;
          }

          /* ===================================================
             PRODUCTS
          =================================================== */

          .items-section {
            width: 100%;

            margin-top: 25px;

            overflow: hidden;

            border: 1px solid #e2e8f0;

            border-radius: 10px;
          }

          .items-table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
          }

          .items-table thead tr {
            background: #0f172a;
            color: white;
          }

          .items-table th {
            padding: 10px 12px;

            font-size: 9px;
            font-weight: 800;

            text-transform: uppercase;
          }

          .items-table td {
            border-top: 1px solid #e2e8f0;

            padding: 11px 12px;
          }

          .product-column {
            width: 48%;
            text-align: left;
          }

          .qty-column {
            width: 14%;
            text-align: center;
          }

          .rate-column {
            width: 19%;
            text-align: right;
          }

          .total-column {
            width: 19%;
            text-align: right;
          }

          .product-name {
            font-size: 12px;
            font-weight: 600;

            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .qty {
            font-size: 12px;
            text-align: center;
          }

          .rate,
          .item-total {
            font-size: 12px;

            text-align: right;

            white-space: nowrap;
          }

          .item-total {
            font-weight: 800;
          }

          .empty-products {
            padding: 30px 12px !important;

            color: #94a3b8;

            text-align: center;
          }

          /* ===================================================
             PAYMENT
          =================================================== */

          .bottom-section {
            display: flex;

            align-items: flex-start;
            justify-content: space-between;

            gap: 40px;

            margin-top: 24px;
          }

          .payment-section {
            min-width: 180px;
          }

          .payment-list {
            display: flex;

            flex-direction: column;

            gap: 7px;
          }

          .payment-row {
            display: flex;

            align-items: center;
            justify-content: space-between;

            gap: 20px;

            color: #64748b;

            font-size: 11px;
          }

          .payment-row strong {
            color: #0f172a;
          }

          .summary {
            width: 300px;
            max-width: 100%;
          }

          .summary-row {
            display: flex;

            justify-content: space-between;

            gap: 20px;

            padding: 4px 0;

            color: #64748b;

            font-size: 12px;
          }

          .summary-row strong {
            color: #334155;
            white-space: nowrap;
          }

          .summary-total {
            display: flex;

            justify-content: space-between;

            gap: 20px;

            margin-top: 9px;

            padding-top: 11px;

            border-top: 2px solid #0f172a;

            font-size: 16px;
            font-weight: 900;
          }

          /* ===================================================
             FOOTER
          =================================================== */

          .invoice-footer {
            margin-top: 32px;

            padding-top: 17px;

            border-top: 1px solid #e2e8f0;

            text-align: center;
          }

          .thank-you {
            margin: 0;

            font-size: 11px;
            font-weight: 700;
          }

          .generated-text {
            max-width: 500px;

            margin: 5px auto 0;

            color: #94a3b8;

            font-size: 9px;
          }

          /* ===================================================
             MOBILE
          =================================================== */

          @media (max-width: 640px) {
            .invoice-wrapper {
              min-height: 100vh;
              padding-bottom: 72px;
              background: #f1f5f9;
            }

            .invoice-mobile-actions {
              position: fixed;

              left: 0;
              right: 0;
              bottom: 0;

              z-index: 99999;

              display: flex;

              gap: 8px;

              padding:
                9px
                12px
                calc(9px + env(safe-area-inset-bottom));

              background: rgba(
                255,
                255,
                255,
                0.97
              );

              border-top: 1px solid #e2e8f0;

              box-shadow:
                0 -8px 25px
                rgba(15, 23, 42, 0.10);

              backdrop-filter: blur(12px);
            }

            .invoice {
              width: 100%;
              max-width: 100%;

              padding: 14px;
            }

            .invoice-header {
              gap: 10px;

              padding-bottom: 13px;
            }

            .brand-name {
              font-size: 20px;

              letter-spacing: -0.5px;
            }

            .brand-tagline {
              margin-top: 4px;

              font-size: 7px;
            }

            .invoice-label {
              margin-top: 8px;

              font-size: 9px;
            }

            .invoice-meta {
              min-width: 95px;
            }

            .meta-label {
              font-size: 6.5px;
            }

            .invoice-number {
              font-size: 10px;
            }

            .invoice-date {
              margin-top: 3px;

              font-size: 7px;
            }

            .info-grid {
              grid-template-columns: 1fr;

              gap: 7px;

              margin-top: 12px;
            }

            .info-card {
              padding: 9px;

              border-radius: 8px;
            }

            .section-label {
              margin-bottom: 5px;

              font-size: 7px;
            }

            .customer-name {
              font-size: 10px;
            }

            .info-text {
              margin-top: 3px;

              font-size: 8px;
            }

            .address-text {
              font-size: 9px;

              line-height: 1.4;
            }

            .delivery-text {
              margin-top: 4px;

              font-size: 7.5px;
            }

            .items-section {
              margin-top: 12px;

              border-radius: 8px;
            }

            .items-table th {
              padding: 7px 5px;

              font-size: 6.5px;
            }

            .items-table td {
              padding: 7px 5px;
            }

            .product-column {
              width: 44%;
            }

            .qty-column {
              width: 13%;
            }

            .rate-column {
              width: 21%;
            }

            .total-column {
              width: 22%;
            }

            .product-name,
            .qty,
            .rate,
            .item-total {
              font-size: 8px;
            }

            .bottom-section {
              flex-direction: column;

              gap: 12px;

              margin-top: 13px;
            }

            .payment-section,
            .summary {
              width: 100%;
              min-width: 0;
            }

            .payment-list {
              gap: 4px;
            }

            .payment-row,
            .summary-row {
              font-size: 8.5px;
            }

            .summary-row {
              padding: 2px 0;
            }

            .summary-total {
              margin-top: 5px;

              padding-top: 7px;

              font-size: 12px;
            }

            .invoice-footer {
              margin-top: 17px;

              padding-top: 10px;
            }

            .thank-you {
              font-size: 8.5px;
            }

            .generated-text {
              font-size: 6.5px;
            }
          }

          /* ===================================================
             PRINT
          =================================================== */

          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;

              width: 100% !important;

              background: white !important;
            }

            .invoice-wrapper {
              background: white !important;
              padding: 0 !important;
            }

            .invoice-mobile-actions {
              display: none !important;
            }

            .invoice {
              width: 100% !important;
              max-width: none !important;

              margin: 0 !important;
              padding: 0 !important;
            }

            .invoice-header,
            .info-grid,
            .bottom-section,
            .invoice-footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .items-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
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