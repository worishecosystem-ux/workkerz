
export interface WorkerRequest {
  id: string;

  // Work details
  workers_required: number;
  total_workers: number;
  category: string;
  requirement?: string | null;
  requirements?: unknown;
  status: string;
  source?: string | null;

  // Schedule
  work_date: string;
  start_time?: string | null;
  duration?: string | null;

  // Budget
  budget?: number | null;

  // Location
  location: string;
  full_address?: string | null;
  locality?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;

  // Requester details
  requester_type?: string | null;
  requester_name?: string | null;
  requester_mobile?: string | null;
  requester_email?: string | null;
  requester_user_id?: string | null;
  requester_address?: string | null;

  // Company details
  company_name?: string | null;
  gstin?: string | null;

  // Project details
  project_name?: string | null;
  project_type?: string | null;

  // Creation details
  created_at: string;

  // Soft deletion
  is_deleted: boolean;
  deleted_at?: string | null;
  delete_reason?: string | null;
  deletion_reason?: string | null;

  // Cancellation request
  cancellation_status?: string | null;
  cancellation_reason?: string | null;
  cancellation_details?: string | null;
  cancellation_requested_at?: string | null;
  cancellation_reviewed_at?: string | null;
  cancellation_reviewed_by?: string | null;
}
