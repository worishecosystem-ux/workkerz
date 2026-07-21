"use client";
import ReportsFilters from "./components/ReportsFilters";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ReportsHeader from "./components/ReportsHeader";
import type { Report } from "./components/types";
import ReportsTable from "./components/ReportsTable";
import ReportsStats from "./components/ReportsStats";
import ReportDrawer from "./components/ReportDrawer";
import ReportsSkeleton from "./components/ReportsSkeleton";
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const [refreshing, setRefreshing] = useState(false);

  const [priorityFilter, setPriorityFilter] = useState("All");
  useEffect(() => {
  void fetchReports();
}, []);

  async function updatePriority(id: string, priority: string) {
  const { error } = await supabase
    .from("reports")
    .update({
      priority,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setReports((prev) =>
    prev.map((r) =>
      r.id === id ? { ...r, priority } : r
    )
  );

  setSelectedReport((prev) =>
    prev && prev.id === id
      ? { ...prev, priority }
      : prev
  );
}
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    setSelectedReport((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    );
  }

  async function fetchReports(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data ?? []);

      if (selectedReport) {
        const updated = data?.find((r) => r.id === selectedReport.id);

        if (updated) {
          setSelectedReport(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const total = reports.length;

  const pending = reports.filter((r) => r.status === "Pending").length;

  const progress = reports.filter((r) => r.status === "In Progress").length;

  const resolved = reports.filter((r) => r.status === "Resolved").length;

  const high = reports.filter((r) => r.priority === "High").length;
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.subject.toLowerCase().includes(search.toLowerCase()) ||
      (report.report_number || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      report.issue_type.toLowerCase().includes(search.toLowerCase()) ||
      (report.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });
  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <ReportsHeader total={reports.length} onRefresh={fetchReports} />
      <ReportsStats
        total={total}
        pending={pending}
        progress={progress}
        resolved={resolved}
        high={high}
      />

      <ReportsFilters
        search={search}
        setSearch={setSearch}
        status={statusFilter}
        setStatus={setStatusFilter}
        priority={priorityFilter}
        setPriority={setPriorityFilter}
        onRefresh={fetchReports}
      />
      <ReportsTable
        reports={filteredReports}
        onStatusChange={updateStatus}
        onView={setSelectedReport}
      />
      <ReportDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onPriorityChange={updatePriority}
        onStatusChange={updateStatus}
      />
    </div>
  );
}
