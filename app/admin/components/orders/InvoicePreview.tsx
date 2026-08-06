"use client";

import { forwardRef } from "react";

type Props = {
  order: any;
  items: any[];
};

const InvoicePreview = forwardRef<HTMLDivElement, Props>(
  ({ order, items }, ref) => {
    return (
      <div
        ref={ref}
        id="invoice"
        className="rounded-2xl bg-white p-8 text-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold">
              WORKKERZ
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Order Invoice
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold">
              #{order.order_number}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Customer */}

        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-2 font-semibold">
              Customer
            </h3>

            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.customer_email}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">
              Delivery Address
            </h3>

            <p>{order.address}</p>

            <p>
              {order.city} - {order.pincode}
            </p>
          </div>
        </div>

        {/* Products */}

        <div className="mt-10 overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Product
                </th>

                <th className="p-4 text-center">
                  Qty
                </th>

                <th className="p-4 text-right">
                  Price
                </th>

                <th className="p-4 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item: any) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.product_name}
                  </td>

                  <td className="p-4 text-center">
                    {item.qty}
                  </td>

                  <td className="p-4 text-right">
                    ₹{Number(item.price).toLocaleString()}
                  </td>

                  <td className="p-4 text-right font-semibold">
                    ₹
                    {Number(
                      item.price * item.qty
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}

        <div className="mt-8 ml-auto w-80 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>

            <span>
              ₹{Number(order.subtotal || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>

            <span>
              ₹{Number(order.delivery || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>

            <span>
              ₹{Number(order.tax || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between border-t pt-3 text-xl font-bold">
            <span>Total</span>

            <span>
              ₹{Number(order.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}

        <div className="mt-12 border-t pt-6 text-center text-sm text-slate-500">
          Thank you for shopping with Workkerz.
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;