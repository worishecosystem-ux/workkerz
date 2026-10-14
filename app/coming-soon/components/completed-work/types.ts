
export interface CompletedBooking {
  id: string;
  booking_id: string;
  worker_request_id: string | null;
  service_type: string | null;
  description: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  customer_name: string | null;
  booking_date: string | null;
  booking_time: string | null;
  created_at: string | null;
}

export interface CompletedRequest {
  id: string;
  workers_required: number | null;
  location: string | null;
  category: string | null;
  work_date: string | null;
  start_time: string | null;
  duration: string | null;
  budget: number | null;
  requirement: string | null;
  status: string | null;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  project_name: string | null;
  project_type: string | null;
  total_workers: number | null;
  is_deleted: boolean | null;
  created_at: string | null;
  worker_name: string | null;
}

export interface CompletedWorkImage {
  id: string;
  booking_id: string | null;
  worker_request_id: string | null;
  image_url: string;
  created_at: string | null;
}

export interface GalleryImageItem {
  id: string;
  image_url: string;
  created_at: string | null;
}

export interface GalleryWork {
  id: string;
  booking_id: string | null;
  worker_request_id: string | null;
  work_name: string;
  images: GalleryImageItem[];
  worker_name: string;
  worker_photo: string | null;
  customer_name: string;
  completed_date: string | null;
  completed_time: string | null;
  description: string | null;
  source: "booking" | "request";
}
