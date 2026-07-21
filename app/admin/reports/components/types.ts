export type ReportStatus = "Pending" | "In Progress" | "Resolved" | "Rejected";

export type ReportPriority = "High" | "Medium" | "Low";

export interface Report {
  id: string;
  report_number: string | null;
  issue_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  email: string | null;
  phone: string | null;
  booking_id: string | null;
  screenshot: string | null;
  created_at: string;
}
