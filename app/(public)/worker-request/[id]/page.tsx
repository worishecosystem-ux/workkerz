"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { WorkerRequest } from "./components/types";

import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import RequestHeader from "./components/RequestHeader";
import RequestOverview from "./components/RequestOverview";
import RequestSchedule from "./components/RequestSchedule";
import RequestLocation from "./components/RequestLocation";
import RequestBudget from "./components/RequestBudget";
import RequestRequirement from "./components/RequestRequirement";
import ProjectDetails from "./components/ProjectDetails";
import RequesterDetails from "./components/RequesterDetails";
import CompanyDetails from "./components/CompanyDetails";
import RequestMeta from "./components/RequestMeta";
import CancellationPanel from "./components/CancellationPanel";

export default function WorkerRequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const requestId = params.id;

  const [request, setRequest] = useState<WorkerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequest = useCallback(async () => {
    if (!requestId) {
      setError("Invalid work request ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("worker_requests")
        .select("*")
        .eq("id", requestId)
        .eq("is_deleted", false)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          throw new Error(
            "This work request was not found or is no longer available.",
          );
        }

        throw new Error(fetchError.message);
      }

      if (!data) {
        throw new Error("Work request details could not be found.");
      }

      setRequest(data as WorkerRequest);
    } catch (err) {
      setRequest(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load work request details.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void fetchRequest();
  }, [fetchRequest]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !request) {
    return (
      <ErrorState
        message={error || "Work request not found."}
        onRetry={fetchRequest}
        onBack={handleBack}
      />
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-clip bg-green-50/70 text-gray-900 sm:px-5 sm:py-5"
      style={{
        paddingTop: "0px",
        paddingBottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Main Green Theme */}
      <div className="mx-auto min-h-screen w-full max-w-5xl overflow-hidden bg-white sm:min-h-0 sm:rounded-2xl sm:border sm:border-green-100 sm:shadow-sm">
        {/* Main Header */}
        <div className="bg-green-700 text-white">
          <RequestHeader
            requestId={request.id}
            status={request.status}
            onBack={handleBack}
          />
        </div>

        {/* Main Content Screen */}
        <section className="min-w-0 bg-green-50/40 px-3 py-3 sm:px-5 sm:py-5">
          <div className="space-y-3 sm:space-y-4">
            <RequestOverview request={request} />

            <RequestSchedule request={request} />

            <RequestLocation request={request} />

            <RequestBudget request={request} />

            <RequestRequirement request={request} />

            <ProjectDetails request={request} />

            <RequesterDetails request={request} />

            {(request.company_name?.trim() || request.gstin?.trim()) && (
              <CompanyDetails request={request} />
            )}

            <RequestMeta request={request} />

            <CancellationPanel
              request={request}
              onUpdated={(updatedRequest) => {
                setRequest((previous) =>
                  previous ? { ...previous, ...updatedRequest } : previous,
                );
              }}
            />
          </div>

          {/* Desktop Back Button */}
          <div className="hidden pt-5 sm:block">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 text-sm font-semibold text-green-800 transition hover:bg-green-50"
            >
              <ArrowLeft size={16} />
              Back to Work Requests
            </button>
          </div>
        </section>
      </div>

      {/* Android Bottom Action */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white/95 px-4 pt-3 backdrop-blur-md sm:hidden"
        style={{
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] active:bg-green-800"
        >
          <ArrowLeft size={18} />
          Back to Work Requests
        </button>
      </div>
    </main>
  );
}
