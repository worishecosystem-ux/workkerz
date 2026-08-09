"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import * as XLSX from "xlsx";

import {
  Check,
  ChevronDown,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Store,
  Upload,
  User,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* ======================================================
   INPUT STYLE
====================================================== */

const inp =
  "h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] px-3.5 text-sm text-[#0F172A] outline-none transition-all placeholder:text-gray-400 focus:border-[#0EA5E9] focus:bg-white focus:ring-2 focus:ring-sky-100 sm:h-12 sm:rounded-2xl sm:px-4";

/* ======================================================
   SHOP CATEGORIES
====================================================== */

const SHOP_CATEGORIES = [
  "Construction Material",
  "Cement",
  "Sand & Aggregate",
  "Bricks",
  "TMT & Steel",
  "Paint",
  "Plumbing",
  "Electrical",
  "Tiles",
  "Hardware",
  "Tools",
  "Safety Equipment",
  "Wood & Timber",
  "Glass",
  "Plywood",
  "Other",
];

/* ======================================================
   FORM TYPE
====================================================== */

type ShopForm = {
  shop_name: string;
  owner_name: string;
  phone: string;
  category: string;
  city: string;
  address: string;
  logo: string;
};

/* ======================================================
   DEFAULT FORM
====================================================== */

const EMPTY_FORM: ShopForm = {
  shop_name: "",
  owner_name: "",
  phone: "",
  category: "",
  city: "",
  address: "",
  logo: "",
};

/* ======================================================
   HELPERS
====================================================== */

function getCode(value: string, fallback: string) {
  return (
    String(value || fallback)
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 3)
      .padEnd(3, "X") || fallback
  );
}

function getDateCode(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function normalizePhone(value: unknown) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(-10);
}

function isValidPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

function createShopUID(
  city: string,
  category: string,
  serialNo: number,
  date = new Date(),
) {
  const cityCode = getCode(city, "IND");
  const categoryCode = getCode(category, "GEN");
  const dateCode = getDateCode(date);

  return `EA-${cityCode}-${categoryCode}-${dateCode}-${String(
    serialNo,
  ).padStart(4, "0")}`;
}

/* ======================================================
   UPLOAD LOGO
====================================================== */

async function uploadLogo(file: File) {
  const ext =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("shop-logos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("shop-logos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* ======================================================
   COMPONENT
====================================================== */

export default function ShopRegistrationForm({
  editingShop,
  onSuccess,
}: {
  editingShop?: any;
  onSuccess?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingExcel, setUploadingExcel] =
    useState(false);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [mode, setMode] =
    useState<"manual" | "excel">("manual");

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [form, setForm] =
    useState<ShopForm>(EMPTY_FORM);

  /* ======================================================
     EDIT MODE
  ====================================================== */

  useEffect(() => {
    if (!editingShop) {
      return;
    }

    setForm({
      shop_name: editingShop.shop_name || "",
      owner_name: editingShop.owner_name || "",
      phone: normalizePhone(editingShop.phone),
      category: editingShop.category || "",
      city: editingShop.city || "",
      address: editingShop.address || "",
      logo: editingShop.logo || "",
    });

    setLogoFile(null);
    setMode("manual");
  }, [editingShop]);

  /* ======================================================
     UPDATE FIELD
  ====================================================== */

  const updateField = (
    key: keyof ShopForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* ======================================================
     LOGO SELECT
  ====================================================== */

  const handleLogoSelect = (
    file: File | undefined,
  ) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Logo must be less than 5 MB.");
      return;
    }

    if (form.logo.startsWith("blob:")) {
      URL.revokeObjectURL(form.logo);
    }

    const preview = URL.createObjectURL(file);

    setLogoFile(file);

    setForm((current) => ({
      ...current,
      logo: preview,
    }));
  };

  /* ======================================================
     REMOVE LOGO
  ====================================================== */

  const removeLogo = () => {
    if (form.logo.startsWith("blob:")) {
      URL.revokeObjectURL(form.logo);
    }

    setLogoFile(null);

    setForm((current) => ({
      ...current,
      logo: "",
    }));
  };

  /* ======================================================
     SAVE SHOP
  ====================================================== */

  async function handleSave() {
    const shopName = form.shop_name.trim();
    const ownerName = form.owner_name.trim();
    const phone = normalizePhone(form.phone);
    const category = form.category.trim();
    const city = form.city.trim();
    const address = form.address.trim();

    if (!shopName || !ownerName || !phone) {
      alert(
        "Please fill Shop Name, Owner Name and Phone Number.",
      );
      return;
    }

    if (!isValidPhone(phone)) {
      alert(
        "Please enter a valid 10 digit mobile number.",
      );
      return;
    }

    try {
      setSaving(true);

      let logoUrl = editingShop?.logo || "";

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      /* ==================================================
         UPDATE EXISTING SHOP
      ================================================== */

      if (editingShop) {
        const { error } = await supabase
          .from("shops")
          .update({
            shop_name: shopName,
            owner_name: ownerName,
            phone,
            category,
            city,
            address,
            logo: logoUrl,
          })
          .eq("id", editingShop.id);

        if (error) {
          console.error(
            "SHOP UPDATE ERROR:",
            error,
          );

          alert("Failed to update shop.");
          return;
        }

        alert("Shop updated successfully.");

        onSuccess?.();

        return;
      }

      /* ==================================================
         GET TOTAL SHOPS
      ================================================== */

      const { count, error: countError } =
        await supabase
          .from("shops")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (countError) {
        console.error(
          "SHOP COUNT ERROR:",
          countError,
        );

        alert("Unable to generate Shop ID.");
        return;
      }

      const serialNo = (count || 0) + 1;

      /* ==================================================
         SHOP UID
      ================================================== */

      const now = new Date();

      const shopUID = createShopUID(
        city,
        category,
        serialNo,
        now,
      );

      /* ==================================================
         INSERT
      ================================================== */

      const { error } = await supabase
        .from("shops")
        .insert({
          shop_name: shopName,
          owner_name: ownerName,
          phone,
          category,
          city,
          address,
          logo: logoUrl,
          shop_uid: shopUID,
          serial_no: serialNo,
          joined_date: now.toISOString(),
          status: "online",
        });

      if (error) {
        console.error(
          "SHOP INSERT ERROR:",
          error,
        );

        alert(
          error.message ||
            "Failed to register shop.",
        );

        return;
      }

      alert(
        `Shop Registered Successfully\n\nShop ID:\n${shopUID}`,
      );

      if (form.logo.startsWith("blob:")) {
        URL.revokeObjectURL(form.logo);
      }

      setForm(EMPTY_FORM);
      setLogoFile(null);

      onSuccess?.();
    } catch (error) {
      console.error(
        "SHOP SAVE ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ======================================================
     EXCEL IMPORT
  ====================================================== */

  async function handleExcelUpload(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingExcel(true);

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
      });

      if (!workbook.SheetNames.length) {
        alert("Excel file contains no sheets.");
        return;
      }

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const jsonData =
        XLSX.utils.sheet_to_json<any>(
          sheet,
          {
            defval: "",
          },
        );

      if (!jsonData.length) {
        alert("Excel file is empty.");
        return;
      }

      /* ==================================================
         GET CURRENT SERIAL
      ================================================== */

      const { count, error: countError } =
        await supabase
          .from("shops")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (countError) {
        console.error(
          "EXCEL COUNT ERROR:",
          countError,
        );

        alert(
          "Unable to determine shop serial number.",
        );

        return;
      }

      let currentSerial = count || 0;

      /* ==================================================
         FORMAT EXCEL DATA
      ================================================== */

     type ExcelShop = {
  shop_name: string;
  owner_name: string;
  phone: string;
  category: string;
  city: string;
  address: string;
  logo: string;
  status: string;
  serial_no: number;
  shop_uid: string;
  joined_date: string;
};

const formattedData: ExcelShop[] = [];

for (const row of jsonData) {
  const shopName = String(
    row["Shop Name"] ?? "",
  ).trim();

  const ownerName = String(
    row["Shop Owner Name"] ?? "",
  ).trim();

  const phone = normalizePhone(
    row["Mobile Number"],
  );

  const city = String(
    row["City"] ?? "",
  ).trim();

  const category = String(
    row["What do you sell?"] ?? "",
  ).trim();

  const address = String(
    row["Shop Address"] ?? "",
  ).trim();

  const logo = String(
    row["Upload Shop Photo"] ?? "",
  ).trim();

  /* ================================================
     VALIDATE ROW
  ================================================= */

  if (
    !shopName ||
    !ownerName ||
    !phone
  ) {
    continue;
  }

  if (!isValidPhone(phone)) {
    continue;
  }

  /* ================================================
     SERIAL
  ================================================= */

  currentSerial += 1;

  const now = new Date();

  /* ================================================
     PUSH VALID SHOP
  ================================================= */

  formattedData.push({
    shop_name: shopName,

    owner_name: ownerName,

    phone,

    category,

    city,

    address,

    logo,

    status: "online",

    serial_no: currentSerial,

    shop_uid: createShopUID(
      city,
      category,
      currentSerial,
      now,
    ),

    joined_date:
      now.toISOString(),
  });
}

      if (!formattedData.length) {
        alert(
          "No valid shop data found.\n\nRequired columns:\n• Shop Name\n• Shop Owner Name\n• Mobile Number",
        );

        return;
      }

      /* ==================================================
         INSERT IN BATCHES
      ================================================== */

      const BATCH_SIZE = 100;

      for (
        let i = 0;
        i < formattedData.length;
        i += BATCH_SIZE
      ) {
        const batch =
          formattedData.slice(
            i,
            i + BATCH_SIZE,
          );

        const { error } =
          await supabase
            .from("shops")
            .insert(batch);

        if (error) {
          console.error(
            "EXCEL INSERT ERROR:",
            error,
          );

          alert(
            `Excel upload failed.\n\n${error.message}`,
          );

          return;
        }
      }

      alert(
        `${formattedData.length} shops imported successfully.`,
      );

      onSuccess?.();

      e.target.value = "";
    } catch (error) {
      console.error(
        "EXCEL IMPORT ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to process Excel file.",
      );
    } finally {
      setUploadingExcel(false);
    }
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

        {/* ==================================================
            MODE SWITCHER
        ================================================== */}

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-2">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">

            <ModeButton
              active={mode === "manual"}
              icon={Store}
              label="Manual Add"
              onClick={() => {
                setMode("manual");
                setCategoryOpen(false);
              }}
            />

            <ModeButton
              active={mode === "excel"}
              icon={FileSpreadsheet}
              label="Import Excel"
              onClick={() => {
                setMode("excel");
                setCategoryOpen(false);
              }}
            />

          </div>
        </div>

        {/* ==================================================
            EXCEL
        ================================================== */}

        {mode === "excel" && (
          <section className="rounded-2xl border border-dashed border-sky-300 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8 lg:p-12">
            <div className="mx-auto max-w-lg text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 sm:h-20 sm:w-20 sm:rounded-3xl">
                <FileSpreadsheet className="h-7 w-7 text-[#0EA5E9] sm:h-9 sm:w-9" />
              </div>

              <h3 className="mt-5 text-xl font-black text-[#0F172A] sm:text-2xl">
                Import Shops
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-gray-500 sm:text-sm">
                Upload an Excel or CSV file to
                register multiple shops at once.
              </p>

              <label className="mx-auto mt-6 flex h-11 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] px-5 text-xs font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-[#0284C7] sm:h-12 sm:rounded-2xl sm:text-sm">

                {uploadingExcel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                {uploadingExcel
                  ? "Importing..."
                  : "Choose Excel File"}

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  hidden
                  disabled={uploadingExcel}
                  onChange={
                    handleExcelUpload
                  }
                />

              </label>

              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-left sm:rounded-2xl sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
                  Required columns
                </p>

                <div className="mt-2 grid grid-cols-1 gap-1 text-[10px] text-gray-500 sm:text-xs">
                  <span>• Shop Name</span>
                  <span>• Shop Owner Name</span>
                  <span>• Mobile Number</span>
                  <span>• What do you sell?</span>
                  <span>• City</span>
                  <span>• Shop Address</span>
                  <span>• Upload Shop Photo</span>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-gray-400 sm:text-xs">
                Supported: XLSX, XLS, CSV
              </p>

            </div>
          </section>
        )}

        {/* ==================================================
            MANUAL
        ================================================== */}

        {mode === "manual" && (
          <section className="overflow-visible rounded-2xl border border-gray-100 bg-white shadow-sm sm:rounded-3xl">

            {/* HEADER */}

            <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Store className="h-5 w-5 text-[#0EA5E9] sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-[#0F172A] sm:text-lg">
                    {editingShop
                      ? "Edit Shop"
                      : "Shop Information"}
                  </h3>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-sm">
                    Basic details about the shop
                  </p>
                </div>

              </div>
            </div>

            {/* FORM */}

            <div className="p-4 sm:p-6">

              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

                <FormInput
                  label="Shop Name"
                  icon={Store}
                  required
                  value={form.shop_name}
                  onChange={(value) =>
                    updateField(
                      "shop_name",
                      value,
                    )
                  }
                  placeholder="Enter shop name"
                />

                <FormInput
                  label="Owner Name"
                  icon={User}
                  required
                  value={form.owner_name}
                  onChange={(value) =>
                    updateField(
                      "owner_name",
                      value,
                    )
                  }
                  placeholder="Enter owner name"
                />

                <FormInput
                  label="Phone Number"
                  icon={Phone}
                  required
                  value={form.phone}
                  onChange={(value) =>
                    updateField(
                      "phone",
                      normalizePhone(
                        value,
                      ),
                    )
                  }
                  placeholder="10 digit mobile number"
                  type="tel"
                  inputMode="numeric"
                />

                <FormInput
                  label="City"
                  icon={MapPin}
                  value={form.city}
                  onChange={(value) =>
                    updateField(
                      "city",
                      value,
                    )
                  }
                  placeholder="e.g. Gwalior"
                />

                <CategoryDropdown
                  value={form.category}
                  onChange={(value) =>
                    updateField(
                      "category",
                      value,
                    )
                  }
                  open={categoryOpen}
                  setOpen={
                    setCategoryOpen
                  }
                />

                <LogoUpload
                  logo={form.logo}
                  onSelect={
                    handleLogoSelect
                  }
                  onRemove={removeLogo}
                />

              </div>

              {/* ADDRESS */}

              <div className="mt-4 sm:mt-5">
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
                  Shop Address
                </label>

                <textarea
                  rows={4}
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value,
                    )
                  }
                  placeholder="Enter complete shop address"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F8FAFC] px-3.5 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#0EA5E9] focus:bg-white focus:ring-2 focus:ring-sky-100 sm:rounded-2xl sm:px-4 sm:py-4"
                />
              </div>
            </div>

            {/* ACTIONS */}

            <div className="sticky bottom-0 z-20 flex gap-2 border-t border-gray-100 bg-white/95 p-3 backdrop-blur sm:static sm:justify-end sm:bg-white sm:px-6 sm:py-5">

              {editingShop && (
                <button
                  type="button"
                  onClick={onSuccess}
                  disabled={saving}
                  className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 sm:h-11 sm:flex-none sm:px-6 sm:text-sm"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] px-4 text-xs font-bold text-white shadow-md shadow-sky-100 transition hover:bg-[#0284C7] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:flex-none sm:px-8 sm:text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    <span>
                      {editingShop
                        ? "Updating..."
                        : "Saving..."}
                    </span>
                  </>
                ) : (
                  <span>
                    {editingShop
                      ? "Update Shop"
                      : "Register Shop"}
                  </span>
                )}
              </button>

            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   MODE BUTTON
====================================================== */

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Store;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        text-xs
        font-bold
        transition-all
        sm:h-12
        sm:rounded-2xl
        sm:text-sm
        ${
          active
            ? "bg-[#0EA5E9] text-white shadow-md shadow-sky-100"
            : "text-gray-600 hover:bg-gray-50"
        }
      `}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

/* ======================================================
   FORM INPUT
====================================================== */

function FormInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  inputMode,
}: {
  label: string;
  icon: typeof Store;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  inputMode?:
    | "text"
    | "tel"
    | "numeric";
}) {
  return (
    <div className="min-w-0">

      <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">

        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3.5" />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          placeholder={placeholder}
          inputMode={inputMode}
          className={`${inp} pl-9 sm:pl-10`}
        />

      </div>
    </div>
  );
}

/* ======================================================
   CATEGORY DROPDOWN
====================================================== */

function CategoryDropdown({
  value,
  onChange,
  open,
  setOpen,
}: {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  /* ====================================================
     CLOSE OUTSIDE
  ==================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutside = (
      event: MouseEvent,
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside,
      );
    };
  }, [open, setOpen]);

  return (
    <div
      ref={dropdownRef}
      className="relative min-w-0"
    >
      <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
        Shop Category
      </label>

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className={`
          flex
          h-11
          w-full
          items-center
          justify-between
          rounded-xl
          border
          bg-[#F8FAFC]
          px-3.5
          text-left
          text-sm
          font-medium
          outline-none
          transition
          sm:h-12
          sm:rounded-2xl
          sm:px-4
          ${
            open
              ? "border-[#0EA5E9] bg-white ring-2 ring-sky-100"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <div className="flex min-w-0 items-center gap-2">

          <Store className="h-4 w-4 shrink-0 text-gray-400" />

          <span
            className={`truncate ${
              value
                ? "text-[#0F172A]"
                : "text-gray-400"
            }`}
          >
            {value ||
              "Select category"}
          </span>

        </div>

        <ChevronDown
          className={`
            h-4
            w-4
            shrink-0
            text-gray-400
            transition-transform
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_15px_40px_rgba(15,23,42,0.14)]">

          {SHOP_CATEGORIES.map(
            (category) => {
              const selected =
                value === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    onChange(
                      category,
                    );

                    setOpen(false);
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-xs
                    font-semibold
                    transition
                    sm:text-sm
                    ${
                      selected
                        ? "bg-sky-50 text-[#0284C7]"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="truncate">
                    {category}
                  </span>

                  {selected && (
                    <Check className="h-4 w-4 shrink-0 text-[#0EA5E9]" />
                  )}
                </button>
              );
            },
          )}

        </div>
      )}
    </div>
  );
}

/* ======================================================
   LOGO UPLOAD
====================================================== */

function LogoUpload({
  logo,
  onSelect,
  onRemove,
}: {
  logo: string;
  onSelect: (
    file: File | undefined,
  ) => void;
  onRemove: () => void;
}) {
  return (
    <div className="min-w-0">

      <label className="mb-1.5 block text-xs font-semibold text-gray-700 sm:mb-2 sm:text-sm">
        Shop Logo
      </label>

      <div className="flex min-h-11 items-center gap-3 rounded-xl border border-gray-200 bg-[#F8FAFC] p-2 sm:min-h-12 sm:rounded-2xl sm:p-2.5">

        {logo ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white sm:h-10 sm:w-10">

            <img
              src={logo}
              alt="Shop logo"
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={onRemove}
              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-md bg-red-500 text-white transition hover:bg-red-600"
            >
              <X className="h-2.5 w-2.5" />
            </button>

          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 sm:h-10 sm:w-10">
            <ImagePlus className="h-4 w-4 text-[#0EA5E9]" />
          </div>
        )}

        <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2">

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-gray-700 sm:text-xs">
              {logo
                ? "Logo selected"
                : "Upload shop logo"}
            </p>

            <p className="truncate text-[9px] text-gray-400 sm:text-[10px]">
              JPG, PNG, WebP • Max 5 MB
            </p>
          </div>

          <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#0EA5E9] shadow-sm ring-1 ring-gray-200 sm:px-3 sm:text-xs">
            Choose
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) =>
              onSelect(
                event.target.files?.[0],
              )
            }
          />

        </label>
      </div>
    </div>
  );
}