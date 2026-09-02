"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  MapPin,
  Phone,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type {
  Worker,
  WorkerFormData,
  PriceKey,
} from "@/app/data/workers";

/* =========================================================
   PROPS
========================================================= */

type WorkerFormProps = {
  initial?: Worker;
  onSave: (worker: WorkerFormData) => Promise<void>;
  onClose: () => void;
};

/* =========================================================
   WORKER CATEGORIES
========================================================= */

const WORKER_CATEGORIES = [
  {
    name: "Labour",
    subcategories: [
      "General Labour",
      "Construction Labour",
      "Helper",
      "Loader",
      "Unloader",
    ],
  },
  {
    name: "Driver",
    subcategories: [
      "Car Driver",
      "Auto Driver",
      "Truck Driver",
      "Delivery Driver",
    ],
  },
  {
    name: "Mechanic",
    subcategories: [
      "Bike Mechanic",
      "Car Mechanic",
      "AC Mechanic",
      "Machine Mechanic",
    ],
  },
  {
    name: "Painter",
    subcategories: [
      "House Painter",
      "Wall Painter",
      "Commercial Painter",
    ],
  },
  {
    name: "Washer",
    subcategories: [
      "Car Washer",
      "Bike Washer",
      "Home Washer",
    ],
  },
  {
    name: "Office Worker",
    subcategories: [
      "Office Assistant",
      "Data Entry",
      "Receptionist",
    ],
  },
  {
    name: "Home Services",
    subcategories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "AC Repair",
      "Appliance Repair",
      "Cleaning",
    ],
  },
  {
    name: "Restaurant",
    subcategories: [
      "Waiter",
      "Kitchen Helper",
      "Cook",
      "Cleaner",
      "Delivery Staff",
    ],
  },
  {
    name: "Home Contractor",
    subcategories: [
      "Civil Contractor",
      "Renovation Contractor",
      "Building Contractor",
    ],
  },
  {
    name: "Factory",
    subcategories: [
      "Factory Labour",
      "Machine Operator",
      "Packing Worker",
      "Helper",
    ],
  },
  {
    name: "Salon & Beauty",
    subcategories: [
      "Hair Stylist",
      "Beautician",
      "Barber",
      "Makeup Artist",
    ],
  },
  {
    name: "Construction",
    subcategories: [
      "Mason",
      "Shuttering",
      "Steel Fixer",
      "Tile Worker",
      "Plaster Worker",
    ],
  },
  {
    name: "Security",
    subcategories: [
      "Security Guard",
      "Night Guard",
      "Gate Keeper",
    ],
  },
  {
    name: "Event Services",
    subcategories: [
      "Event Helper",
      "Decoration",
      "Catering",
      "Event Security",
    ],
  },
] as const;

/* =========================================================
   SERVICES
========================================================= */

const SERVICES_BY_SUBCATEGORY: Record<string, string[]> = {
  "General Labour": [
    "General Work",
    "Loading",
    "Unloading",
    "Material Shifting",
  ],

  "Construction Labour": [
    "Construction Work",
    "Site Helper",
    "Material Shifting",
    "Loading",
    "Unloading",
  ],

  Helper: [
    "Site Helper",
    "Material Handling",
    "Loading",
    "Unloading",
  ],

  Loader: [
    "Loading",
    "Material Shifting",
  ],

  Unloader: [
    "Unloading",
    "Material Shifting",
  ],

  "Car Driver": [
    "Local Driving",
    "Outstation Driving",
    "Pickup & Drop",
  ],

  "Auto Driver": [
    "Local Ride",
    "Pickup & Drop",
  ],

  "Truck Driver": [
    "Goods Transport",
    "Material Transport",
    "Long Distance",
  ],

  "Delivery Driver": [
    "Product Delivery",
    "Material Delivery",
    "Pickup & Drop",
  ],

  "Bike Mechanic": [
    "Bike Repair",
    "Bike Service",
    "Engine Work",
  ],

  "Car Mechanic": [
    "Car Repair",
    "Car Service",
    "Engine Work",
  ],

  "AC Mechanic": [
    "AC Repair",
    "AC Service",
    "AC Installation",
  ],

  "Machine Mechanic": [
    "Machine Repair",
    "Machine Maintenance",
  ],

  "House Painter": [
    "Interior Painting",
    "Exterior Painting",
    "Wall Painting",
  ],

  "Wall Painter": [
    "Wall Painting",
    "Putty",
    "Texture Work",
  ],

  "Commercial Painter": [
    "Commercial Painting",
    "Interior Painting",
    "Exterior Painting",
  ],

  "Car Washer": [
    "Car Washing",
    "Interior Cleaning",
    "Exterior Cleaning",
  ],

  "Bike Washer": [
    "Bike Washing",
    "Cleaning",
    "Polishing",
  ],

  "Home Washer": [
    "Home Cleaning",
    "Deep Cleaning",
    "Bathroom Cleaning",
  ],

  "Office Assistant": [
    "Office Assistance",
    "Documentation",
    "Daily Office Work",
  ],

  "Data Entry": [
    "Data Entry",
    "Computer Work",
    "Documentation",
  ],

  Receptionist: [
    "Front Desk",
    "Customer Handling",
    "Phone Handling",
  ],

  Electrician: [
    "Wiring",
    "Switch Installation",
    "Fan Installation",
    "Electrical Repair",
  ],

  Plumber: [
    "Pipe Repair",
    "Tap Repair",
    "Bathroom Plumbing",
    "Water Tank Work",
  ],

  Carpenter: [
    "Furniture Repair",
    "Door Work",
    "Wood Work",
    "Furniture Making",
  ],

  "AC Repair": [
    "AC Repair",
    "AC Service",
    "AC Installation",
  ],

  "Appliance Repair": [
    "Appliance Repair",
    "Washing Machine Repair",
    "Refrigerator Repair",
  ],

  Cleaning: [
    "Home Cleaning",
    "Office Cleaning",
    "Deep Cleaning",
  ],

  Waiter: [
    "Table Service",
    "Customer Service",
    "Restaurant Service",
  ],

  "Kitchen Helper": [
    "Kitchen Assistance",
    "Food Preparation",
    "Cleaning",
  ],

  Cook: [
    "Cooking",
    "Food Preparation",
    "Kitchen Work",
  ],

  Cleaner: [
    "Cleaning",
    "Kitchen Cleaning",
    "Restaurant Cleaning",
  ],

  "Delivery Staff": [
    "Food Delivery",
    "Order Delivery",
    "Pickup & Drop",
  ],

  "Civil Contractor": [
    "Civil Work",
    "Construction",
    "Renovation",
  ],

  "Renovation Contractor": [
    "Home Renovation",
    "Interior Work",
    "Repair Work",
  ],

  "Building Contractor": [
    "Building Construction",
    "Civil Work",
    "Site Management",
  ],

  "Factory Labour": [
    "Factory Work",
    "Loading",
    "Packing",
  ],

  "Machine Operator": [
    "Machine Operation",
    "Production Work",
    "Machine Handling",
  ],

  "Packing Worker": [
    "Packing",
    "Loading",
    "Material Handling",
  ],

  "Hair Stylist": [
    "Hair Cutting",
    "Hair Styling",
    "Hair Treatment",
  ],

  Beautician: [
    "Facial",
    "Beauty Service",
    "Skin Care",
  ],

  Barber: [
    "Hair Cutting",
    "Beard Styling",
    "Shaving",
  ],

  "Makeup Artist": [
    "Party Makeup",
    "Bridal Makeup",
    "Event Makeup",
  ],

  Mason: [
    "Brick Work",
    "Wall Construction",
    "Plaster",
    "Concrete Work",
  ],

  Shuttering: [
    "Shuttering Work",
    "Formwork",
    "RCC Work",
  ],

  "Steel Fixer": [
    "Steel Binding",
    "Bar Bending",
    "RCC Work",
  ],

  "Tile Worker": [
    "Floor Tiles",
    "Wall Tiles",
    "Bathroom Tiles",
  ],

  "Plaster Worker": [
    "Wall Plaster",
    "Cement Plaster",
    "Finishing",
  ],

  "Security Guard": [
    "Security",
    "Gate Security",
    "Building Security",
  ],

  "Night Guard": [
    "Night Security",
    "Property Security",
  ],

  "Gate Keeper": [
    "Gate Security",
    "Entry Management",
  ],

  "Event Helper": [
    "Event Assistance",
    "Setup",
    "Material Handling",
  ],

  Decoration: [
    "Event Decoration",
    "Stage Decoration",
    "Setup",
  ],

  Catering: [
    "Food Service",
    "Event Catering",
    "Kitchen Assistance",
  ],

  "Event Security": [
    "Event Security",
    "Crowd Management",
  ],
};

/* =========================================================
   LABOUR CHAUKS
========================================================= */

const LABOUR_CHAUKS = [
  {
    id: "karond",
    name: "Karond Labour Chauk",
    area: "Karond, Bhopal",
  },
  {
    id: "minal",
    name: "Minal Labour Chauk",
    area: "Minal, Bhopal",
  },
];

/* =========================================================
   DEFAULT VISIBLE PRICING
========================================================= */

const DEFAULT_VISIBLE_PRICING_TYPES: PriceKey[] = [
  "per_job",
];

/* =========================================================
   EMPTY WORKER
========================================================= */

const emptyWorker = (): WorkerFormData => ({
  name: "",
  phone: "",
  category: "",
  subcategory: "",
  specialty: "",
  services: [],
  displayService: null,
  pricingType: "custom",
  startingPrice: 0,
  halfDayPrice: 0,
  fullDayPrice: 0,
  monthlyPrice: 0,
  visitCharge: 0,
  visiblePricingTypes: [
    ...DEFAULT_VISIBLE_PRICING_TYPES,
  ],
  rating: 0,
  reviewCount: 0,
  location: "",
  labourChauk: "",
  available: true,
  yearsExperience: 0,
  completedJobs: 0,
  bio: "",
  skills: [],
  photo: "",
  responseTime: "Within 1 hour",
  certifications: [],
});

/* =========================================================
   COMPONENT
========================================================= */

export default function WorkerForm({
  initial,
  onSave,
  onClose,
}: WorkerFormProps) {
  const [form, setForm] =
    useState<WorkerFormData>(() => {
      if (!initial) {
        return emptyWorker();
      }

      return {
        name: initial.name || "",
        phone: initial.phone || "",
        category: initial.category || "",
        subcategory: initial.subcategory || "",
        specialty: initial.specialty || "",
        services: initial.services || [],
        displayService:
          initial.displayService ?? null,
        pricingType:
          initial.pricingType || "custom",
        startingPrice:
          initial.startingPrice || 0,
        halfDayPrice:
          initial.halfDayPrice || 0,
        fullDayPrice:
          initial.fullDayPrice || 0,
        monthlyPrice:
          initial.monthlyPrice || 0,
        visitCharge:
          initial.visitCharge || 0,
        visiblePricingTypes:
          initial.visiblePricingTypes?.length
            ? initial.visiblePricingTypes
            : [
                ...DEFAULT_VISIBLE_PRICING_TYPES,
              ],
        rating:
          initial.rating || 0,
        reviewCount:
          initial.reviewCount || 0,
        location:
          initial.location || "",
        labourChauk:
          initial.labourChauk || "",
        available:
          initial.available ?? true,
        yearsExperience:
          initial.yearsExperience || 0,
        completedJobs:
          initial.completedJobs || 0,
        bio:
          initial.bio || "",
        skills:
          initial.skills || [],
        photo:
          initial.photo || "",
        responseTime:
          initial.responseTime ||
          "Within 1 hour",
        certifications:
          initial.certifications || [],
      };
    });

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = <
    K extends keyof WorkerFormData
  >(
    field: K,
    value: WorkerFormData[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     VISIBLE PRICING HANDLER
  ======================================================= */

  const handleVisiblePriceChange = (
    price: PriceKey,
    checked: boolean,
  ) => {
    setForm((previous) => {
      const current =
        previous.visiblePricingTypes || [];

      let updated: PriceKey[];

      if (checked) {
        if (
          current.includes(price)
        ) {
          return previous;
        }

        updated = [
          ...current,
          price,
        ];
      } else {
        updated =
          current.filter(
            (item) =>
              item !== price,
          );
      }

      if (updated.length === 0) {
        return {
          ...previous,
          visiblePricingTypes: [
            "per_job",
          ],
        };
      }

      return {
        ...previous,
        visiblePricingTypes:
          updated,
      };
    });
  };

  /* =======================================================
     CATEGORY
  ======================================================= */

  const selectedCategory =
    useMemo(
      () =>
        WORKER_CATEGORIES.find(
          (category) =>
            category.name ===
            form.category,
        ),
      [form.category],
    );

  /* =======================================================
     SERVICES
  ======================================================= */

  const selectedServices =
    SERVICES_BY_SUBCATEGORY[
      form.subcategory
    ] || [];

  /* =======================================================
     AUTO SPECIALTY
  ======================================================= */

  useEffect(() => {
    if (
      form.subcategory &&
      !form.specialty
    ) {
      setForm((previous) => ({
        ...previous,
        specialty:
          form.subcategory,
      }));
    }
  }, [
    form.subcategory,
    form.specialty,
  ]);

  /* =======================================================
     AUTO PRICING
  ======================================================= */

  useEffect(() => {
    if (!form.category) {
      return;
    }

    let pricingType: Worker["pricingType"] =
      "custom";

    switch (form.category) {
      case "Labour":
      case "Driver":
      case "Construction":
      case "Factory":
      case "Restaurant":
        pricingType = "daily";
        break;

      case "Mechanic":
      case "Home Contractor":
        pricingType =
          "visit_charge";
        break;

      case "Painter":
      case "Home Services":
      case "Event Services":
        pricingType = "per_job";
        break;

      case "Washer":
      case "Salon & Beauty":
        pricingType =
          "per_service";
        break;

      case "Office Worker":
      case "Security":
        pricingType = "monthly";
        break;

      default:
        pricingType = "custom";
    }

    setForm((previous) => {
      if (
        previous.pricingType ===
        pricingType
      ) {
        return previous;
      }

      return {
        ...previous,
        pricingType,
      };
    });
  }, [form.category]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    if (!form.name.trim()) {
      return "Worker name is required";
    }

    if (!form.phone.trim()) {
      return "Mobile number is required";
    }

    if (
      !/^[6-9]\d{9}$/.test(
        form.phone,
      )
    ) {
      return "Enter valid 10 digit mobile number";
    }

    if (!form.category) {
      return "Select worker category";
    }

    if (!form.subcategory) {
      return "Select sub category";
    }

    if (!form.specialty.trim()) {
      return "Specialty is required";
    }

    if (!form.location.trim()) {
      return "Location is required";
    }

    if (!form.labourChauk) {
      return "Select Labour Chauk";
    }

    if (
      !form.startingPrice ||
      form.startingPrice <= 0
    ) {
      return "Starting price is required";
    }

    if (!form.services.length) {
      return "Select at least one service";
    }

    if (
      !form.visiblePricingTypes ||
      form.visiblePricingTypes.length ===
        0
    ) {
      return "Select at least one pricing option";
    }

    return "";
  };

  /* =======================================================
     IMAGE COMPRESSION
  ======================================================= */

  const compressImage = (
    file: File,
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = (event) => {
          const image =
            new Image();

          image.onload = () => {
            const canvas =
              document.createElement(
                "canvas",
              );

            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;

            let width = image.width;
            let height = image.height;

            if (width > MAX_WIDTH) {
              height *=
                MAX_WIDTH / width;
              width = MAX_WIDTH;
            }

            if (height > MAX_HEIGHT) {
              width *=
                MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }

            canvas.width =
              Math.round(width);

            canvas.height =
              Math.round(height);

            const context =
              canvas.getContext(
                "2d",
              );

            if (!context) {
              reject(
                new Error(
                  "Canvas error",
                ),
              );

              return;
            }

            context.drawImage(
              image,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            resolve(
              canvas.toDataURL(
                "image/webp",
                0.75,
              ),
            );
          };

          image.onerror = () => {
            reject(
              new Error(
                "Invalid image",
              ),
            );
          };

          image.src =
            event.target
              ?.result as string;
        };

        reader.onerror = () => {
          reject(
            new Error(
              "File read failed",
            ),
          );
        };

        reader.readAsDataURL(file);
      },
    );
  };

  /* =======================================================
     UPLOAD WORKER PHOTO
  ======================================================= */

  const uploadWorkerPhoto = async (
    file: File,
  ) => {
    setUploadingPhoto(true);
    setError("");

    try {
      const compressed =
        await compressImage(file);

      const blob =
        await fetch(
          compressed,
        ).then((response) =>
          response.blob(),
        );

      const safeName = (
        form.name.trim() ||
        "worker"
      )
        .replace(
          /[^a-zA-Z0-9]/g,
          "-",
        )
        .toLowerCase();

      const category = (
        form.category ||
        "uncategorized"
      )
        .replace(
          /[^a-zA-Z0-9]/g,
          "-",
        )
        .toLowerCase();

      const subcategory = (
        form.subcategory ||
        "general"
      )
        .replace(
          /[^a-zA-Z0-9]/g,
          "-",
        )
        .toLowerCase();

      const filePath =
        `${category}/${subcategory}/${safeName}/profile.webp`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("workers")
          .upload(
            filePath,
            blob,
            {
              contentType:
                "image/webp",
              upsert: true,
            },
          );

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        supabase.storage
          .from("workers")
          .getPublicUrl(
            filePath,
          );

      updateField(
        "photo",
        data.publicUrl,
      );
    } catch (uploadError) {
      console.error(
        "PHOTO UPLOAD ERROR:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Worker photo upload failed",
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError,
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        name: form.name.trim(),
        phone:
          form.phone.trim(),
        category:
          form.category,
        subcategory:
          form.subcategory,
        specialty:
          form.specialty.trim(),
        services:
          form.services,
        displayService:
          form.displayService ?? null,
        pricingType:
          form.pricingType,
        startingPrice:
          Number(
            form.startingPrice,
          ) || 0,
        halfDayPrice:
          Number(
            form.halfDayPrice,
          ) || 0,
        fullDayPrice:
          Number(
            form.fullDayPrice,
          ) || 0,
        monthlyPrice:
          Number(
            form.monthlyPrice,
          ) || 0,
        visitCharge:
          Number(
            form.visitCharge,
          ) || 0,
        visiblePricingTypes:
          form.visiblePricingTypes ||
          [
            ...DEFAULT_VISIBLE_PRICING_TYPES,
          ],
        rating:
          Number(form.rating) ||
          0,
        reviewCount:
          Number(
            form.reviewCount,
          ) || 0,
        location:
          form.location.trim(),
        labourChauk:
          form.labourChauk,
        available:
          form.available ?? true,
        yearsExperience:
          Number(
            form.yearsExperience,
          ) || 0,
        completedJobs:
          Number(
            form.completedJobs,
          ) || 0,
        bio:
          form.bio?.trim() || "",
        skills:
          form.skills,
        photo:
          form.photo || "",
        responseTime:
          form.responseTime ||
          "Within 1 hour",
        certifications:
          form.certifications,
      });
    } catch (saveError) {
      console.error(
        "WORKER FORM SAVE ERROR:",
        saveError,
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save worker",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">

      {/* HEADER */}

      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900">
              {initial
                ? "Edit Worker"
                : "Create New Worker"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {initial
                ? "Update worker information"
                : "Onboard a new worker to Workkerz"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* BODY */}

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">

          {/* ERROR */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                Unable to save worker
              </p>

              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* PROFILE */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="01"
              title="Worker Profile"
              description="Add a clear profile photo"
            />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-slate-100 ring-4 ring-slate-50">
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt={
                      form.name ||
                      "Worker"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserRound className="h-10 w-10 text-slate-300" />
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700">
                  <ImagePlus className="h-4 w-4" />

                  {uploadingPhoto
                    ? "Uploading..."
                    : "Upload Worker Photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={
                      uploadingPhoto
                    }
                    onChange={async (
                      event,
                    ) => {
                      const file =
                        event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      if (
                        file.size >
                        5 *
                          1024 *
                          1024
                      ) {
                        setError(
                          "Image must be smaller than 5MB",
                        );

                        return;
                      }

                      await uploadWorkerPhoto(
                        file,
                      );

                      event.target.value =
                        "";
                    }}
                  />
                </label>

                <p className="text-[10px] text-slate-400">
                  JPG, PNG or WEBP • Max 5MB
                </p>
              </div>
            </div>
          </section>

          {/* PERSONAL */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="02"
              title="Personal Information"
              description="Basic worker details"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                required
                icon={<UserRound />}
              >
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="Enter worker name"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Mobile Number"
                required
                icon={<Phone />}
              >
                <input
                  value={form.phone}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="10 digit mobile number"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Location"
                required
                icon={<MapPin />}
              >
                <input
                  value={form.location}
                  onChange={(e) =>
                    updateField(
                      "location",
                      e.target.value,
                    )
                  }
                  placeholder="Karond, Bhopal"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Labour Chauk"
                required
                icon={<MapPin />}
              >
                <div className="relative">
                  <select
                    value={
                      form.labourChauk
                    }
                    onChange={(e) =>
                      updateField(
                        "labourChauk",
                        e.target.value,
                      )
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">
                      Select Labour Chauk
                    </option>

                    {LABOUR_CHAUKS.map(
                      (chauk) => (
                        <option
                          key={
                            chauk.id
                          }
                          value={
                            chauk.id
                          }
                        >
                          {chauk.name} —{" "}
                          {chauk.area}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>
            </div>
          </section>

          {/* WORK */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="03"
              title="Work Information"
              description="Choose category, expertise and skills"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Category"
                required
              >
                <div className="relative">
                  <select
                    value={
                      form.category
                    }
                    onChange={(e) => {
                      const category =
                        e.target.value;

                      setForm(
                        (previous) => ({
                          ...previous,
                          category,
                          subcategory:
                            "",
                          specialty:
                            "",
                          services: [],
                        }),
                      );
                    }}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value="">
                      Select Category
                    </option>

                    {WORKER_CATEGORIES.map(
                      (category) => (
                        <option
                          key={
                            category.name
                          }
                          value={
                            category.name
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field
                label="Sub Category"
                required
              >
                <div className="relative">
                  <select
                    value={
                      form.subcategory
                    }
                    disabled={
                      !form.category
                    }
                    onChange={(e) =>
                      updateField(
                        "subcategory",
                        e.target.value,
                      )
                    }
                    className={`${inputClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                  >
                    <option value="">
                      Select Sub Category
                    </option>

                    {selectedCategory?.subcategories.map(
                      (
                        subcategory,
                      ) => (
                        <option
                          key={
                            subcategory
                          }
                          value={
                            subcategory
                          }
                        >
                          {
                            subcategory
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field
                label="Specialty"
                required
              >
                <input
                  value={
                    form.specialty
                  }
                  onChange={(e) =>
                    updateField(
                      "specialty",
                      e.target.value,
                    )
                  }
                  placeholder="e.g. Brick Mason"
                  className={inputClass}
                />
              </Field>

              <Field label="Skills">
                <input
                  value={form.skills.join(
                    ", ",
                  )}
                  onChange={(e) =>
                    updateField(
                      "skills",
                      e.target.value
                        .split(",")
                        .map(
                          (item) =>
                            item.trim(),
                        )
                        .filter(
                          Boolean,
                        ),
                    )
                  }
                  placeholder="Brick work, plaster, concrete"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* SERVICES */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="04"
              title="Services Offered"
              description="Select services this worker provides"
            />

            {selectedServices.length >
            0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {selectedServices.map(
                  (service) => {
                    const active =
                      form.services.includes(
                        service,
                      );

                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          const current =
                            form.services;

                          updateField(
                            "services",
                            active
                              ? current.filter(
                                  (
                                    item,
                                  ) =>
                                    item !==
                                    service,
                                )
                              : [
                                  ...current,
                                  service,
                                ],
                          );
                        }}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-bold transition ${
                          active
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                        }`}
                      >
                        <span>
                          {service}
                        </span>

                        {active && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  Select a sub category first
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Available services will appear here
                </p>
              </div>
            )}
          </section>

          {/* PRICING */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="05"
              title="Pricing & Experience"
              description="Set worker rates and experience"
            />

            {/* VISIBLE PRICING OPTIONS */}

            <div className="mb-5">
              <p className="mb-2 text-xs font-bold text-slate-600">
                Pricing Options
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    value:
                      "per_job" as PriceKey,
                    label: "Per Work",
                  },
                  {
                    value:
                      "half_day" as PriceKey,
                    label: "Half Day",
                  },
                  {
                    value:
                      "full_day" as PriceKey,
                    label: "Full Day",
                  },
                  {
                    value:
                      "monthly" as PriceKey,
                    label: "Monthly",
                  },
                  {
                    value:
                      "visit_charge" as PriceKey,
                    label: "Visit Charge",
                  },
                ].map(
                  (option) => {
                    const selected =
                      form.visiblePricingTypes.includes(
                        option.value,
                      );

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          handleVisiblePriceChange(
                            option.value,
                            !selected,
                          )
                        }
                        className={[
                          "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition",
                          selected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                        ].join(
                          " ",
                        )}
                      >
                        <span
                          className={[
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                            selected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white",
                          ].join(
                            " ",
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                        </span>

                        <span className="truncate">
                          {
                            option.label
                          }
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Pricing Type">
                <select
                  value={
                    form.pricingType
                  }
                  onChange={(e) =>
                    updateField(
                      "pricingType",
                      e.target
                        .value as Worker["pricingType"],
                    )
                  }
                  className={inputClass}
                >
                  <option value="per_job">
                    Per Work
                  </option>

                  <option value="daily">
                    Daily
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="per_service">
                    Per Service
                  </option>

                  <option value="visit_charge">
                    Visit Charge
                  </option>

                  <option value="custom">
                    Custom Quote
                  </option>
                </select>
              </Field>

              {form.visiblePricingTypes.includes(
                "per_job",
              ) && (
                <Field
                  label="Starting Price"
                  required
                >
                  <PriceInput
                    value={
                      form.startingPrice
                    }
                    onChange={(value) =>
                      updateField(
                        "startingPrice",
                        value,
                      )
                    }
                  />
                </Field>
              )}

              {form.visiblePricingTypes.includes(
                "half_day",
              ) && (
                <Field label="Half Day Price">
                  <PriceInput
                    value={
                      form.halfDayPrice
                    }
                    onChange={(value) =>
                      updateField(
                        "halfDayPrice",
                        value,
                      )
                    }
                  />
                </Field>
              )}

              {form.visiblePricingTypes.includes(
                "full_day",
              ) && (
                <Field label="Full Day Price">
                  <PriceInput
                    value={
                      form.fullDayPrice
                    }
                    onChange={(value) =>
                      updateField(
                        "fullDayPrice",
                        value,
                      )
                    }
                  />
                </Field>
              )}

              {form.visiblePricingTypes.includes(
                "monthly",
              ) && (
                <Field label="Monthly Price">
                  <PriceInput
                    value={
                      form.monthlyPrice
                    }
                    onChange={(value) =>
                      updateField(
                        "monthlyPrice",
                        value,
                      )
                    }
                  />
                </Field>
              )}

              {form.visiblePricingTypes.includes(
                "visit_charge",
              ) && (
                <Field label="Visit Charge">
                  <PriceInput
                    value={
                      form.visitCharge
                    }
                    onChange={(value) =>
                      updateField(
                        "visitCharge",
                        value,
                      )
                    }
                  />
                </Field>
              )}

              <Field label="Experience">
                <input
                  type="number"
                  min={0}
                  value={
                    form.yearsExperience ||
                    ""
                  }
                  onChange={(e) =>
                    updateField(
                      "yearsExperience",
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                  placeholder="Years"
                  className={inputClass}
                />
              </Field>

              <Field label="Jobs Completed">
                <input
                  type="number"
                  min={0}
                  value={
                    form.completedJobs ||
                    ""
                  }
                  onChange={(e) =>
                    updateField(
                      "completedJobs",
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* AVAILABILITY */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">
                  Available Now
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Worker can receive new bookings
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "available",
                    !form.available,
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  form.available
                    ? "bg-emerald-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.available
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* ABOUT */}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionTitle
              step="06"
              title="About Worker"
              description="Add a short professional introduction"
            />

            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) =>
                updateField(
                  "bio",
                  e.target.value,
                )
              }
              placeholder="Experienced worker with expertise in..."
              className={`${inputClass} resize-none`}
            />
          </section>
        </div>
      </main>

      {/* FOOTER */}

      <footer className="flex shrink-0 gap-3 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            saving ||
            uploadingPhoto
          }
          className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving Worker..."
            : initial
              ? "Save Changes"
              : "Onboard Worker"}
        </button>
      </footer>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">
        Step {step}
      </span>

      <h3 className="mt-2 text-lg font-black tracking-tight text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
        {icon && (
          <span className="text-slate-400 [&>svg]:h-3.5 [&>svg]:w-3.5">
            {icon}
          </span>
        )}

        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

/* =========================================================
   PRICE INPUT
========================================================= */

function PriceInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) =>
          onChange(
            Number(
              e.target.value,
            ) || 0,
          )
        }
        placeholder="0"
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400";