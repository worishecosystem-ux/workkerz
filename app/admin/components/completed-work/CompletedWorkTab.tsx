import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Image as ImageIcon,
  RefreshCw,
  UserRound,
  CalendarDays,
  MapPin,
  X,
  Upload,
  Trash2,
  Loader2,
  Eye,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type CompletedWork = {
  id: string;
  source_type: "booking" | "request";
  booking_id: string;
  booking_status: string | null;

  worker_id: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  worker_specialty: string | null;

  service_type: string | null;
  description: string | null;

  booking_date: string | null;
  booking_time: string | null;

  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;

  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  full_address: string | null;

  category: string | null;
  budget: number | null;

  created_at: string | null;

  request_id: string | null;
  workers_required: number | null;
  duration: string | null;
  requester_type: string | null;
  company_name: string | null;
  project_name: string | null;
  project_type: string | null;
  requirements: unknown;
};

type CompletedWorkImage = {
  id: string;
  booking_id: string | null;
  worker_request_id: string | null;
  image_url: string;
  created_at: string | null;
};

type WorkerRequestRow = {
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
  source: string | null;
  created_at: string | null;
  full_address: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  requester_type: string | null;
  requester_name: string | null;
  requester_mobile: string | null;
  requester_email: string | null;
  company_name: string | null;
  requester_address: string | null;
  project_name: string | null;
  project_type: string | null;
  requirements: unknown;
  total_workers: number | null;
  is_deleted: boolean;
  worker_name: string | null;
};

type BookingRow = {
  id: string;
  booking_id: string;
  booking_status: string | null;
  worker_id: string | null;
  worker_name: string | null;
  worker_photo: string | null;
  worker_specialty: string | null;
  worker_rating: number | null;
  service_type: string | null;
  description: string | null;
  booking_date: string | null;
  booking_time: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  total_cost: number | null;
  service_fee: number | null;
  materials_cost: number | null;
  grand_total: number | null;
  created_at: string | null;
  work_status: string | null;
  worker_available: boolean | null;
  booking_type: string | null;
  package_price: number | null;
  house_no: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  address_type: string | null;
  worker_request_id: string | null;
};

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "avif",
  "heic",
  "heif",
];

const formatDate = (date: string | null) => {
  if (!date) return "Completed";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLocation = (item: CompletedWork) => {
  return [item.full_address, item.city, item.district, item.state]
    .filter(Boolean)
    .join(", ");
};

const getRequestCategories = (requirements: unknown) => {
  if (!Array.isArray(requirements)) {
    return "";
  }

  return requirements
    .map((item) => {
      if (item && typeof item === "object" && "category" in item) {
        return String((item as { category?: unknown }).category || "");
      }

      return "";
    })
    .filter(Boolean)
    .join(", ");
};

const isImageFile = (file: File) => {
  const type = String(file.type || "").toLowerCase();

  if (type.startsWith("image/")) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  return Boolean(extension && IMAGE_EXTENSIONS.includes(extension));
};

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && IMAGE_EXTENSIONS.includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";

  return "jpg";
};

export default function CompletedWorkTab() {
  const [items, setItems] = useState<CompletedWork[]>([]);
  const [workImages, setWorkImages] = useState<
    Record<string, CompletedWorkImage[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CompletedWork | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const uploadBookingRef = useRef<CompletedWork | null>(null);

  /* =========================================================
     LOAD COMPLETED BOOKINGS + COMPLETED REQUESTS
  ========================================================= */

  const loadCompletedWorks = useCallback(async () => {
    try {
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Admin session expired.");
      }

      /* =====================================================
         1. COMPLETED BOOKINGS
      ===================================================== */

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_id,
          booking_status,
          worker_id,
          worker_name,
          worker_photo,
          worker_specialty,
          worker_rating,
          service_type,
          description,
          booking_date,
          booking_time,
          customer_name,
          customer_phone,
          customer_email,
          notes,
          total_cost,
          service_fee,
          materials_cost,
          grand_total,
          created_at,
          work_status,
          worker_available,
          booking_type,
          package_price,
          house_no,
          address,
          landmark,
          city,
          district,
          state,
          country,
          pincode,
          address_type,
          worker_request_id
        `,
        )
        .eq("booking_status", "completed")
        .order("booking_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (bookingError) {
        console.error("[CompletedWork] Booking fetch error:", bookingError);

        throw new Error(
          bookingError.message || "Unable to load completed bookings.",
        );
      }

      const bookings = (bookingData || []) as BookingRow[];

      /* =====================================================
         2. COMPLETED WORK REQUESTS
         
         IMPORTANT:
         status = completed
         is_deleted = false
      ===================================================== */

      const { data: requestData, error: requestError } = await supabase
        .from("worker_requests")
        .select(
          `
          id,
          workers_required,
          location,
          category,
          work_date,
          start_time,
          duration,
          budget,
          requirement,
          status,
          source,
          created_at,
          full_address,
          locality,
          district,
          state,
          pincode,
          requester_type,
          requester_name,
          requester_mobile,
          requester_email,
          company_name,
          requester_address,
          project_name,
          project_type,
          requirements,
          total_workers,
          is_deleted,
          worker_name
        `,
        )
        .eq("status", "completed")
        .eq("is_deleted", false)
        .order("work_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (requestError) {
        console.error("[CompletedWork] Request fetch error:", requestError);

        throw new Error(
          requestError.message || "Unable to load completed work requests.",
        );
      }

      const requests = (requestData || []) as WorkerRequestRow[];

      console.log("[CompletedWork] Completed bookings:", bookings.length);

      console.log(
        "[CompletedWork] Completed requests:",
        requests.length,
        requests,
      );

      /* =====================================================
         3. NORMALIZE BOOKINGS
      ===================================================== */

      const normalizedBookings: CompletedWork[] = bookings.map((booking) => ({
        id: booking.id,
        source_type: "booking",

        booking_id: booking.booking_id,
        booking_status: booking.booking_status,

        worker_id: booking.worker_id,
        worker_name: booking.worker_name,
        worker_photo: booking.worker_photo,
        worker_specialty: booking.worker_specialty,

        service_type: booking.service_type,
        description: booking.description,

        booking_date: booking.booking_date,
        booking_time: booking.booking_time,

        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email,

        city: booking.city,
        district: booking.district,
        state: booking.state,
        pincode: booking.pincode,

        full_address: [booking.house_no, booking.address, booking.landmark]
          .filter(Boolean)
          .join(", "),

        category: booking.service_type,
        budget: booking.grand_total,

        created_at: booking.created_at,

        request_id: booking.worker_request_id,

        workers_required: null,
        duration: null,

        requester_type: null,
        company_name: null,

        project_name: null,
        project_type: null,

        requirements: null,
      }));

      /* =====================================================
         4. NORMALIZE COMPLETED REQUESTS
      ===================================================== */

      const normalizedRequests: CompletedWork[] = requests.map((request) => {
        const categories = getRequestCategories(request.requirements);

        return {
          id: `request-${request.id}`,
          source_type: "request",

          /*
           * worker_requests does not have booking_id.
           * Use request id as stable display/reference id.
           */
          booking_id: `REQ-${request.id.slice(0, 8).toUpperCase()}`,

          booking_status: request.status,

          worker_id: null,
          worker_name: request.worker_name || null,

          worker_photo: null,

          worker_specialty: categories || request.category || "Worker Request",

          service_type:
            request.project_name ||
            request.project_type ||
            categories ||
            request.category ||
            "Work Request",

          description: request.requirement || null,

          booking_date: request.work_date,

          booking_time: request.start_time,

          customer_name: request.requester_name,

          customer_phone: request.requester_mobile,

          customer_email: request.requester_email,

          city: request.location || request.locality || null,

          district: request.district,

          state: request.state,

          pincode: request.pincode,

          full_address:
            request.full_address || request.requester_address || null,

          category: request.category,

          budget: request.budget,

          created_at: request.created_at,

          request_id: request.id,

          workers_required: request.workers_required,

          duration: request.duration,

          requester_type: request.requester_type,

          company_name: request.company_name,

          project_name: request.project_name,

          project_type: request.project_type,

          requirements: request.requirements,
        };
      });

      /* =====================================================
         5. MERGE BOTH
         
         If a request also has a completed booking,
         don't show the request twice.
         
         Booking gets priority because it contains
         actual worker information.
      ===================================================== */

      const completedRequestIds = new Set(
        normalizedBookings.map((booking) => booking.request_id).filter(Boolean),
      );

      const filteredRequests = normalizedRequests.filter(
        (request) => !completedRequestIds.has(request.request_id),
      );

      const merged = [...normalizedBookings, ...filteredRequests];

      /* =====================================================
         6. SORT NEWEST / LATEST COMPLETED WORK FIRST
      ===================================================== */

      merged.sort((a, b) => {
        const dateA = new Date(a.booking_date || a.created_at || 0).getTime();

        const dateB = new Date(b.booking_date || b.created_at || 0).getTime();

        return dateB - dateA;
      });

      setItems(merged);

      /* =====================================================
   7. FETCH COMPLETED WORK IMAGES
   Supports BOTH:
   - booking_id
   - worker_request_id
===================================================== */

      const bookingIds = merged
        .map((item) => item.booking_id)
        .filter(
          (value): value is string =>
            Boolean(value) && !value.startsWith("REQ-"),
        );

      const requestIdsForImages = merged
        .map((item) => item.request_id)
        .filter((value): value is string => Boolean(value));

      console.log("[CompletedWork] Image lookup:", {
        bookingIds,
        requestIdsForImages,
      });

      if (bookingIds.length === 0 && requestIdsForImages.length === 0) {
        setWorkImages({});
        return;
      }

      /*
       * Fetch images by booking_id OR worker_request_id.
       *
       * Important:
       * Work Request images are stored with:
       *   booking_id = null
       *   worker_request_id = request.id
       *
       * Normal Booking images are stored with:
       *   booking_id = booking.booking_id
       *   worker_request_id = null
       */

      let imageRows: CompletedWorkImage[] = [];

      /* -----------------------------
   BOOKING IMAGES
----------------------------- */

      if (bookingIds.length > 0) {
        const { data: bookingImages, error: bookingImagesError } =
          await supabase
            .from("completed_work_images")
            .select("id, booking_id, worker_request_id, image_url, created_at")
            .in("booking_id", bookingIds)
            .order("created_at", {
              ascending: false,
            });

        if (bookingImagesError) {
          console.error(
            "[CompletedWork] Booking images load error:",
            bookingImagesError,
          );
        } else {
          imageRows.push(...((bookingImages || []) as CompletedWorkImage[]));
        }
      }

      /* -----------------------------
   WORK REQUEST IMAGES
----------------------------- */

      if (requestIdsForImages.length > 0) {
        const { data: requestImages, error: requestImagesError } =
          await supabase
            .from("completed_work_images")
            .select("id, booking_id, worker_request_id, image_url, created_at")
            .in("worker_request_id", requestIdsForImages)
            .order("created_at", {
              ascending: false,
            });

        if (requestImagesError) {
          console.error(
            "[CompletedWork] Request images load error:",
            requestImagesError,
          );
        } else {
          imageRows.push(...((requestImages || []) as CompletedWorkImage[]));
        }
      }

      /* -----------------------------
   BUILD IMAGE MAP
----------------------------- */

      const imageMap: Record<string, CompletedWorkImage[]> = {};

      imageRows.forEach((image) => {
        /*
         * Normal booking image
         */
        if (image.booking_id) {
          if (!imageMap[image.booking_id]) {
            imageMap[image.booking_id] = [];
          }

          imageMap[image.booking_id].push(image);
        }

        /*
         * Work request image
         */
        if (image.worker_request_id) {
          const requestKey = `request-${image.worker_request_id}`;

          if (!imageMap[requestKey]) {
            imageMap[requestKey] = [];
          }

          imageMap[requestKey].push(image);
        }
      });

      console.log("[CompletedWork] Final image map:", imageMap);

      setWorkImages(imageMap);
    } catch (error) {
      console.error("[CompletedWork] Load error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load completed work.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    void loadCompletedWorks();
  }, [loadCompletedWorks]);

  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {
    const channel = supabase
      .channel("completed-work-live")

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const booking = payload.new as Partial<BookingRow>;

          if (
            String(booking.booking_status || "").toLowerCase() === "completed"
          ) {
            void loadCompletedWorks();
          }
        },
      )

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const booking = payload.new as Partial<BookingRow>;

          if (
            String(booking.booking_status || "").toLowerCase() === "completed"
          ) {
            void loadCompletedWorks();
          }
        },
      )

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "worker_requests",
        },
        (payload) => {
          const request = payload.new as Partial<WorkerRequestRow>;

          if (
            String(request.status || "").toLowerCase() === "completed" &&
            request.is_deleted === false
          ) {
            void loadCompletedWorks();
          }
        },
      )

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "worker_requests",
        },
        (payload) => {
          const request = payload.new as Partial<WorkerRequestRow>;

          if (
            String(request.status || "").toLowerCase() === "completed" &&
            request.is_deleted === false
          ) {
            void loadCompletedWorks();
          }
        },
      )

      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadCompletedWorks]);

  /* =========================================================
     OPEN UPLOAD
  ========================================================= */

  const openUpload = (booking: CompletedWork) => {
    if (uploading) return;

    uploadBookingRef.current = booking;

    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
      uploadInputRef.current.click();
    }
  };

  /* =========================================================
     UPLOAD WORK IMAGES
  ========================================================= */

  const uploadWorkImages = async (
    booking: CompletedWork,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Admin session expired. Please login again.");
      }

      const selectedFiles = Array.from(files);

      const validFiles = selectedFiles.filter(
        (file) => isImageFile(file) && file.size > 0,
      );

      if (validFiles.length === 0) {
        throw new Error("Please select a valid image file.");
      }

      /* ============================================================
       DETERMINE OWNER
    ============================================================ */

      const isBooking = booking.source_type === "booking";

      const bookingId: string | null = isBooking
        ? booking.booking_id || null
        : null;

      const workerRequestId: string | null = !isBooking
        ? booking.request_id || null
        : null;

      /* ============================================================
       VERIFY PARENT
    ============================================================ */

      if (isBooking) {
        if (!bookingId) {
          throw new Error(
            "This completed booking does not have a valid booking ID.",
          );
        }

        const { data: verifiedBooking, error: verifyBookingError } =
          await supabase
            .from("bookings")
            .select("booking_id")
            .eq("booking_id", bookingId)
            .maybeSingle();

        if (verifyBookingError) {
          console.error(
            "[CompletedWork] Booking verification error:",
            verifyBookingError,
          );

          throw new Error(
            verifyBookingError.message || "Unable to verify booking.",
          );
        }

        if (!verifiedBooking?.booking_id) {
          throw new Error(
            `Booking "${bookingId}" was not found in bookings table.`,
          );
        }
      } else {
        if (!workerRequestId) {
          throw new Error(
            "This work request does not have a valid worker request ID.",
          );
        }

        const { data: verifiedRequest, error: verifyRequestError } =
          await supabase
            .from("worker_requests")
            .select("id")
            .eq("id", workerRequestId)
            .maybeSingle();

        if (verifyRequestError) {
          console.error(
            "[CompletedWork] Work request verification error:",
            verifyRequestError,
          );

          throw new Error(
            verifyRequestError.message || "Unable to verify work request.",
          );
        }

        if (!verifiedRequest?.id) {
          throw new Error(
            `Work request "${workerRequestId}" was not found in worker_requests table.`,
          );
        }
      }

      let uploadedCount = 0;

      /* ============================================================
       UPLOAD FILES
    ============================================================ */

      for (const file of validFiles) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 10MB.`);
        }

        const extension = getFileExtension(file);

        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const ownerFolder = isBooking
          ? `booking/${bookingId}`
          : `request/${workerRequestId}`;

        const filePath = `${ownerFolder}/${fileName}`;

        const contentType =
          file.type && file.type.startsWith("image/")
            ? file.type
            : `image/${extension === "jpg" ? "jpeg" : extension}`;

        /* ==========================================================
         STORAGE UPLOAD
      ========================================================== */

        const { error: uploadError } = await supabase.storage
          .from("completed-work")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType,
          });

        if (uploadError) {
          console.error("[CompletedWork] Storage upload error:", uploadError);

          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        /* ==========================================================
         PUBLIC URL
      ========================================================== */

        const { data: publicUrlData } = supabase.storage
          .from("completed-work")
          .getPublicUrl(filePath);

        const imageUrl = publicUrlData?.publicUrl || null;

        if (!imageUrl) {
          await supabase.storage.from("completed-work").remove([filePath]);

          throw new Error("Unable to generate image URL.");
        }

        /* ==========================================================
         DATABASE INSERT
      ========================================================== */

        const insertPayload: {
          booking_id: string | null;
          worker_request_id: string | null;
          image_url: string;
        } = {
          booking_id: bookingId,
          worker_request_id: workerRequestId,
          image_url: imageUrl,
        };

        console.log("[CompletedWork] Saving image:", insertPayload);

        const { data: insertedImage, error: insertError } = await supabase
          .from("completed_work_images")
          .insert(insertPayload)
          .select("id, booking_id, worker_request_id, image_url, created_at")
          .single();

        if (insertError) {
          console.error("[CompletedWork] Database insert error:", insertError);

          await supabase.storage.from("completed-work").remove([filePath]);

          throw new Error(`Database save failed: ${insertError.message}`);
        }

        console.log("[CompletedWork] Image saved successfully:", insertedImage);

        uploadedCount += 1;
      }

      /* ============================================================
       SUCCESS
    ============================================================ */

      if (uploadedCount === 0) {
        throw new Error("No valid images were uploaded.");
      }

      await loadCompletedWorks();
    } catch (error) {
      console.error("[CompletedWork] Upload error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload work images.",
      );
    } finally {
      setUploading(false);
    }
  };
  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const booking = uploadBookingRef.current;

    const files = event.target.files;

    if (!booking) {
      event.currentTarget.value = "";
      return;
    }

    const selectedFiles = files ? Array.from(files) : [];

    let fileList: FileList | null = null;

    if (selectedFiles.length > 0) {
      const dataTransfer = new DataTransfer();

      selectedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });

      fileList = dataTransfer.files;
    }

    event.currentTarget.value = "";

    uploadBookingRef.current = null;

    if (!fileList || fileList.length === 0) {
      return;
    }

    void uploadWorkImages(booking, fileList);
  };

  /* =========================================================
     DELETE IMAGE
  ========================================================= */

  const deleteWorkImage = async (image: CompletedWorkImage) => {
    try {
      setDeleting(image.id);
      setError("");

      const marker = "/completed-work/";

      const index = image.image_url.indexOf(marker);

      if (index !== -1) {
        const filePath = decodeURIComponent(
          image.image_url.substring(index + marker.length),
        );

        await supabase.storage.from("completed-work").remove([filePath]);
      }

      const { error: deleteError } = await supabase
        .from("completed_work_images")
        .delete()
        .eq("id", image.id);

      if (deleteError) {
        throw new Error(deleteError.message || "Unable to delete image.");
      }

      if (previewImage === image.image_url) {
        setPreviewImage(null);
      }

      await loadCompletedWorks();
    } catch (error) {
      console.error("[CompletedWork] Delete error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to delete image.",
      );
    } finally {
      setDeleting(null);
    }
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const refresh = async () => {
    setRefreshing(true);
    await loadCompletedWorks();
  };

  /* =========================================================
     GET IMAGES
  ========================================================= */

  const getImages = (item: CompletedWork): CompletedWorkImage[] => {
    /*
     * Work Request
     */
    if (item.source_type === "request" && item.request_id) {
      return workImages[`request-${item.request_id}`] || [];
    }

    /*
     * Normal Booking
     */
    if (item.booking_id) {
      return workImages[item.booking_id] || [];
    }

    return [];
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-200" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="h-10 animate-pulse bg-gray-100" />

          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="flex h-16 animate-pulse items-center gap-3 border-t border-gray-100 px-3"
            >
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="h-3 w-28 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5 lg:p-6">
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#FF5C39]" />

            <h1 className="truncate text-lg font-black text-[#0F172A] sm:text-xl">
              Completed Work
            </h1>

            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-black text-[#FF5C39]">
              {items.length}
            </span>
          </div>

          <p className="mt-0.5 text-[11px] text-[#64748B]">
            Completed bookings and work requests.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-black text-[#334155] shadow-sm transition hover:border-[#FF5C39] hover:text-[#FF5C39] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />

          <span className="hidden sm:inline">Refresh</span>
        </button>

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.heic,.heif"
          multiple
          disabled={uploading}
          className="hidden"
          onChange={handleUploadChange}
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-[10px] font-bold text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* EMPTY */}

      {items.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
            <CheckCircle2 className="h-6 w-6 text-[#FF5C39]" />
          </div>

          <h2 className="mt-3 text-sm font-black text-[#0F172A]">
            No completed work found
          </h2>

          <p className="mt-1 text-xs text-[#64748B]">
            Completed bookings and completed work requests will appear here.
          </p>
        </div>
      )}

      {/* TABLE */}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8FAFC] text-left">
                  <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Work
                  </th>

                  <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Customer
                  </th>

                  <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Date
                  </th>

                  <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Location
                  </th>

                  <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Photos
                  </th>

                  <th className="px-3 py-2.5 text-right text-[9px] font-black uppercase tracking-wider text-[#94A3B8]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const images = getImages(item);

                  const isRequest = item.source_type === "request";

                  return (
                    <tr
                      key={`${item.source_type}-${item.id}`}
                      className="group border-b border-gray-100 last:border-0 hover:bg-[#FFF9F7]"
                    >
                      {/* WORK */}

                      <td className="px-3 py-2">
                        <div className="flex min-w-[230px] items-center gap-2.5">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {item.worker_photo ? (
                              <img
                                src={item.worker_photo}
                                alt={item.worker_name || "Worker"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                {isRequest ? (
                                  <ClipboardList className="h-4 w-4 text-gray-300" />
                                ) : (
                                  <UserRound className="h-4 w-4 text-gray-300" />
                                )}
                              </div>
                            )}

                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-[11px] font-black text-[#0F172A]">
                                {item.service_type || "Completed Work"}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase ${
                                  isRequest
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-orange-50 text-[#FF5C39]"
                                }`}
                              >
                                {isRequest ? "Request" : "Booking"}
                              </span>
                            </div>

                            <p className="mt-0.5 max-w-[190px] truncate text-[9px] text-[#94A3B8]">
                              {item.worker_name ||
                                item.category ||
                                item.description ||
                                "Work completed"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td className="px-3 py-2">
                        <div className="min-w-[140px]">
                          <p className="truncate text-[11px] font-bold text-[#334155]">
                            {item.company_name ||
                              item.customer_name ||
                              "Customer"}
                          </p>

                          <p className="mt-0.5 truncate text-[9px] text-[#94A3B8]">
                            {item.requester_type ||
                              (isRequest ? "Work Request" : "Direct Booking")}
                          </p>
                        </div>
                      </td>

                      {/* DATE */}

                      <td className="px-3 py-2">
                        <div className="flex min-w-[105px] items-center gap-1.5">
                          <CalendarDays className="h-3 w-3 shrink-0 text-[#FF5C39]" />

                          <div>
                            <p className="text-[10px] font-bold text-[#334155]">
                              {formatDate(item.booking_date)}
                            </p>

                            {item.booking_time && (
                              <p className="mt-0.5 text-[8px] text-[#94A3B8]">
                                {item.booking_time}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* LOCATION */}

                      <td className="px-3 py-2">
                        {getLocation(item) ? (
                          <div className="flex max-w-[180px] items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-[#94A3B8]" />

                            <span className="truncate text-[9px] text-[#64748B]">
                              {getLocation(item)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-[#CBD5E1]">—</span>
                        )}
                      </td>

                      {/* PHOTOS */}

                      <td className="px-3 py-2">
                        <div className="flex min-w-[150px] items-center gap-1">
                          {images.slice(0, 3).map((image) => (
                            <div
                              key={image.id}
                              className="group/image relative h-8 w-8 overflow-hidden rounded-md border border-gray-100 bg-gray-100"
                            >
                              <button
                                type="button"
                                onClick={() => setPreviewImage(image.image_url)}
                                className="h-full w-full"
                              >
                                <img
                                  src={image.image_url}
                                  alt="Completed work"
                                  className="h-full w-full object-cover"
                                />
                              </button>

                              <button
                                type="button"
                                disabled={deleting === image.id}
                                onClick={() => void deleteWorkImage(image)}
                                className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-black/70 text-white opacity-0 group-hover/image:opacity-100"
                              >
                                {deleting === image.id ? (
                                  <Loader2 className="h-2 w-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-2 w-2" />
                                )}
                              </button>
                            </div>
                          ))}

                          {images.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setSelected(item)}
                              className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[#F1F5F9] px-1.5 text-[8px] font-black text-[#475569]"
                            >
                              +{images.length - 3}
                            </button>
                          )}

                          {images.length === 0 && (
                            <button
                              type="button"
                              onClick={() => openUpload(item)}
                              disabled={uploading}
                              className="flex h-8 items-center gap-1 rounded-md border border-dashed border-gray-200 px-2 text-[8px] font-black text-[#94A3B8] hover:border-[#FF5C39] hover:text-[#FF5C39]"
                            >
                              <ImageIcon className="h-3 w-3" />
                              Add
                            </button>
                          )}

                          {images.length > 0 && (
                            <>
                              <span className="text-[8px] font-bold text-[#94A3B8]">
                                {images.length}
                              </span>

                              <button
                                type="button"
                                onClick={() => setSelected(item)}
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F8FAFC] text-[#64748B] hover:bg-orange-50 hover:text-[#FF5C39]"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* ACTION */}

                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            title="Preview"
                            className="flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-[8px] font-black text-[#475569] hover:border-[#FF5C39] hover:text-[#FF5C39]"
                          >
                            <Eye className="h-3 w-3" />

                            <span className="hidden xl:inline">View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openUpload(item)}
                            disabled={uploading}
                            title="Add images"
                            className="flex h-7 items-center gap-1 rounded-md bg-[#FF5C39] px-2 text-[8px] font-black text-white hover:bg-[#E94D2D] disabled:opacity-50"
                          >
                            {uploading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}

                            <span className="hidden xl:inline">Add</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            title="Details"
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F8FAFC] text-[#64748B] hover:bg-orange-50 hover:text-[#FF5C39]"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-between border-t border-gray-100 bg-[#F8FAFC] px-3 py-2">
            <p className="text-[9px] font-bold text-[#94A3B8]">
              Showing {items.length} completed work
              {items.length !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />

              <span className="text-[9px] font-black text-emerald-600">
                All completed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            {/* HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {selected.worker_photo ? (
                    <img
                      src={selected.worker_photo}
                      alt={selected.worker_name || "Worker"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {selected.source_type === "request" ? (
                        <ClipboardList className="h-4 w-4 text-gray-300" />
                      ) : (
                        <UserRound className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-black text-[#0F172A]">
                      {selected.worker_name ||
                        selected.customer_name ||
                        selected.company_name ||
                        "Completed Work"}
                    </h2>

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase ${
                        selected.source_type === "request"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-[#FF5C39]"
                      }`}
                    >
                      {selected.source_type === "request"
                        ? "Request"
                        : "Booking"}
                    </span>
                  </div>

                  <p className="truncate text-[10px] font-semibold text-[#FF5C39]">
                    {selected.service_type ||
                      selected.category ||
                      "Completed Work"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              {/* SUMMARY */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Work
                  </p>

                  <p className="mt-1 truncate text-[10px] font-black text-[#0F172A]">
                    {selected.service_type ||
                      selected.category ||
                      "Completed Work"}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Completed
                  </p>

                  <p className="mt-1 text-[10px] font-black text-[#0F172A]">
                    {formatDate(selected.booking_date)}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Reference
                  </p>

                  <p className="mt-1 truncate text-[9px] font-black text-[#0F172A]">
                    {selected.booking_id}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Photos
                  </p>

                  <p className="mt-1 text-[10px] font-black text-[#0F172A]">
                    {getImages(selected).length}
                  </p>
                </div>
              </div>

              {/* INFO */}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Customer
                  </p>

                  <p className="mt-1 text-xs font-black text-[#334155]">
                    {selected.company_name ||
                      selected.customer_name ||
                      "Customer"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Location
                  </p>

                  <p className="mt-1 text-xs text-[#475569]">
                    {getLocation(selected) || "—"}
                  </p>
                </div>
              </div>

              {/* REQUEST DETAILS */}

              {selected.source_type === "request" && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <p className="text-[8px] font-bold uppercase text-blue-400">
                      Workers
                    </p>

                    <p className="mt-1 text-xs font-black text-blue-700">
                      {selected.workers_required || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <p className="text-[8px] font-bold uppercase text-blue-400">
                      Duration
                    </p>

                    <p className="mt-1 text-xs font-black text-blue-700">
                      {selected.duration || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <p className="text-[8px] font-bold uppercase text-blue-400">
                      Budget
                    </p>

                    <p className="mt-1 text-xs font-black text-blue-700">
                      {selected.budget != null ? `₹${selected.budget}` : "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* DESCRIPTION */}

              {selected.description && (
                <div className="mt-3 rounded-lg bg-[#F8FAFC] p-2.5">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-[#94A3B8]">
                    Work Details
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#475569]">
                    {selected.description}
                  </p>
                </div>
              )}

              {/* IMAGES */}

              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-[#0F172A]">
                      Work Images
                    </h3>

                    <p className="text-[9px] text-[#94A3B8]">
                      Preview, add or delete photos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openUpload(selected)}
                    disabled={uploading}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-[#FF5C39] px-2.5 text-[9px] font-black text-white disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Add Images
                  </button>
                </div>

                {uploading && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-orange-50 p-2.5 text-[10px] font-bold text-[#FF5C39]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading work images...
                  </div>
                )}

                {getImages(selected).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {getImages(selected).map((image) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewImage(image.image_url)}
                          className="h-full w-full"
                        >
                          <img
                            src={image.image_url}
                            alt="Completed work"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewImage(image.image_url)}
                          className="absolute bottom-2 left-2 flex h-7 items-center gap-1 rounded-full bg-black/65 px-2 text-[8px] font-black text-white"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>

                        <button
                          type="button"
                          disabled={deleting === image.id}
                          onClick={() => void deleteWorkImage(image)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {deleting === image.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUpload(selected)}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-[#F8FAFC] py-8 hover:border-[#FF5C39] hover:bg-orange-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-7 w-7 animate-spin text-[#FF5C39]" />
                    ) : (
                      <Upload className="h-7 w-7 text-gray-300" />
                    )}

                    <p className="mt-2 text-[10px] font-black text-[#475569]">
                      Add work photos
                    </p>

                    <p className="mt-1 text-[9px] text-[#94A3B8]">
                      Multiple images supported
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE */}

      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={previewImage}
            alt="Work preview"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
