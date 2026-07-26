"use client";

import { useState } from "react";
import {
  Receipt,
  ShieldCheck,
  QrCode,
  X,
} from "lucide-react";

interface CheckoutPaymentStepProps {
  form: any;
  update: (field: string, value: string) => void;
  grandTotal: number;
  inp: string;
}

export default function CheckoutPaymentStep({
  form,
  update,
  grandTotal,
  inp,
}: CheckoutPaymentStepProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div
        className="space-y-4 pb-5"
        style={{
          paddingBottom:
            "calc(4rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* HEADER */}

        <div>
          <h2
            className="text-[#0F172A] text-[1rem] mb-1"
            style={{ fontWeight: 800 }}
          >
            Complete Payment
          </h2>

          <p className="text-[#64748B] text-sm">
            Scan QR & enter transaction ID to continue
          </p>
        </div>

        {/* CARD */}

        <div className="rounded-4xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">

          {/* Apps */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <a
              href={`gpay://upi/pay?pa=8602190366@ptaxis&pn=EAurix&am=${grandTotal}&cu=INR`}
              className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center gap-2 px-3 transition-all"
            >
              <img
                src="/gpay.png"
                alt="GPay"
                className="w-8 h-8 object-contain"
              />

              <span className="text-sm font-semibold text-[#0F172A]">
                GPay
              </span>
            </a>

            <a
              href={`phonepe://pay?pa=8602190366@ptaxis&pn=EAurix&am=${grandTotal}&cu=INR`}
              className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
            >
              <img
                src="/phonepe.svg"
                className="w-28 h-8 object-contain"
                alt="PhonePe"
              />
            </a>

            <a
              href={`paytmmp://pay?pa=8602190366@ptaxis&pn=EAurix&am=${grandTotal}&cu=INR`}
              className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
            >
              <img
                src="/paytm.png"
                className="w-28 h-8 object-contain"
                alt="Paytm"
              />
            </a>

            <a
              href={`amazonpay://pay?pa=8602190366@ptaxis&pn=EAurix&am=${grandTotal}&cu=INR`}
              className="h-14 rounded-2xl border border-gray-200 hover:border-[#FF5C39] flex items-center justify-center p-3 transition-all"
            >
              <img
                src="/amazon_pay.svg"
                className="w-28 h-10 object-contain"
                alt="Amazon Pay"
              />
            </a>

          </div>

          {/* QR BUTTON */}

          <button
            type="button"
            onClick={() => setShowQR(true)}
            className="mt-6 w-full h-14 rounded-2xl bg-[#0F172A] text-white font-semibold flex items-center justify-center gap-3 hover:bg-black transition"
          >
            <QrCode className="w-5 h-5" />
            Show QR Code
          </button>

          {/* Transaction */}

          <div className="mt-7">

            <label className="block text-sm text-[#0F172A] mb-2">
              Transaction ID *
            </label>

            <div className="relative">

              <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  (
                    document.activeElement as HTMLInputElement
                  )?.blur();
                }}
              >
                <input
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="done"
                  value={form.transactionId || ""}
                  onChange={(e) =>
                    update(
                      "transactionId",
                      e.target.value,
                    )
                  }
                  placeholder="Enter UPI Transaction ID"
                  className={inp + " pl-11"}
                />
              </form>

            </div>

          </div>

          {/* VERIFY */}

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 flex gap-3">

            <ShieldCheck className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" />

            <div>

              <div className="text-sm font-bold text-[#0F172A]">
                Payment Verification
              </div>

              <div className="text-xs text-[#64748B] mt-1">
                Your order will be confirmed after successful
                payment verification.
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* QR POPUP */}

      {showQR && (

        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">

            <button
              onClick={() => setShowQR(false)}
              className="absolute right-4 top-4 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">

              <h3 className="text-xl font-bold text-[#0F172A]">
                Scan QR Code
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Pay ₹{grandTotal.toFixed(2)}
              </p>

            </div>

            <div className="rounded-3xl border-4 border-[#0F172A] p-4">

              <img
                src="/workkerzpay.jpeg"
                alt="QR Code"
                className="w-full rounded-2xl"
              />

            </div>

            <div className="mt-5 text-center">

              <div className="text-3xl font-black text-[#0F172A]">
                ₹{grandTotal.toFixed(2)}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Scan using GPay, PhonePe, Paytm or any UPI App
              </p>

            </div>

            <button
              onClick={() => setShowQR(false)}
              className="mt-6 h-12 w-full rounded-2xl bg-[#FF5C39] text-white font-semibold"
            >
              Done
            </button>

          </div>

        </div>

      )}
    </>
  );
}