"use client";

import {
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import type { RequesterType } from "@/app/components/HomeHero";

interface RequestStep1Props {
  requesterType: RequesterType;
  setRequesterType: (
    value: RequesterType,
  ) => void;

  requesterName: string;
  setRequesterName: (
    value: string,
  ) => void;

  requesterMobile: string;
  setRequesterMobile: (
    value: string,
  ) => void;

  requesterEmail: string;
  setRequesterEmail: (
    value: string,
  ) => void;

  companyName: string;
  setCompanyName: (
    value: string,
  ) => void;

  gstin: string;
  setGstin: (
    value: string,
  ) => void;

  requesterAddress: string;
  setRequesterAddress: (
    value: string,
  ) => void;

  onNext: () => void;
}

export default function RequestStep1({
  requesterType,
  setRequesterType,

  requesterName,
  setRequesterName,

  requesterMobile,
  setRequesterMobile,

  requesterEmail,
  setRequesterEmail,

  companyName,
  setCompanyName,

  gstin,
  setGstin,

  requesterAddress,
  setRequesterAddress,

  onNext,
}: RequestStep1Props) {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-[0_10px_40px_rgba(0,0,0,0.05)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-600
            "
          >
            <User className="h-5 w-5" />
          </div>

          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-emerald-600
              "
            >
              Step 1
            </p>

            <h1
              className="
                mt-0.5
                text-base
                font-black
                tracking-tight
                text-gray-950
              "
            >
              Requester Details
            </h1>

            <p
              className="
                mt-0.5
                text-[10px]
                leading-4
                text-gray-500
              "
            >
              Tell us who is requesting the workers.
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="space-y-4 p-4 sm:p-5">

        {/* ===================================================
            REQUESTER TYPE
        =================================================== */}

        <div>
          <FieldLabel
            icon={
              <User className="h-3.5 w-3.5" />
            }
            label="Who is sending this request?"
            required
          />

          <div className="mt-2 grid grid-cols-3 gap-2">

            {(
              [
                [
                  "individual",
                  "Individual",
                ],
                [
                  "contractor",
                  "Contractor",
                ],
                [
                  "company",
                  "Company",
                ],
              ] as const
            ).map(
              ([value, label]) => {
                const active =
                  requesterType ===
                  value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRequesterType(
                        value,
                      );

                      if (
                        value ===
                        "individual"
                      ) {
                        setCompanyName(
                          "",
                        );

                        setGstin("");
                      }
                    }}
                    className={`
                      flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      px-2
                      text-[10px]
                      font-black
                      transition
                      active:scale-[.98]

                      ${
                        active
                          ? `
                            border-emerald-500
                            bg-emerald-50
                            text-emerald-700
                            shadow-sm
                          `
                          : `
                            border-gray-200
                            bg-gray-50
                            text-gray-600
                            hover:border-emerald-200
                          `
                      }
                    `}
                  >
                    {label}
                  </button>
                );
              },
            )}

          </div>
        </div>

        {/* ===================================================
            NAME + MOBILE
        =================================================== */}

        <div className="grid gap-3 sm:grid-cols-2">

          <InputField
            icon={
              <User className="h-3.5 w-3.5" />
            }
            label={
              requesterType ===
              "company"
                ? "Contact Person Name"
                : requesterType ===
                    "contractor"
                  ? "Contractor Name"
                  : "Full Name"
            }
            required
            placeholder={
              requesterType ===
              "company"
                ? "Enter contact person name"
                : requesterType ===
                    "contractor"
                  ? "Enter contractor name"
                  : "Enter your full name"
            }
            value={
              requesterName
            }
            onChange={
              setRequesterName
            }
            autoComplete="name"
          />

          <InputField
            icon={
              <Phone className="h-3.5 w-3.5" />
            }
            label="Mobile Number"
            required
            placeholder="10-digit mobile number"
            value={
              requesterMobile
            }
            onChange={(value) =>
              setRequesterMobile(
                value
                  .replace(
                    /\D/g,
                    "",
                  )
                  .slice(
                    0,
                    10,
                  ),
              )
            }
            inputMode="numeric"
            maxLength={10}
            prefix="+91"
            autoComplete="tel"
          />

        </div>

        {/* ===================================================
            EMAIL
        =================================================== */}

        <InputField
          icon={
            <Mail className="h-3.5 w-3.5" />
          }
          label="Email Address"
          placeholder="example@email.com"
          value={
            requesterEmail
          }
          onChange={
            setRequesterEmail
          }
          inputMode="email"
          autoComplete="email"
        />

        {/* ===================================================
            COMPANY / CONTRACTOR
        =================================================== */}

        {(
          requesterType ===
            "contractor" ||
          requesterType ===
            "company"
        ) && (
          <div className="grid gap-3 sm:grid-cols-2">

            <InputField
              icon={
                <Building2 className="h-3.5 w-3.5" />
              }
              label={
                requesterType ===
                "company"
                  ? "Company Name"
                  : "Contractor / Firm Name"
              }
              required
              placeholder={
                requesterType ===
                "company"
                  ? "Enter company name"
                  : "Enter contractor / firm name"
              }
              value={
                companyName
              }
              onChange={
                setCompanyName
              }
              autoComplete="organization"
            />

            <InputField
              label="GSTIN"
              placeholder="Optional GSTIN"
              value={gstin}
              onChange={(value) =>
                setGstin(
                  value
                    .replace(
                      /\s/g,
                      "",
                    )
                    .toUpperCase()
                    .slice(
                      0,
                      15,
                    ),
                )
              }
              maxLength={15}
              autoComplete="off"
            />

          </div>
        )}

        {/* ===================================================
            CONTACT ADDRESS
        =================================================== */}

        <div>

          <FieldLabel
            icon={
              <MapPin className="h-3.5 w-3.5" />
            }
            label="Contact Address"
          />

          <textarea
            value={
              requesterAddress
            }
            onChange={(event) =>
              setRequesterAddress(
                event.target.value,
              )
            }
            rows={3}
            placeholder="Optional contact / office address"
            className="
              mt-1.5
              min-h-[80px]
              w-full
              resize-none
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-3
              py-2.5
              text-xs
              font-medium
              text-gray-900
              outline-none
              placeholder:text-gray-400
              transition

              focus:border-emerald-500
              focus:bg-white
              focus:ring-2
              focus:ring-emerald-500/10
            "
          />

        </div>

        {/* ===================================================
            INFO
        =================================================== */}

        <div
          className="
            rounded-xl
            border
            border-emerald-100
            bg-emerald-50/60
            px-3
            py-2.5
          "
        >
          <p className="text-[10px] font-black text-emerald-800">
            Your details are safe
          </p>

          <p className="mt-0.5 text-[9px] leading-4 text-emerald-700">
            We use these details only to contact
            you regarding your worker request.
          </p>
        </div>

      </div>

      {/* =====================================================
          NOTE
      ===================================================== */}

      <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
        <p className="text-center text-[9px] font-medium text-gray-400">
          Continue to select the workers you need.
        </p>
      </div>

    </section>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required,
}: {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">

      {icon && (
        <span className="text-emerald-600">
          {icon}
        </span>
      )}

      <label className="text-[10px] font-bold text-gray-700">
        {label}

        {required && (
          <span className="ml-0.5 text-red-500">
            *
          </span>
        )}
      </label>

    </div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  icon,
  label,
  required,
  placeholder,
  value,
  onChange,
  inputMode,
  maxLength,
  prefix,
  autoComplete,
}: {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  prefix?: string;
  autoComplete?: string;
}) {
  return (
    <div>

      <FieldLabel
        icon={icon}
        label={label}
        required={required}
      />

      <div
        className="
          mt-1.5
          flex
          h-11
          items-center
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          px-3

          transition

          focus-within:border-emerald-500
          focus-within:bg-white
          focus-within:ring-2
          focus-within:ring-emerald-500/10
        "
      >

        {prefix && (
          <span className="mr-1.5 shrink-0 text-sm font-black text-gray-500">
            {prefix}
          </span>
        )}

        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={
            placeholder
          }
          inputMode={
            inputMode
          }
          maxLength={
            maxLength
          }
          autoComplete={
            autoComplete
          }
          className="
            min-w-0
            w-full
            bg-transparent
            text-xs
            font-medium
            text-gray-900
            outline-none
            placeholder:text-gray-400
          "
        />

      </div>

    </div>
  );
}