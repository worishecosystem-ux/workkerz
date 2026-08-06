"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import OrderItemsList from "./OrderItemsList";
import OrderTimeline from "./OrderTimeline";
import OrderActions from "./OrderActions";
import OrderHistory from "./OrderHistory";
import CustomerCard from "./CustomerCard";
import AddressCard from "./AddressCard";
import OrderHeader from "./OrderHeader";
import PaymentCard from "./PaymentCard";
import InvoicePreview from "./InvoicePreview";
import { useReactToPrint } from "react-to-print";
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
  useEffect(() => {
    if (!order) return;

    fetchHistory();
  }, [order]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setHistory(data || []);
  };
  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: order?.order_number || "Invoice",
  });
  if (!open || !order) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 lg:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
      >
        {/* Header */}
        <OrderHeader
          order={order}
          onClose={onClose}
          onPrint={handlePrint}
          onStatusChange={onStatusChange}
          onPaymentStatusChange={onPaymentStatusChange}
          paymentSummary={
            <PaymentCard
              order={order}
              onStatusChange={onStatusChange}
              onPaymentStatusChange={onPaymentStatusChange}
            />
          }
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-100">
          <div className="mx-auto max-w-7xl space-y-3 p-3">
            {/* Products */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                    📦
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Products
                    </h2>

                    <p className="text-[11px] text-slate-500">
                      {items.length} Items
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {items.length}
                </span>
              </div>

              <OrderItemsList items={items} />
            </section>

            {/* Activity */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                    🕒
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Activity
                    </h2>

                    <p className="text-[11px] text-slate-500">Order Updates</p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {history.length}
                </span>
              </div>

              <OrderHistory history={history} />
            </section>
          </div>
        </div>
      </div>

      {/* Print */}
      <div className="hidden">
        <InvoicePreview ref={invoiceRef} order={order} items={items} />
      </div>
    </div>
  );
}
