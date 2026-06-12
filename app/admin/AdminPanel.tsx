"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import OrdersTab from "@/app/admin/components/OrdersTab";
import AdminSidebar from "./components/AdminSidebar";
import { toast } from "sonner";
import ShopsTab from "./components/ShopsTab";
import WorkerExcelImport from "./components/WorkerExcelImport";

import {
  LayoutDashboard,
  Users,
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Briefcase,
  Sparkles,
  Star,
  CheckCircle,
  XCircle,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "@/app/components/context/AdminContext";
import { type Worker, type ServiceCategory } from "../data/workers";
import {
  type Product,
  type ProductCategory,
  productCategories as staticCategories,
} from "../data/products";

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "workers" | "shops" | "orders";

const WORKER_CATEGORIES = [
  {
    name: "Labour",
    subcategories: [
      "General Labour",
      "Skilled Labour",
      "Certified Labour",
      "Construction Helper",
      "Site Helper",
    ],
  },

  {
    name: "Driver",
    subcategories: [
      "Car Driver",
      "Taxi Driver",
      "Truck Driver",
      "Bus Driver",
      "Commercial Driver",
      "Heavy Vehicle Driver",
      "Delivery Driver",
    ],
  },

  {
    name: "Mechanic",
    subcategories: [
      "Bike Mechanic",
      "Car Mechanic",
      "Truck Mechanic",
      "Diesel Mechanic",
      "Garage Mechanic",
      "Puncture Repair",
    ],
  },

  {
    name: "Washer",
    subcategories: [
      "Car Washer",
      "Bike Washer",
      "Foam Wash",
      "Truck Washer",
      "Interior Cleaning",
    ],
  },

  {
    name: "Computer Operator",
    subcategories: [
      "Web Developer",
      "Software Developer",
      "Graphic Designer",
      "Video Editor",
      "Data Entry Operator",
      "Computer Technician",
      "Billing Executive",
    ],
  },

  {
    name: "Office Worker",
    subcategories: [
      "Office Boy",
      "Office Assistant",
      "Receptionist",
      "Back Office Staff",
      "Helper",
      "Cleaner",
    ],
  },

  {
    name: "Home Services",
    subcategories: [
      "Maid",
      "Cook",
      "Chef",
      "Babysitter",
      "Laundry Worker",
      "House Cleaner",
      "Bathroom Cleaner",
    ],
  },

  {
    name: "Salon & Beauty",
    subcategories: [
      "Hair Stylist",
      "Beautician",
      "Makeup Artist",
      "Mehndi Artist",
      "Spa Therapist",
      "Nail Artist",
    ],
  },

  {
    name: "Restaurant",
    subcategories: [
      "Chef",
      "Cook",
      "Kitchen Helper",
      "Waiter",
      "Captain",
      "Restaurant Manager",
    ],
  },

  {
    name: "Home Contractor",
    subcategories: [
      "Plumber",
      "Electrician",
      "Welder",
      "Carpenter",
      "Painter",
      "Roofer",
      "Fabricator",
    ],
  },

  {
    name: "Construction",
    subcategories: [
      "Mason",
      "Tiles Worker",
      "POP Worker",
      "Steel Fixer",
      "Scaffolding Worker",
      "Concrete Worker",
    ],
  },

  {
    name: "Factory",
    subcategories: [
      "Machine Operator",
      "Packaging Worker",
      "Warehouse Worker",
      "Maintenance Technician",
      "Assembly Worker",
    ],
  },

  {
    name: "Roads",
    subcategories: [
      "Road Labour",
      "Roller Operator",
      "Paver Machine Operator",
      "Drain Worker",
      "Concrete Finisher",
    ],
  },

  {
    name: "Delivery",
    subcategories: [
      "Food Delivery",
      "Parcel Delivery",
      "Courier Boy",
      "E-commerce Delivery",
    ],
  },

  {
    name: "Security",
    subcategories: [
      "Security Guard",
      "Night Guard",
      "Bouncer",
      "Society Guard",
    ],
  },

  {
    name: "Healthcare",
    subcategories: ["Ward Boy", "Caretaker", "Home Nurse", "Patient Helper"],
  },

  {
    name: "Event Services",
    subcategories: [
      "Decorator",
      "DJ Helper",
      "Tent Worker",
      "Catering Staff",
      "Photographer",
    ],
  },
];

const RESPONSE_OPTIONS = [
  "Within 15 minutes",
  "Within 30 minutes",
  "Within 1 hour",
  "Within 2 hours",
  "Within 3 hours",
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const emptyWorker = (): Omit<Worker, "id"> => ({
  name: "",

  phone: "",

  category: "",

  subcategory: "",

  specialty: "",

  services: [],

  pricingType: "custom",

  startingPrice: 0,

  halfDayPrice: 0,

  fullDayPrice: 0,

  monthlyPrice: 0,

  visitCharge: 0,

  rating: 4.8,

  reviewCount: 0,

  location: "",

  available: true,

  yearsExperience: 1,

  completedJobs: 0,

  bio: "",

  skills: [],

  photo: "",

  responseTime: "Within 1 hour",

  certifications: [],
});

const SERVICES_BY_SUBCATEGORY: Record<string, string[]> = {
  // LABOUR
  "General Labour": [
    "Loading",
    "Unloading",
    "Helper Work",
    "Material Shifting",
    "Packing Work",
  ],

  "Skilled Labour": [
    "Construction Work",
    "Machine Work",
    "Industrial Work",
    "Site Work",
  ],

  "Certified Labour": ["Safety Work", "Industrial Work", "Heavy Duty Work"],

  "Construction Helper": ["Cement Mixing", "Material Carry", "Site Cleaning"],

  "Site Helper": ["Construction Support", "Helper Work", "Equipment Support"],

  // DRIVER
  "Car Driver": ["Personal Driver", "Outstation Driver", "Daily Driver"],

  "Taxi Driver": ["Cab Service", "Airport Pickup", "City Ride"],

  "Truck Driver": ["Goods Transport", "Long Route Driving", "Heavy Transport"],

  "Bus Driver": ["Passenger Transport", "School Bus Service"],

  "Commercial Driver": ["Commercial Transport", "Heavy Driving"],

  "Heavy Vehicle Driver": ["Trailer Driving", "Container Transport"],

  "Delivery Driver": ["Food Delivery", "Parcel Delivery", "Courier Delivery"],

  // MECHANIC
  "Bike Mechanic": ["Bike Repair", "Engine Repair", "Oil Change"],

  "Car Mechanic": ["Car Repair", "AC Repair", "Engine Work"],

  "Truck Mechanic": ["Truck Service", "Diesel Engine Repair"],

  "Diesel Mechanic": ["Diesel Engine Work", "Machine Repair"],

  "Garage Mechanic": ["Garage Service", "Vehicle Repair"],

  "Puncture Repair": ["Tyre Repair", "Tube Change"],

  // WASHER
  "Car Washer": ["Car Wash", "Interior Cleaning", "Foam Wash"],

  "Bike Washer": ["Bike Wash", "Foam Wash"],

  "Foam Wash": ["Premium Foam Wash", "Deep Cleaning"],

  "Truck Washer": ["Truck Cleaning", "Heavy Vehicle Wash"],

  "Interior Cleaning": ["Dashboard Cleaning", "Seat Cleaning"],

  // COMPUTER
  "Web Developer": [
    "Website Design",
    "Frontend Development",
    "Backend Development",
  ],

  "Software Developer": ["Software Development", "App Development"],

  "Graphic Designer": ["Logo Design", "Banner Design", "Poster Design"],

  "Video Editor": ["Video Editing", "Reel Editing", "YouTube Editing"],

  "Data Entry Operator": ["Typing", "Excel Work", "Data Management"],

  "Computer Technician": ["Computer Repair", "Laptop Repair", "System Setup"],

  "Billing Executive": ["Billing", "Invoice Management"],

  // OFFICE
  "Office Boy": ["Tea Service", "Office Cleaning", "File Management"],

  "Office Assistant": ["Documentation", "Office Support"],

  Receptionist: ["Call Management", "Customer Handling"],

  "Back Office Staff": ["Backend Support", "Office Data Work"],

  Helper: ["Support Work", "Office Helper"],

  Cleaner: ["Cleaning", "Sanitization"],

  // HOME SERVICES
  Maid: ["House Cleaning", "Utensils Cleaning"],

  Cook: ["Home Cooking", "Daily Cooking"],

  Chef: ["Restaurant Cooking", "Special Dishes"],

  Babysitter: ["Child Care", "Home Babysitting"],

  "Laundry Worker": ["Clothes Washing", "Iron Service"],

  "House Cleaner": ["Full Home Cleaning", "Deep Cleaning"],

  "Bathroom Cleaner": ["Toilet Cleaning", "Bathroom Wash"],

  // SALON & BEAUTY
  "Hair Stylist": ["Hair Cut", "Hair Styling", "Hair Spa", "Beard Styling"],

  Beautician: ["Facial", "Cleanup", "Waxing", "Threading"],

  "Makeup Artist": ["Bridal Makeup", "Party Makeup"],

  "Mehndi Artist": ["Bridal Mehndi", "Hand Mehndi"],

  "Spa Therapist": ["Spa Massage", "Relax Therapy"],

  "Nail Artist": ["Nail Art", "Nail Extension"],

  // RESTAURANT
  Waiter: ["Food Serving", "Customer Handling"],

  "Kitchen Helper": ["Food Preparation", "Kitchen Cleaning"],

  Captain: ["Restaurant Supervision", "Customer Service"],

  "Restaurant Manager": ["Restaurant Management", "Staff Handling"],

  // HOME CONTRACTOR
  Plumber: ["Pipe Repair", "Bathroom Fitting"],

  Electrician: ["Wiring", "Fan Installation", "Switch Repair"],

  Welder: ["Gate Welding", "Steel Fabrication"],

  Carpenter: ["Furniture Work", "Wood Repair"],

  Painter: ["Wall Painting", "Texture Paint"],

  Roofer: ["Roof Installation", "Roof Repair"],

  Fabricator: ["Metal Fabrication", "Steel Work"],

  // CONSTRUCTION
  Mason: ["Brick Work", "Cement Work"],

  "Tiles Worker": ["Floor Tiles", "Bathroom Tiles"],

  "POP Worker": ["POP Design", "Ceiling Work"],

  "Steel Fixer": ["Steel Binding", "Construction Steel Work"],

  "Scaffolding Worker": ["Scaffolding Setup", "Support Structure"],

  "Concrete Worker": ["Concrete Mixing", "Concrete Finishing"],

  // FACTORY
  "Machine Operator": ["Factory Machine Work", "Machine Handling"],

  "Packaging Worker": ["Product Packing", "Box Packaging"],

  "Warehouse Worker": ["Loading", "Packing", "Inventory Work"],

  "Maintenance Technician": ["Machine Maintenance", "Repair Work"],

  "Assembly Worker": ["Assembly Line Work", "Factory Assembly"],

  // ROADS
  "Road Labour": ["Road Construction", "Material Loading"],

  "Roller Operator": ["Road Roller Operation"],

  "Paver Machine Operator": ["Paver Machine Work"],

  "Drain Worker": ["Drain Cleaning", "Drain Construction"],

  "Concrete Finisher": ["Road Finishing", "Concrete Finish"],

  // DELIVERY
  "Food Delivery": ["Restaurant Delivery", "Fast Delivery"],

  "Parcel Delivery": ["Courier Delivery", "Parcel Service"],

  "Courier Boy": ["Courier Pickup", "Document Delivery"],

  "E-commerce Delivery": ["Online Order Delivery", "COD Delivery"],

  // SECURITY
  "Security Guard": ["Society Security", "Office Security"],

  "Night Guard": ["Night Patrol", "Night Security"],

  Bouncer: ["Club Security", "Event Security"],

  "Society Guard": ["Gate Security", "Visitor Management"],

  // HEALTHCARE
  "Ward Boy": ["Patient Care", "Hospital Support"],

  Caretaker: ["Elder Care", "Patient Assistance"],

  "Home Nurse": ["Home Nursing", "Medical Care"],

  "Patient Helper": ["Hospital Assistance", "Patient Support"],

  // EVENT
  Decorator: ["Wedding Decoration", "Event Decoration"],

  "DJ Helper": ["DJ Setup", "Sound Support"],

  "Tent Worker": ["Tent Setup", "Event Support"],

  "Catering Staff": ["Food Serving", "Event Catering"],

  Photographer: ["Wedding Shoot", "Event Photography"],
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  sand: "#FFF7ED",

  aggregate: "#F3F4F6",

  brick: "#FEF2F2",

  cement: "#F8FAFC",

  tmt: "#F1F5F9",

  paint: "#F5F3FF",

  plumbing: "#EFF6FF",

  tiles: "#F0FDFA",

  electrical: "#FEFCE8",
};

// ── Tag input ────────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };
  return (
    <div className="border border-gray-200 rounded-xl bg-[#F8FAFC] p-2 flex flex-wrap gap-1.5 min-h-11">
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="flex items-center gap-1 bg-white border border-gray-200 text-xs text-[#475569] px-2 py-0.5 rounded-full"
        >
          {t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))}>
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={tags.length === 0 ? placeholder : "Add more…"}
        className="bg-transparent text-xs outline-none flex-1 min-w-25 text-[#0F172A] placeholder-gray-400"
      />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-xs text-[#64748B] mb-1.5"
        style={{ fontWeight: 600 }}
      >
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp =
  "w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0EA5E9] transition-colors";

// ═══════════════════════════════════════════════════════════════════════════════
// WORKER FORM
// ═══════════════════════════════════════════════════════════════════════════════
function WorkerForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Worker;
  onSave: (w: Omit<Worker, "id">) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Worker, "id">>(
    initial
      ? { ...initial }
      : {
          ...emptyWorker(),
          phone: "",
          services: [],
        },
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const u = (field: keyof Omit<Worker, "id">, val: any) =>
    setForm((f) => ({
      ...f,
      [field]: val,
    }));

  const selectedCategory = WORKER_CATEGORIES.find(
    (c) => c.name === form.category,
  );

  console.log("form.category =", form.category);
  console.log("selectedCategory =", selectedCategory);

  const selectedServices = SERVICES_BY_SUBCATEGORY[form.subcategory] || [];

  useEffect(() => {
    if (form.subcategory) {
      u("specialty", form.subcategory);
    }
  }, [form.subcategory]);

  useEffect(() => {
    switch (form.category) {
      case "Labour":
        u("pricingType", "daily");
        break;

      case "Driver":
        u("pricingType", "daily");
        break;

      case "Mechanic":
        u("pricingType", "visit_charge");
        break;

      case "Washer":
        u("pricingType", "per_service");
        break;

      case "Restaurant":
        u("pricingType", "daily");
        break;

      case "Security":
        u("pricingType", "monthly");
        break;

      case "Home Services":
        u("pricingType", "per_job");
        break;

      case "Salon & Beauty":
        u("pricingType", "per_service");
        break;

      case "Office Worker":
        u("pricingType", "monthly");
        break;

      case "Factory":
        u("pricingType", "daily");
        break;

      case "Event Services":
        u("pricingType", "per_job");
        break;

      default:
        u("pricingType", "custom");
        break;
    }
  }, [form.category]);

  const validate = () => {
    if (!form.name.trim()) return "Name is required";

    if (!form.phone.trim()) return "Mobile number is required";

    if (form.phone.length < 10) return "Enter valid mobile number";

    if (!form.category) return "Category is required";

    if (!form.subcategory) return "Sub Category is required";

    if (!form.specialty.trim()) return "Specialty is required";

    if (!form.location.trim()) return "Location is required";

    if (form.startingPrice <= 0) return "Starting price is required";

    if (!form.services?.length) return "Select at least one service";

    return "";
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();

        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");

          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }

          if (height > MAX_HEIGHT) {
            width = width * (MAX_HEIGHT / height);
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject("Canvas Error");
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/webp", 0.7));
        };
      };
    });
  };

  const uploadWorkerPhoto = async (file: File) => {
    const compressed = await compressImage(file);

    const blob = await fetch(compressed).then((r) => r.blob());

    const workerName =
      form.name?.trim().replace(/[^a-zA-Z0-9]/g, "-") || "worker";

    const category =
      form.category?.trim().replace(/[^a-zA-Z0-9]/g, "-") || "uncategorized";

    const subcategory =
      form.subcategory?.trim().replace(/[^a-zA-Z0-9]/g, "-") || "general";

    const filePath = `${category}/${subcategory}/${workerName}/profile.webp`;

    const { error } = await supabase.storage
      .from("workers")
      .upload(filePath, blob, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("workers").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (saving) return;

    const err = validate();

    if (err) {
      setError(err);
      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload = {
        name: form.name,
        phone: form.phone,
        category: form.category,
        subcategory: form.subcategory,
        specialty: form.specialty,
        services: form.services,
        rating: form.rating,
        review_count: form.reviewCount,
        pricing_type: form.pricingType,
        starting_price: form.startingPrice,

        half_day_price: form.halfDayPrice,
        full_day_price: form.fullDayPrice,

        monthly_price: form.monthlyPrice,
        visit_charge: form.visitCharge,
        location: form.location,
        available: form.available,
        years_experience: form.yearsExperience,
        completed_jobs: form.completedJobs,
        bio: form.bio,
        skills: form.skills,
        photo: form.photo,
        response_time: form.responseTime,
        certifications: form.certifications,
      };

      let error = null;

      if (initial) {
        const res = await supabase
          .from("workers")
          .update(payload)
          .eq("id", initial.id);

        error = res.error;
      } else {
        const res = await supabase.from("workers").insert([payload]);

        error = res.error;
      }

      if (error) {
        setError(error.message);
        return;
      }

      await onSave(payload as any);
    } catch (err) {
      console.log(err);

      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-[#0F172A] font-extrabold">
            {initial ? "Edit Worker" : "Add New Worker"}
          </h2>

          <p className="text-[#64748B] text-xs mt-1">
            Fill all worker information
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-[#64748B]" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Excel Import */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#FF5C39]" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">
                  Import Worker
                </h3>

                <p className="text-sm text-[#64748B]">
                  Select worker directly from onboarding Excel
                </p>
              </div>
            </div>

            <WorkerExcelImport
              onWorkerSelect={(worker: any) => {
                const photoUrl = worker["Profile Photo"] || "";

                let photo = photoUrl;

                // Google Drive open?id= format
                if (photoUrl.includes("open?id=")) {
                  const fileId = photoUrl.split("id=")[1]?.split("&")[0] || "";

                  photo = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                }

                // Google Drive file/d/ format
                else if (photoUrl.includes("/file/d/")) {
                  const fileId =
                    photoUrl.split("/file/d/")[1]?.split("/")[0] || "";

                  photo = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                }

                console.log("Original URL:", photoUrl);
                console.log("Final URL:", photo);

                setForm((prev) => ({
                  ...prev,
                  name: worker["Full Name"] || "",
                  phone: worker["Mobile Number"]?.toString() || "",
                  photo: photo,
                  location:
                    worker["Full Address (Optional)"] ||
                    worker["Current City / Area"] ||
                    "",
                  specialty: worker["Aap kis type ka kaam karte hain?"] || "",
                }));
              }}
            />
          </div>

          {/* Profile */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">Worker Profile</h3>

            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="Worker"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                {/* URL Input */}
                <input
                  value={form.photo}
                  onChange={(e) => u("photo", e.target.value)}
                  placeholder="Paste image URL"
                  className={inp}
                />

                {/* Upload Button */}
                <label className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FF5C39] text-white cursor-pointer hover:bg-[#e54e2e] transition-all">
                  <Upload className="w-4 h-4" />
                  Upload Worker Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      if (!form.category) {
                        alert("Select category first");
                        return;
                      }

                      if (!form.subcategory) {
                        alert("Select sub category first");
                        return;
                      }

                      if (!form.name) {
                        alert("Enter worker name first");
                        return;
                      }

                      try {
                        const photoUrl = await uploadWorkerPhoto(file);

                        console.log("Uploaded URL:", photoUrl);

                        u("photo", photoUrl);
                      } catch (err) {
                        console.error(err);
                        alert("Image upload failed");
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" required>
                <input
                  value={form.name}
                  onChange={(e) => u("name", e.target.value)}
                  className={inp}
                />
              </Field>

              <Field label="Mobile Number" required>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    u("phone", e.target.value.replace(/\D/g, ""))
                  }
                  className={inp}
                />
              </Field>

              <Field label="Location" required>
                <input
                  value={form.location}
                  onChange={(e) => u("location", e.target.value)}
                  className={inp}
                />
              </Field>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">Work Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => u("category", e.target.value)}
                  className={inp}
                >
                  <option>Select Category</option>

                  {WORKER_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Sub Category">
                <select
                  value={form.subcategory}
                  onChange={(e) => u("subcategory", e.target.value)}
                  className={inp}
                  disabled={!form.category}
                >
                  <option value="">Select Sub Category</option>

                  {selectedCategory?.subcategories?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Specialty">
                <input
                  value={form.specialty}
                  onChange={(e) => u("specialty", e.target.value)}
                  className={inp}
                />
              </Field>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">Services Offered</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedServices.map((service) => {
                const active = form.services.includes(service);

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      if (active) {
                        u(
                          "services",
                          form.services.filter((s) => s !== service),
                        );
                      } else {
                        u("services", [...form.services, service]);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition-all ${
                      active
                        ? "bg-[#FF5C39] text-white border-[#FF5C39] shadow-lg"
                        : "bg-white border-gray-200 hover:border-[#FF5C39]"
                    }`}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">
              Pricing & Experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Pricing Type">
                <select
                  value={form.pricingType}
                  onChange={(e) => u("pricingType", e.target.value)}
                  className={inp}
                >
                  <option value="">Select Pricing</option>
                  <option value="per_job">Per Work</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="per_service">Per Service</option>
                  <option value="visit_charge">Visit Charge</option>
                  <option value="custom">Custom Quote</option>
                </select>
              </Field>

              <Field label="Starting Price">
                <input
                  type="number"
                  value={form.startingPrice}
                  onChange={(e) => u("startingPrice", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Half Day Price">
                <input
                  type="number"
                  value={form.halfDayPrice}
                  onChange={(e) => u("halfDayPrice", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Full Day Price">
                <input
                  type="number"
                  value={form.fullDayPrice}
                  onChange={(e) => u("fullDayPrice", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Monthly Price">
                <input
                  type="number"
                  value={form.monthlyPrice}
                  onChange={(e) => u("monthlyPrice", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Visit Charge">
                <input
                  type="number"
                  value={form.visitCharge}
                  onChange={(e) => u("visitCharge", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Experience">
                <input
                  type="number"
                  value={form.yearsExperience}
                  onChange={(e) => u("yearsExperience", Number(e.target.value))}
                  className={inp}
                />
              </Field>

              <Field label="Jobs Completed">
                <input
                  type="number"
                  value={form.completedJobs}
                  onChange={(e) => u("completedJobs", Number(e.target.value))}
                  className={inp}
                />
              </Field>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#0F172A] mb-5">About Worker</h3>

            <textarea
              rows={5}
              value={form.bio}
              onChange={(e) => u("bio", e.target.value)}
              className={inp + " resize-none"}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-gray-200"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl bg-[#FF5C39] text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Worker"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardTab({ onGo }: { onGo: (tab: Tab) => void }) {
  const { workers = [], products = [], shops = [], orders = [] } = useAdmin();

  /* =========================================
   REAL LIVE STATS
========================================= */

  const stats = {
    totalWorkers: workers.length,

    availableWorkers: workers.filter((w) => w.available).length,

    totalProducts: products.filter((p) => p.is_active !== false).length,

    outOfStock: products.filter((p) => {
      return p.is_active !== false && Number(p.stock ?? 0) <= 0;
    }).length,
    totalShops: shops.length,

    onlineShops: shops.filter((s) => s.status === "online").length,

    totalOrders: orders.length,
  };

  console.log(
    "OUT OF STOCK PRODUCTS",
    products.filter((p) => {
      return p.is_active !== false && Number(p.stock ?? 0) <= 0;
    }),
  );

  const statCards = [
    {
      label: "Total Workers",
      value: stats.totalWorkers,
      sub: `${stats.availableWorkers} available`,
      color: "#FF5C39",
      bg: "#FFF5F3",
      icon: Users,
    },

    {
      label: "Total Shops",
      value: stats.totalShops,
      sub: `${stats.onlineShops} online`,
      color: "#8B5CF6",
      bg: "#F5F3FF",
      icon: Briefcase,
    },

    {
      label: "Total Products",
      value: stats.totalProducts,
      sub: `${stats.outOfStock} out of stock`,
      color: "#0EA5E9",
      bg: "#F0F9FF",
      icon: Package,
    },

    {
      label: "Total Orders",
      value: orders.length,
      sub: "Customer orders",
      color: "#10B981",
      bg: "#ECFDF5",
      icon: LayoutDashboard,
    },

    {
      label: "Available Workers",
      value: stats.availableWorkers,
      sub: `${stats.totalWorkers - stats.availableWorkers} busy`,
      color: "#22C55E",
      bg: "#ECFDF5",
      icon: CheckCircle,
    },

    {
      label: "Out Of Stock",
      value: stats.outOfStock,
      sub: "Products unavailable",
      color: "#EF4444",
      bg: "#FEF2F2",
      icon: XCircle,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-[#0F172A]"
          style={{ fontWeight: 800, fontSize: "1.6rem" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Overview of Workkerz & E-Aurix platform data
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span className="text-xs text-[#64748B]">Total</span>
              </div>
              <div
                className="text-[#0F172A]"
                style={{ fontWeight: 900, fontSize: "2rem", lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div
                className="text-[#0F172A] text-sm mt-1"
                style={{ fontWeight: 600 }}
              >
                {s.label}
              </div>
              <div className="text-[#94A3B8] text-xs mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* DASHBOARD ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
        {/* DONUT CHART */}
        <div className="bg-white rounded-[30px] border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#0F172A] text-lg font-black">
                Worker Status
              </h3>

              <p className="text-sm text-[#64748B] mt-1">
                Available vs Busy workers
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-[#FFF4EF] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#FF5C39]" />
            </div>
          </div>

          {/* ROUND CHART */}
          <div className="flex items-center justify-center">
            <div className="relative w-56 h-56">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* BG */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                />

                {/* AVAILABLE */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${
                    stats.totalWorkers > 0
                      ? (stats.availableWorkers / stats.totalWorkers) * 283
                      : 0
                  } 283`}
                  strokeLinecap="round"
                />

                {/* BUSY */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#FF5C39"
                  strokeWidth="12"
                  strokeDasharray={`${
                    stats.totalWorkers > 0
                      ? ((stats.totalWorkers - stats.availableWorkers) /
                          stats.totalWorkers) *
                        283
                      : 0
                  } 283`}
                  strokeDashoffset={`-${
                    (stats.availableWorkers / stats.totalWorkers) * 283
                  }`}
                  strokeLinecap="round"
                />
              </svg>

              {/* CENTER */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black text-[#0F172A]">
                  {stats.totalWorkers}
                </div>

                <div className="text-sm text-[#64748B] mt-1">Total Workers</div>
              </div>
            </div>
          </div>

          {/* LEGEND */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-[#ECFDF5] rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />

                <div className="text-xs text-[#64748B]">Available</div>
              </div>

              <div className="text-2xl font-black text-emerald-600 mt-2">
                {stats.availableWorkers}
              </div>
            </div>

            <div className="bg-[#FFF5F3] rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5C39]" />

                <div className="text-xs text-[#64748B]">Busy</div>
              </div>

              <div className="text-2xl font-black text-[#FF5C39] mt-2">
                {stats.totalWorkers - stats.availableWorkers}
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY BAR */}
        <div className="bg-white rounded-[30px] border border-gray-100 p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#0F172A] text-lg font-black">
                Worker Categories
              </h3>

              <p className="text-sm text-[#64748B] mt-1">
                Category wise workers
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>

          <div className="space-y-5">
            {WORKER_CATEGORIES.slice(0, 6).map((cat) => {
              const count = (workers ?? []).filter(
                (w) => w.category === cat.name,
              ).length;

              const percent =
                stats.totalWorkers > 0 ? (count / stats.totalWorkers) * 100 : 0;

              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-black text-[#0F172A]">
                        {cat.name}
                      </div>

                      <div className="text-xs text-[#64748B] mt-0.5">
                        {count} workers
                      </div>
                    </div>

                    <div className="text-sm font-black text-[#0F172A]">
                      {Math.round(percent)}%
                    </div>
                  </div>

                  {/* LIVE BAR */}
                  <div className="w-full h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#FF5C39] to-[#FF8A6B] transition-all duration-1000"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE ACTIVITY */}
      <div className="bg-white rounded-[30px] border border-gray-100 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#0F172A] text-lg font-black">
              Live Platform Activity
            </h3>

            <p className="text-sm text-[#64748B] mt-1">
              Real-time platform overview
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />

            <div className="text-xs font-bold text-emerald-700">Live</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* ACTIVE */}
          <div className="bg-[#F8FAFC] rounded-3xl p-5 border border-gray-100">
            <div className="text-sm text-[#64748B]">Active Workers</div>

            <div className="text-4xl font-black text-emerald-600 mt-3">
              {stats.availableWorkers}
            </div>

            <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    stats.totalWorkers > 0
                      ? (stats.availableWorkers / stats.totalWorkers) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="bg-[#F8FAFC] rounded-3xl p-5 border border-gray-100">
            <div className="text-sm text-[#64748B]">Products</div>

            <div className="text-4xl font-black text-sky-600 mt-3">
              {stats.totalProducts}
            </div>

            <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min((stats.totalProducts / 100) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* OUT OF STOCK */}
          <div className="bg-[#F8FAFC] rounded-3xl p-5 border border-gray-100">
            <div className="text-sm text-[#64748B]">Out Of Stock</div>

            <div className="text-4xl font-black text-rose-600 mt-3">
              {stats.outOfStock}
            </div>

            <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    stats.totalProducts > 0
                      ? Math.min(
                          (stats.outOfStock / stats.totalProducts) * 100,
                          100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="bg-[#F8FAFC] rounded-3xl p-5 border border-gray-100">
            <div className="text-sm text-[#64748B]">Categories</div>

            <div className="text-4xl font-black text-violet-600 mt-3">
              {WORKER_CATEGORIES.length}
            </div>

            <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                style={{
                  width: "85%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-linear-to-br from-[#FF5C39] to-[#e54e2e] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6" />
            <div style={{ fontWeight: 700 }}>Manage Workers</div>
          </div>
          <p className="text-orange-100 text-sm mb-4">
            Add, edit or remove workers from the Workkerz platform.
          </p>
          <button
            onClick={() => onGo("workers")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            Go to Workers <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-linear-to-br from-[#0284C7] to-[#0C3B5E] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6" />
            <div style={{ fontWeight: 700 }}>Manage Shops</div>
          </div>
          <p className="text-sky-200 text-sm mb-4">
            Add, edit or remove shops from E-Aurix.
          </p>
          <button
            onClick={() => onGo("shops")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            Go to Products <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent workers */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#0F172A]" style={{ fontWeight: 700 }}>
            Recent Workers
          </h3>
          <button
            onClick={() => onGo("workers")}
            className="text-xs text-[#0EA5E9] hover:underline"
            style={{ fontWeight: 600 }}
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {(workers ?? []).slice(0, 4).map((w) => (
            <div key={w.id} className="flex items-center gap-3">
              <img
                src={w.photo}
                alt={w.name}
                className="w-9 h-9 rounded-full object-cover border border-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${w.name}&background=random`;
                }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm text-[#0F172A]"
                  style={{ fontWeight: 600 }}
                >
                  {w.name}
                </div>
                <div className="text-xs text-[#64748B]">
                  {w.category} • {w.subcategory}
                </div>

                <div className="text-[11px] text-[#94A3B8] mt-0.5">
                  {w.specialty} · {w.location}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-[#64748B]">{w.rating}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${w.available ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                style={{ fontWeight: 600 }}
              >
                {w.available ? "Available" : "Busy"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function WorkersTab() {
  const { workers = [], addWorker, updateWorker, deleteWorker } = useAdmin();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const CATEGORY_STYLE: Record<
    string,
    {
      bg: string;
      light: string;
    }
  > = {
    Labour: {
      bg: "#F97316",
      light: "#FFF7ED",
    },

    Driver: {
      bg: "#10B981",
      light: "#ECFDF5",
    },

    Mechanic: {
      bg: "#3B82F6",
      light: "#EFF6FF",
    },

    Washer: {
      bg: "#EAB308",
      light: "#FEFCE8",
    },

    "Computer Operator": {
      bg: "#9333EA",
      light: "#F3E8FF",
    },

    "Office Worker": {
      bg: "#DB2777",
      light: "#FCE7F3",
    },

    "Home Services": {
      bg: "#65A30D",
      light: "#ECFCCB",
    },

    Restaurant: {
      bg: "#E11D48",
      light: "#FFE4E6",
    },

    "Home Contractor": {
      bg: "#0284C7",
      light: "#E0F2FE",
    },

    Factory: {
      bg: "#475569",
      light: "#F1F5F9",
    },

    Roads: {
      bg: "#D97706",
      light: "#FEF3C7",
    },
    "Salon & Beauty": {
      bg: "#EC4899",
      light: "#FCE7F3",
    },

    Construction: {
      bg: "#F97316",
      light: "#FFF7ED",
    },

    Delivery: {
      bg: "#06B6D4",
      light: "#ECFEFF",
    },

    Security: {
      bg: "#334155",
      light: "#F1F5F9",
    },

    Healthcare: {
      bg: "#EF4444",
      light: "#FEF2F2",
    },

    "Event Services": {
      bg: "#8B5CF6",
      light: "#F5F3FF",
    },
  };

  const filtered = (workers ?? []).filter((w) => {
    const q = search.toLowerCase();

    const matchQ =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.specialty.toLowerCase().includes(q) ||
      w.subcategory.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q);

    const matchCat = !catFilter || w.category === catFilter;

    return matchQ && matchCat;
  });

  const categoryStats = WORKER_CATEGORIES.map((cat) => ({
    ...cat,

    total: (workers ?? []).filter((w) => w.category === cat.name).length,
  }));

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (w: Worker) => {
    setEditing(w);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleSave = async (data: Omit<Worker, "id">) => {
    try {
      if (editing) {
        await updateWorker(editing.id, data);

        setSuccessMsg("Worker updated successfully!");
      } else {
        await addWorker(data);

        setSuccessMsg("New worker added!");
      }

      closeDrawer();

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (id: string) => {
    deleteWorker(id);

    setDeleteConfirm(null);

    setSuccessMsg("Worker removed.");

    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };
  const handleToggleWorkerStatus = async (
    workerId: string,
    currentStatus: boolean,
  ) => {
    try {
      await updateWorker(workerId, {
        available: !currentStatus,
      });

      setSuccessMsg(
        !currentStatus
          ? "Worker Activated Successfully"
          : "Worker Deactivated Successfully",
      );

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setSuccessMsg("Failed to update worker status");
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F8FAFC]">
      {/* SUCCESS */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1
            className="text-[#0F172A]"
            style={{
              fontWeight: 800,
              fontSize: "1.7rem",
            }}
          >
            Workers Management
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            {(workers ?? []).length} total workers available
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#FF5C39] hover:bg-[#e54e2e] text-white px-5 py-3 rounded-2xl shadow-lg shadow-orange-100 transition-all"
          style={{ fontWeight: 700 }}
        >
          <Plus className="w-4 h-4" />
          Add Worker
        </button>
      </div>
      {/* SMART SEARCH */}

      <div className="relative mb-7 z-20">
        {/* SEARCH BOX */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-5 h-18">
            {/* ICON */}
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4EF] flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-[#FF5C39]" />
            </div>

            {/* INPUT */}
            <div className="flex-1">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);

                  if (selectedWorker) {
                    setSelectedWorker(null);
                  }
                }}
                placeholder="Search workers, category, specialty or location..."
                className="w-full bg-transparent outline-none text-[15px] text-[#0F172A] placeholder:text-[#94A3B8]"
              />

              {/* QUICK TAGS */}
              {!search && (
                <div className="flex items-center gap-2 mt-1">
                  {["Driver", "Mechanic", "Chef", "Electrician"].map(
                    (tag, index) => (
                      <button
                        key={`${tag}-${index}`}
                        onClick={() => {
                          setSearch(tag);
                          setSelectedWorker(null);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-[#F8FAFC] hover:bg-orange-50 hover:text-[#FF5C39] text-[#64748B] transition-all"
                      >
                        {tag}
                      </button>
                    ),
                  )}
                </div>
              )}

              {/* RESULT */}
              {search && (
                <div className="text-[11px] text-[#94A3B8] mt-1">
                  {filtered.length} matching workers
                </div>
              )}
            </div>

            {/* CLEAR */}
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedWorker(null);
                  setCatFilter("");
                }}
                className="w-10 h-10 rounded-2xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* AUTO SUGGESTIONS */}
          {search && !selectedWorker && filtered.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-3 bg-[#FAFAFA] flex items-center justify-between">
                <div
                  className="text-xs text-[#64748B]"
                  style={{ fontWeight: 700 }}
                >
                  Smart Suggestions
                </div>

                <div className="text-[11px] text-[#94A3B8]">
                  {filtered.slice(0, 5).length} results
                </div>
              </div>

              <div className="max-h-90 overflow-y-auto">
                {filtered.slice(0, 5).map((w) => {
                  const style = CATEGORY_STYLE[w.category] || {
                    bg: "#64748B",
                    light: "#F1F5F9",
                  };

                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWorker(w);
                        setSearch(w.name);
                        setCatFilter(w.category);
                      }}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[#FAFAFA] transition-all border-b border-gray-50 text-left"
                    >
                      {/* IMAGE */}
                      <img
                        src={w.photo}
                        alt={w.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                      />

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm text-[#0F172A] truncate"
                          style={{ fontWeight: 800 }}
                        >
                          {w.name}
                        </div>

                        <div className="text-xs text-[#64748B] mt-0.5 truncate">
                          {w.specialty}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] px-2 py-1 rounded-full"
                            style={{
                              background: style.light,
                              color: style.bg,
                              fontWeight: 700,
                            }}
                          >
                            {w.category}
                          </span>

                          <span className="text-[10px] text-[#94A3B8] truncate">
                            {w.location}
                          </span>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="text-right shrink-0">
                        <div
                          className="text-[#0F172A] text-xl"
                          style={{ fontWeight: 900 }}
                        >
                          ₹{w.startingPrice}
                        </div>

                        <div className="text-xs text-[#64748B]">
                          {w.pricingType === "daily" && "Per Day"}
                          {w.pricingType === "monthly" && "Per Month"}
                          {w.pricingType === "per_job" && "Per Job"}
                          {w.pricingType === "per_service" && "Per Service"}
                          {w.pricingType === "visit_charge" && "Visit Charge"}
                          {w.pricingType === "custom" && "Custom Quote"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY */}
          {search && !selectedWorker && filtered.length === 0 && (
            <div className="border-t border-gray-100 p-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5 text-[#94A3B8]" />
              </div>

              <div className="text-[#0F172A]" style={{ fontWeight: 800 }}>
                No workers found
              </div>

              <div className="text-sm text-[#94A3B8] mt-1">
                Try different keywords
              </div>
            </div>
          )}
        </div>

        {/* SELECTED WORKER */}
        {selectedWorker && (
          <div className="mt-5">
            {(() => {
              const w = selectedWorker;

              const style = CATEGORY_STYLE[w.category] || {
                bg: "#64748B",
                light: "#F1F5F9",
              };

              return (
                <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-start gap-5">
                    {/* IMAGE */}
                    <img
                      src={w.photo}
                      alt={w.name}
                      onError={() => console.log("IMAGE FAILED", w.photo)}
                      className="w-24 h-24 rounded-3xl object-cover border border-gray-100"
                    />

                    {/* INFO */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h2
                            className="text-[#0F172A]"
                            style={{
                              fontWeight: 900,
                              fontSize: "1.5rem",
                            }}
                          >
                            {w.name}
                          </h2>

                          <div className="text-sm text-[#64748B] mt-1">
                            {w.specialty}
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span
                              className="px-3 py-1 rounded-full text-xs"
                              style={{
                                background: style.light,
                                color: style.bg,
                                fontWeight: 800,
                              }}
                            >
                              {w.category}
                            </span>

                            <span className="text-xs text-[#94A3B8]">
                              {w.location}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className="text-[#FF5C39]"
                            style={{
                              fontWeight: 900,
                              fontSize: "1.7rem",
                            }}
                          >
                            ₹{w.startingPrice}
                          </div>

                          <div className="text-xs text-[#94A3B8]">
                            Starting Price
                          </div>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />

                          <span style={{ fontWeight: 700 }}>{w.rating}</span>
                        </div>

                        <button
                          onClick={() => openEdit(w)}
                          className="px-5 py-2.5 rounded-2xl bg-[#FF5C39] hover:bg-[#e54e2e] text-white text-sm transition-all"
                          style={{ fontWeight: 800 }}
                        >
                          Edit Worker
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      {/* CATEGORY OVERVIEW */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-[#0F172A]"
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
              }}
            >
              Categories
            </h2>

            <p className="text-sm text-[#64748B] mt-1">
              Filter workers by category
            </p>
          </div>

          {catFilter && (
            <button
              onClick={() => setCatFilter("")}
              className="text-sm text-[#FF5C39]"
              style={{ fontWeight: 700 }}
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
          {/* ALL */}
          <button
            onClick={() => setCatFilter("")}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 p-4 text-left ${
              catFilter === ""
                ? "border-[#0F172A] bg-[#0F172A]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-xs ${
                    catFilter === "" ? "text-white/70" : "text-[#94A3B8]"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  Total
                </div>

                <div
                  className={`mt-1 text-3xl ${
                    catFilter === "" ? "text-white" : "text-[#0F172A]"
                  }`}
                  style={{ fontWeight: 900 }}
                >
                  {(workers ?? []).length}
                </div>
              </div>

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  catFilter === "" ? "bg-white/10" : "bg-[#F1F5F9]"
                }`}
              >
                <Users
                  className={`w-5 h-5 ${
                    catFilter === "" ? "text-white" : "text-[#0F172A]"
                  }`}
                />
              </div>
            </div>

            <div
              className={`mt-4 ${
                catFilter === "" ? "text-white" : "text-[#0F172A]"
              }`}
              style={{ fontWeight: 800 }}
            >
              All Workers
            </div>
          </button>

          {/* CATEGORY CARDS */}
          {categoryStats.map((cat) => {
            const style = CATEGORY_STYLE[cat.name] || {
              bg: "#64748B",
              light: "#F1F5F9",
            };

            const active = catFilter === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setCatFilter(active ? "" : cat.name)}
                className="group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: active ? style.bg : "#fff",

                  borderColor: active ? style.bg : "#E2E8F0",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="text-xs"
                      style={{
                        color: active ? "rgba(255,255,255,0.7)" : "#94A3B8",

                        fontWeight: 700,
                      }}
                    >
                      Workers
                    </div>

                    <div
                      className="mt-1 text-3xl"
                      style={{
                        fontWeight: 900,

                        color: active ? "#fff" : style.bg,
                      }}
                    >
                      {cat.total}
                    </div>
                  </div>

                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: active
                        ? "rgba(255,255,255,0.12)"
                        : style.light,
                    }}
                  >
                    <Users
                      className="w-5 h-5"
                      style={{
                        color: active ? "#fff" : style.bg,
                      }}
                    />
                  </div>
                </div>

                <div
                  className="mt-4 text-sm"
                  style={{
                    fontWeight: 800,

                    color: active ? "#fff" : "#0F172A",
                  }}
                >
                  {cat.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* WORKERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
        {(selectedWorker ? [selectedWorker] : filtered).map((w) => {
          const catStyle = CATEGORY_STYLE[w.category] || {
            bg: "#64748B",
            light: "#F1F5F9",
          };

          return (
            <div
              key={w.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all"
            >
              {/* TOP */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={w.photo}
                    alt={w.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />

                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                        w.available ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[#0F172A]"
                    style={{
                      fontWeight: 800,
                    }}
                  >
                    {w.name}
                  </h3>

                  <p className="text-xs text-[#64748B] mt-0.5">{w.specialty}</p>

                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        w.available
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {w.available ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* SINGLE BADGE */}
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        background: catStyle.light,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: catStyle.bg,
                        }}
                      />

                      <span
                        className="text-[11px]"
                        style={{
                          color: catStyle.bg,
                          fontWeight: 800,
                        }}
                      >
                        {w.category}
                      </span>

                      <div className="w-1 h-1 rounded-full bg-slate-300" />

                      <span
                        className="text-[11px] text-slate-600"
                        style={{
                          fontWeight: 700,
                        }}
                      >
                        {w.subcategory}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="text-[#0F172A]"
                    style={{
                      fontWeight: 900,
                    }}
                  >
                    ₹{w.startingPrice}
                  </div>

                  <div className="text-xs text-[#94A3B8]">
                    {w.pricingType === "daily" && "/day"}
                    {w.pricingType === "monthly" && "/month"}
                    {w.pricingType === "per_job" && "/job"}
                    {w.pricingType === "per_service" && "/service"}
                    {w.pricingType === "visit_charge" && "visit"}
                    {w.pricingType === "custom" && "quote"}
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="mt-4">
                <p className="text-xs text-[#64748B] line-clamp-2">{w.bio}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-[#64748B]">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {w.rating}
                  </div>

                  <div className="text-xs text-[#64748B]">{w.location}</div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => openEdit(w)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
                  style={{
                    fontWeight: 700,
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => handleToggleWorkerStatus(w.id, w.available)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border ${
                    w.available
                      ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {w.available ? "Deactivate" : "Activate"}
                </button>

                {deleteConfirm === w.id ? (
                  <div className="flex flex-1 gap-2">
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm"
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(w.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 text-sm"
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* ADD CARD */}
        <button
          onClick={openAdd}
          className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#FF5C39] hover:bg-orange-50 transition-all min-h-65"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#FF5C39]" />
          </div>

          <div
            className="text-[#FF5C39]"
            style={{
              fontWeight: 800,
            }}
          >
            Add New Worker
          </div>
        </button>
      </div>

      {/* DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          <div className="w-full max-w-lg bg-white flex flex-col h-full shadow-2xl overflow-hidden">
            <WorkerForm
              initial={editing || undefined}
              onSave={handleSave}
              onClose={closeDrawer}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { stats } = useAdmin();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  useEffect(() => {
    const saved = localStorage.getItem("workkerz-admin-login");

    if (saved === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const sidebarItems = [
    {
      id: "dashboard" as Tab,
      icon: LayoutDashboard,
      label: "Dashboard",
    },

    {
      id: "workers" as Tab,
      icon: Users,
      label: "Workers",
      badge: stats.totalWorkers,
    },

    {
      id: "shops" as Tab,
      icon: Briefcase,
      label: "Shops",
    },

    // ADD THIS
    {
      id: "orders" as Tab,
      icon: Briefcase,
      label: "Orders",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <AdminSidebar
        tab={tab}
        setTab={setTab}
        sidebarItems={sidebarItems}
        isLoggedIn={isLoggedIn}
      />

      {/* Main content */}
      <div className="flex-1 ml-56 min-h-screen overflow-y-auto">
        {isLoggedIn && (
          <>
            {tab === "dashboard" && <DashboardTab onGo={setTab} />}
            {tab === "workers" && <WorkersTab />}
            {tab === "shops" && <ShopsTab />}
            {tab === "orders" && <OrdersTab />}
          </>
        )}
      </div>
    </div>
  );
}
