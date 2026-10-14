
"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import type { FinanceChartItem } from "./finance.types";
import { formatCurrency } from "./finance.utils";

interface EarningsGrowthItem extends FinanceChartItem {
  successfulBookings?: number;
}

interface FinanceEarningsChartProps {
  data?: EarningsGrowthItem[];
  loading?: boolean;
}

export default function FinanceEarningsChart({
  data = [],
  loading = false,
}: FinanceEarningsChartProps) {
  const chartData: EarningsGrowthItem[] = data.map((item) => ({
    ...item,
   collection: Number(item.collection ?? 0),
    earnings: Number(item.earnings ?? 0),
    refunds: Number(item.refunds ?? 0),
    dateLabel: formatChartDate(item.date),
  }));

  const currentEarnings =
    chartData[chartData.length - 1]?.earnings ?? 0;

  const previousEarnings =
    chartData[chartData.length - 2]?.earnings ?? 0;

  const growth =
    previousEarnings > 0
      ? ((currentEarnings - previousEarnings) /
          previousEarnings) *
        100
      : null;

  const totalCollection = chartData.reduce(
    (total, item) => total + item.collection,
    0
  );

  const totalEarnings = chartData.reduce(
    (total, item) => total + item.earnings,
    0
  );

  const totalRefunds = chartData.reduce(
    (total, item) => total + Number(item.refunds ?? 0),
    0
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp
              size={19}
              className="text-emerald-700"
            />

            <h2 className="text-base font-bold text-gray-900">
              Earnings Growth
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Successful payment collection and ₹49 booking charges
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2">
          <p className="text-xs font-medium text-emerald-700">
            Daily Earnings Growth
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-800">
            {growth === null
              ? "—"
              : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`}
          </p>
        </div>
      </div>

      {!loading && chartData.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Collection (7 days)
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatCurrency(totalCollection)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Booking Charges (7 days)
            </p>

            <p className="mt-1 text-lg font-bold text-blue-700">
              {formatCurrency(totalEarnings)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Refunds (7 days)
            </p>

            <p className="mt-1 text-lg font-bold text-red-600">
              {formatCurrency(totalRefunds)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-[320px] animate-pulse rounded-xl bg-gray-50" />
      ) : chartData.length === 0 ? (
        <div className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
          <TrendingUp
            size={30}
            className="text-gray-300"
          />

          <p className="mt-3 text-sm font-semibold text-gray-700">
            No earnings data available
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Successful payment data will appear here.
          </p>
        </div>
      ) : (
        <div className="h-[320px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 12,
                left: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="dateLabel"
                tick={{
                  fontSize: 11,
                  fill: "#6B7280",
                }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />

              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={{
                  fontSize: 11,
                  fill: "#6B7280",
                }}
                axisLine={false}
                tickLine={false}
                width={72}
              />

              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  String(name),
                ]}
                labelStyle={{
                  color: "#111827",
                  fontWeight: 600,
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 16,
                }}
              />

              <Line
                type="monotone"
                dataKey="collection"
                name="Successful Collection"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="earnings"
                name="₹49 Booking Charges"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="refunds"
                name="Refunds"
                stroke="#DC2626"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function formatChartDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
