
"use client";

import { useState } from "react";
import {
  CalendarDays,
  Download,
  FileSpreadsheet,
  LoaderCircle,
} from "lucide-react";
import ExcelJS from "exceljs";
import { supabase } from "@/lib/supabase";

import type { FinanceTransaction } from "./finance.types";

type ReportType = "daily" | "monthly" | "yearly" | "custom";

interface FinanceExportButtonProps {
  transactions: FinanceTransaction[];
  loading?: boolean;
  disabled?: boolean;
}

const COMPANY_NAME = "WORISH ECOSYSTEM PRIVATE LIMITED";
const BRAND_NAME = "WORKKERZ";
const BOOKING_CHARGE = 49;
const PAGE_SIZE = 100;

const money = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const dateKey = (value?: string | null) => {
  if (!value) return "";
  return value.slice(0, 10);
};

const formatDate = (value: string) => {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPeriod = (value: string, type: ReportType) => {
  if (type === "monthly") {
    const date = new Date(`${value}-01T00:00:00`);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
  }

  return value;
};

function getReportDates(
  type: ReportType,
  dailyDate: string,
  month: string,
  year: string,
  customStart: string,
  customEnd: string
) {
  if (type === "daily") {
    return { start: dailyDate, end: dailyDate };
  }

  if (type === "monthly") {
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();

    return {
      start: `${month}-01`,
      end: `${month}-${String(lastDay).padStart(2, "0")}`,
    };
  }

  if (type === "yearly") {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  }

  return { start: customStart, end: customEnd };
}

function isPaid(transaction: FinanceTransaction) {
  return String(transaction.status ?? "").toLowerCase() === "paid";
}

function isRefund(transaction: FinanceTransaction) {
  const type = String(
    transaction.transaction_type ?? ""
  ).toLowerCase();

  const status = String(transaction.status ?? "").toLowerCase();

  return (
    type === "refund" ||
    type === "partial_refund" ||
    status === "refunded" ||
    status === "partially_refunded"
  );
}

function transactionDate(transaction: FinanceTransaction) {
  return dateKey(
    transaction.paid_at || transaction.created_at
  );
}

function createPeriodRows(
  transactions: FinanceTransaction[],
  periodType: "daily" | "monthly" | "yearly"
) {
  const groups = new Map<
    string,
    {
      period: string;
      successfulPayments: number;
      collection: number;
      bookingFees: number;
      refunds: number;
      pending: number;
      failed: number;
    }
  >();

  for (const transaction of transactions) {
    const date = transactionDate(transaction);
    if (!date) continue;

    let period = date;

    if (periodType === "monthly") period = date.slice(0, 7);
    if (periodType === "yearly") period = date.slice(0, 4);

    const item = groups.get(period) ?? {
      period,
      successfulPayments: 0,
      collection: 0,
      bookingFees: 0,
      refunds: 0,
      pending: 0,
      failed: 0,
    };

    const status = String(
      transaction.status ?? ""
    ).toLowerCase();

    if (isPaid(transaction) && !isRefund(transaction)) {
      item.successfulPayments += 1;
      item.collection += money(transaction.amount);

      // Fixed company booking fee per successful payment record.
      item.bookingFees += BOOKING_CHARGE;
    } else if (isRefund(transaction)) {
      item.refunds += money(
        transaction.refund_amount || transaction.amount
      );
    } else if (
      ["pending", "created", "processing"].includes(status)
    ) {
      item.pending += money(transaction.amount);
    } else if (status === "failed") {
      item.failed += money(transaction.amount);
    }

    groups.set(period, item);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}

function styleSheet(
  sheet: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  lastColumn: number
) {
  sheet.mergeCells(1, 1, 1, lastColumn);
  sheet.mergeCells(2, 1, 2, lastColumn);

  const titleCell = sheet.getCell(1, 1);
  titleCell.value = COMPANY_NAME;
  titleCell.font = {
    name: "Aptos Display",
    size: 16,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF064E3B" },
  };

  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = `${BRAND_NAME} | ${title} | ${subtitle}`;
  subtitleCell.font = {
    name: "Aptos",
    size: 10,
    color: { argb: "FF374151" },
    italic: true,
  };
  subtitleCell.alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  subtitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD1FAE5" },
  };

  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 23;

  sheet.views = [{ state: "frozen", ySplit: 4 }];
}

function styleHeader(row: ExcelJS.Row) {
  row.height = 25;

  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 10,
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF047857" },
    };

    cell.alignment = {
      vertical: "middle",
      wrapText: true,
    };

    cell.border = {
      bottom: {
        style: "thin",
        color: { argb: "FF064E3B" },
      },
    };
  });
}

function styleBody(sheet: ExcelJS.Worksheet) {
  for (let rowNumber = 5; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0FDF4" },
        };
      });
    }

    row.eachCell((cell) => {
      cell.font = {
        name: "Aptos",
        size: 10,
        color: { argb: "FF111827" },
      };

      cell.alignment = {
        vertical: "middle",
      };
    });
  }
}

function addPeriodSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  title: string,
  subtitle: string,
  rows: ReturnType<typeof createPeriodRows>
) {
  const sheet = workbook.addWorksheet(name);

  styleSheet(sheet, title, subtitle, 7);

  sheet.addRow([]);
  sheet.addRow([
    "Period",
    "Successful Payments",
    "Total Collection (INR)",
    "Company Booking Fees (INR)",
    "Refunds (INR)",
    "Pending Amount (INR)",
    "Failed Amount (INR)",
  ]);

  styleHeader(sheet.getRow(4));

  for (const item of rows) {
    sheet.addRow([
      item.period,
      item.successfulPayments,
      item.collection,
      item.bookingFees,
      item.refunds,
      item.pending,
      item.failed,
    ]);
  }

  if (rows.length) {
    const totalRow = sheet.addRow([
      "TOTAL",
      { formula: `SUM(B5:B${sheet.rowCount})` },
      { formula: `SUM(C5:C${sheet.rowCount})` },
      { formula: `SUM(D5:D${sheet.rowCount})` },
      { formula: `SUM(E5:E${sheet.rowCount})` },
      { formula: `SUM(F5:F${sheet.rowCount})` },
      { formula: `SUM(G5:G${sheet.rowCount})` },
    ]);

    totalRow.font = { bold: true };
    totalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD1FAE5" },
      };
    });
  }

  sheet.columns = [
    { width: 18 },
    { width: 22 },
    { width: 23 },
    { width: 30 },
    { width: 19 },
    { width: 22 },
    { width: 20 },
  ];

  for (let r = 5; r <= sheet.rowCount; r++) {
    for (let c = 3; c <= 7; c++) {
      sheet.getCell(r, c).numFmt = '"₹"#,##0.00';
    }
  }

  styleBody(sheet);
  sheet.autoFilter = {
    from: "A4",
    to: "G4",
  };

  return sheet;
}

export default function FinanceExportButton({
  transactions,
  loading = false,
  disabled = false,
}: FinanceExportButtonProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [reportType, setReportType] =
    useState<ReportType>("monthly");

  const [dailyDate, setDailyDate] = useState(today);

  const [month, setMonth] = useState(today.slice(0, 7));

  const [year, setYear] = useState(today.slice(0, 4));

  const [customStart, setCustomStart] = useState(today);

  const [customEnd, setCustomEnd] = useState(today);

  const [exporting, setExporting] = useState(false);

  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    if (loading || disabled || exporting) return;

    const { start, end } = getReportDates(
      reportType,
      dailyDate,
      month,
      year,
      customStart,
      customEnd
    );

    if (!start || !end || start > end) {
      setExportError("Please select a valid report date range.");
      return;
    }

    setExporting(true);
    setExportError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Please log in again to export finance data.");
      }

      // Fetch every page for the selected date range.
      const allTransactions: FinanceTransaction[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          startDate: start,
          endDate: end,
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });

        const response = await fetch(
          `/api/admin/finance/transactions?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = (await response.json()) as {
          success?: boolean;
          error?: string;
          data?: {
            transactions?: FinanceTransaction[];
            totalPages?: number;
          };
        };

        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.error || "Unable to fetch report data.");
        }

        allTransactions.push(...(result.data.transactions ?? []));
        totalPages = Math.max(1, result.data.totalPages ?? 1);
        page += 1;
      } while (page <= totalPages);

      const workbook = new ExcelJS.Workbook();

      workbook.creator = COMPANY_NAME;
      workbook.subject = "Finance and transaction report";
      workbook.title = `${COMPANY_NAME} Finance Report`;
      workbook.company = COMPANY_NAME;
      workbook.created = new Date();

      workbook.properties.date1904 = false;

      const subtitle = `${formatDate(start)} to ${formatDate(end)}`;

      // Financial Summary
      const summarySheet = workbook.addWorksheet("Financial Summary");

      styleSheet(
        summarySheet,
        "Financial Report",
        `${reportType.toUpperCase()} | ${subtitle}`,
        4
      );

      summarySheet.addRow([]);
      summarySheet.addRow(["Metric", "Amount (INR)", "Count", "Notes"]);
      styleHeader(summarySheet.getRow(4));

      const paid = allTransactions.filter(
        (item) => isPaid(item) && !isRefund(item)
      );

      const refunded = allTransactions.filter(isRefund);

      const pending = allTransactions.filter((item) =>
        ["pending", "created", "processing"].includes(
          String(item.status ?? "").toLowerCase()
        )
      );

      const failed = allTransactions.filter(
        (item) =>
          String(item.status ?? "").toLowerCase() === "failed"
      );

      const totalCollection = paid.reduce(
        (sum, item) => sum + money(item.amount),
        0
      );

      const bookingFees = paid.length * BOOKING_CHARGE;

      const totalRefunds = refunded.reduce(
        (sum, item) =>
          sum + money(item.refund_amount || item.amount),
        0
      );

      const pendingAmount = pending.reduce(
        (sum, item) => sum + money(item.amount),
        0
      );

      const failedAmount = failed.reduce(
        (sum, item) => sum + money(item.amount),
        0
      );

      const gatewayFees = paid.reduce(
        (sum, item) => sum + money(item.gateway_fee),
        0
      );

      const workerEarnings = paid.reduce(
        (sum, item) => sum + money(item.net_amount),
        0
      );

      const summaryRows = [
        ["Total Successful Collection", totalCollection, paid.length, "Successful payment records"],
        ["Company Booking Fees", bookingFees, paid.length, `₹${BOOKING_CHARGE} per successful payment record`],
        ["Total Refunds", totalRefunds, refunded.length, "Refund records in selected range"],
        ["Pending Amount", pendingAmount, pending.length, "Pending payment records"],
        ["Failed Amount", failedAmount, failed.length, "Failed payment records"],
        ["Gateway Fees", gatewayFees, paid.length, "Recorded gateway fees"],
        ["Worker Net Amount", workerEarnings, paid.length, "Recorded net_amount"],
        ["All Transactions", 0, allTransactions.length, "Total records fetched"],
      ];

      for (const row of summaryRows) {
        summarySheet.addRow(row);
      }

      summarySheet.columns = [
        { width: 34 },
        { width: 22 },
        { width: 14 },
        { width: 42 },
      ];

      for (let r = 5; r <= summarySheet.rowCount; r++) {
        summarySheet.getCell(r, 2).numFmt = '"₹"#,##0.00';
      }

      styleBody(summarySheet);

      // Transaction Ledger
      const transactionSheet = workbook.addWorksheet("Transactions");

      styleSheet(
        transactionSheet,
        "Transaction Ledger",
        subtitle,
        12
      );

      transactionSheet.addRow([]);
      transactionSheet.addRow([
        "Transaction Number",
        "Booking Number",
        "Transaction Type",
        "Customer",
        "Customer Email",
        "Payment Method",
        "Status",
        "Amount (INR)",
        "Booking Fee (INR)",
        "Refund (INR)",
        "Currency",
        "Transaction Date",
      ]);

      styleHeader(transactionSheet.getRow(4));

      for (const item of allTransactions) {
        const paidRecord = isPaid(item) && !isRefund(item);

        transactionSheet.addRow([
          item.transaction_number || item.id,
          item.booking_number || item.booking_id || "",
          item.transaction_type || "payment",
          item.customer_name || "",
          item.customer_email || "",
          item.payment_method || "",
          item.status || "",
          money(item.amount),
          paidRecord ? BOOKING_CHARGE : 0,
          isRefund(item)
            ? money(item.refund_amount || item.amount)
            : 0,
          item.currency || "INR",
          transactionDate(item),
        ]);
      }

      transactionSheet.columns = [
        { width: 25 },
        { width: 24 },
        { width: 19 },
        { width: 25 },
        { width: 32 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 22 },
        { width: 18 },
        { width: 12 },
        { width: 19 },
      ];

      for (let r = 5; r <= transactionSheet.rowCount; r++) {
        for (const c of [8, 9, 10]) {
          transactionSheet.getCell(r, c).numFmt = '"₹"#,##0.00';
        }
      }

      styleBody(transactionSheet);
      transactionSheet.autoFilter = {
        from: "A4",
        to: "L4",
      };

      // Daily, monthly and yearly reports
      addPeriodSheet(
        workbook,
        "Daily Report",
        "Daily Finance Report",
        subtitle,
        createPeriodRows(allTransactions, "daily")
      );

      addPeriodSheet(
        workbook,
        "Monthly Report",
        "Monthly Finance Report",
        subtitle,
        createPeriodRows(allTransactions, "monthly")
      );

      addPeriodSheet(
        workbook,
        "Yearly Report",
        "Yearly Finance Report",
        subtitle,
        createPeriodRows(allTransactions, "yearly")
      );

      // Export workbook
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const periodLabel =
        reportType === "daily"
          ? dailyDate
          : reportType === "monthly"
            ? month
            : reportType === "yearly"
              ? year
              : `${start}_to_${end}`;

      link.href = url;
      link.download = `WORISH_ECOSYSTEM_FINANCE_${periodLabel}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to export finance report."
      );
    } finally {
      setExporting(false);
    }
  };

  return (

<section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
  {/* Header */}
  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <FileSpreadsheet size={20} />
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold tracking-tight text-slate-900">
          Finance Reports
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          WORISH ECOSYSTEM PRIVATE LIMITED
        </p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
        Excel Workbook
      </span>
      <span>
        {transactions.length} displayed
      </span>
    </div>
  </div>

  {/* Report Controls */}
  <div className="space-y-3 p-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Report Period
        </p>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:inline-grid sm:grid-cols-4">
          {[
            { label: "Daily", value: "daily" },
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
            { label: "Custom", value: "custom" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setReportType(option.value as ReportType)}
              aria-pressed={reportType === option.value}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                reportType === option.value
                  ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[360px]">
        {reportType === "daily" && (
          <label className="text-xs font-medium text-slate-600">
            Report date
            <input
              type="date"
              value={dailyDate}
              onChange={(event) => setDailyDate(event.target.value)}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        )}

        {reportType === "monthly" && (
          <label className="text-xs font-medium text-slate-600">
            Report month
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        )}

        {reportType === "yearly" && (
          <label className="text-xs font-medium text-slate-600">
            Report year
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {Array.from(
                { length: 10 },
                (_, index) => new Date().getFullYear() - index
              ).map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}

        {reportType === "custom" && (
          <>
            <label className="text-xs font-medium text-slate-600">
              From date
              <input
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => setCustomStart(event.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="text-xs font-medium text-slate-600">
              To date
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={
          loading ||
          disabled ||
          exporting ||
          (reportType === "custom" &&
            (!customStart || !customEnd || customStart > customEnd))
        }
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 xl:min-w-[190px]"
      >
        {exporting ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {exporting ? "Generating..." : "Export Excel"}
      </button>
    </div>

    {exportError && (
      <p
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
      >
        {exportError}
      </p>
    )}

    {/* Workbook details */}
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <FileSpreadsheet size={13} className="text-emerald-700" />
        Summary &amp; transaction ledger
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays size={13} />
        Daily, monthly &amp; yearly breakdown
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Download size={13} />
        INR formatted Excel
      </span>
    </div>
  </div>
</section>
  );
}
