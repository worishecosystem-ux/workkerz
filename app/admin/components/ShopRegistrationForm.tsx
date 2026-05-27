"use client";

import { useEffect, useState } from "react";

import * as XLSX from "xlsx";

import { Store, Upload } from "lucide-react";

import { supabase } from "@/lib/supabase";

/* ====================================================== */

const inp =
  "w-full h-12 rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 text-sm outline-none focus:border-[#0EA5E9] focus:bg-white transition-all";

/* ====================================================== */

function fixDriveImage(url?: string) {
  if (!url || url.trim() === "") {
    return "";
  }

  const cleanUrl = url.trim();

  if (!cleanUrl.includes("drive.google.com")) {
    return cleanUrl;
  }

  let fileId = "";

  const openMatch =
    cleanUrl.match(/open\?id=([^&]+)/);

  if (openMatch?.[1]) {
    fileId = openMatch[1];
  }

  if (!fileId) {
    const fileMatch =
      cleanUrl.match(
        /\/file\/d\/([^/]+)/,
      );

    if (fileMatch?.[1]) {
      fileId = fileMatch[1];
    }
  }

  if (!fileId) {
    const thumbMatch =
      cleanUrl.match(
        /thumbnail\?id=([^&]+)/,
      );

    if (thumbMatch?.[1]) {
      fileId = thumbMatch[1];
    }
  }

  if (!fileId) {
    const genericMatch =
      cleanUrl.match(/id=([^&]+)/);

    if (genericMatch?.[1]) {
      fileId = genericMatch[1];
    }
  }

  if (!fileId) {
    return cleanUrl;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/* ====================================================== */

export default function ShopRegistrationForm({
  editingShop,
  onSuccess,
}: {
  editingShop?: any;

  onSuccess?: () => void;
}) {
  const [saving, setSaving] =
    useState(false);

  const [
    uploadingExcel,
    setUploadingExcel,
  ] = useState(false);

  const [mode, setMode] = useState<
    "manual" | "excel"
  >("manual");

  const [form, setForm] = useState({
    shop_name: "",

    owner_name: "",

    phone: "",

    category: "",

    city: "",

    address: "",

    logo: "",
  });

  /* ====================================================== */
  /* EDIT MODE */
  /* ====================================================== */

  useEffect(() => {
    if (editingShop) {
      setForm({
        shop_name:
          editingShop.shop_name || "",

        owner_name:
          editingShop.owner_name || "",

        phone:
          editingShop.phone || "",

        category:
          editingShop.category || "",

        city:
          editingShop.city || "",

        address:
          editingShop.address || "",

        logo:
          editingShop.logo || "",
      });
    }
  }, [editingShop]);

  /* ====================================================== */
  /* SAVE SHOP */
  /* ====================================================== */

  async function handleSave() {
    if (
      !form.shop_name.trim() ||
      !form.owner_name.trim() ||
      !form.phone.trim()
    ) {
      alert("Fill all required fields");

      return;
    }

    try {
      setSaving(true);

      /* ====================================================== */
      /* UPDATE SHOP */
      /* ====================================================== */

      if (editingShop) {
        const { error } =
          await supabase
            .from("shops")
            .update({
              shop_name:
                form.shop_name,

              owner_name:
                form.owner_name,

              phone:
                form.phone,

              category:
                form.category,

              city:
                form.city,

              address:
                form.address,

              logo:
                fixDriveImage(
                  form.logo,
                ),
            })
            .eq(
              "id",
              editingShop.id,
            );

        if (error) {
          console.log(error);

          alert(
            "Failed to update shop",
          );

          return;
        }

        alert(
          "Shop updated successfully",
        );

        onSuccess?.();

        return;
      }

      /* ====================================================== */
      /* TOTAL SHOPS */
      /* ====================================================== */

      const { count } =
        await supabase
          .from("shops")
          .select("*", {
            count: "exact",
            head: true,
          });

      const serialNo =
        (count || 0) + 1;

      /* ====================================================== */
      /* DATE */
      /* ====================================================== */

      const now = new Date();

      const joinedDate =
        now.toISOString();

      const year = String(
        now.getFullYear(),
      ).slice(-2);

      const month = String(
        now.getMonth() + 1,
      ).padStart(2, "0");

      const day = String(
        now.getDate(),
      ).padStart(2, "0");

      const dateCode = `${year}${month}${day}`;

      /* ====================================================== */
      /* CITY CODE */
      /* ====================================================== */

      const cityCode = (
        form.city || "IND"
      )
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, "X");

      /* ====================================================== */
      /* CATEGORY CODE */
      /* ====================================================== */

      const categoryCode = (
        form.category || "GEN"
      )
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, "X");

      /* ====================================================== */
      /* UNIQUE SHOP ID */
      /* ====================================================== */

      const shopUID = `EA-${cityCode}-${categoryCode}-${dateCode}-${String(
        serialNo,
      ).padStart(4, "0")}`;

      /* ====================================================== */
      /* SAVE */
      /* ====================================================== */

      const { error } =
        await supabase
          .from("shops")
          .insert([
            {
              ...form,

              logo:
                fixDriveImage(
                  form.logo,
                ),

              shop_uid:
                shopUID,

              serial_no:
                serialNo,

              joined_date:
                joinedDate,

              status: "online",
            },
          ]);

      if (error) {
        console.log(error);

        alert(
          "Failed to register shop",
        );

        return;
      }

      /* ====================================================== */
      /* SUCCESS */
      /* ====================================================== */

      alert(`Shop Registered Successfully

Shop ID:
${shopUID}`);

      /* ====================================================== */
      /* RESET */
      /* ====================================================== */

      setForm({
        shop_name: "",

        owner_name: "",

        phone: "",

        category: "",

        city: "",

        address: "",

        logo: "",
      });

      onSuccess?.();
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  }

  /* ====================================================== */
  /* EXCEL IMPORT */
  /* ====================================================== */

  async function handleExcelUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    try {
      setUploadingExcel(true);

      const file =
        e.target.files?.[0];

      if (!file) return;

      const data =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(data);

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const jsonData: any[] =
        XLSX.utils.sheet_to_json(
          sheet,
        );

      if (
        !jsonData ||
        jsonData.length === 0
      ) {
        alert(
          "Excel file is empty",
        );

        return;
      }

      const { count } =
        await supabase
          .from("shops")
          .select("*", {
            count: "exact",
            head: true,
          });

      let currentCount =
        count || 0;

      const formattedData =
        jsonData.map(
          (row, index) => {
            currentCount += 1;

            const now =
              new Date();

            const year =
              String(
                now.getFullYear(),
              ).slice(-2);

            const month =
              String(
                now.getMonth() + 1,
              ).padStart(
                2,
                "0",
              );

            const day =
              String(
                now.getDate(),
              ).padStart(
                2,
                "0",
              );

            const dateCode = `${year}${month}${day}`;

            const city =
              row["City"] ||
              "IND";

            const cityCode =
              city
                .replace(
                  /[^A-Za-z]/g,
                  "",
                )
                .toUpperCase()
                .slice(0, 3)
                .padEnd(
                  3,
                  "X",
                );

            const category =
              row[
                "What do you sell?"
              ] || "GEN";

            const categoryCode =
              category
                .replace(
                  /[^A-Za-z]/g,
                  "",
                )
                .toUpperCase()
                .slice(0, 3)
                .padEnd(
                  3,
                  "X",
                );

            const shopUID = `EA-${cityCode}-${categoryCode}-${dateCode}-${String(
              currentCount,
            ).padStart(4, "0")}`;

            return {
              shop_name:
                row[
                  "Shop Name"
                ] || "",

              owner_name:
                row[
                  "Shop Owner Name"
                ] || "",

              phone: String(
                row[
                  "Mobile Number"
                ] || "",
              ),

              category,

              city,

              address:
                row[
                  "Shop Address"
                ] || "",

              logo:
                fixDriveImage(
                  row[
                    "Upload Shop Photo"
                  ] || "",
                ),

              status: "online",

              serial_no:
                currentCount,

              shop_uid:
                shopUID,

              joined_date:
                now.toISOString(),
            };
          },
        );

      const validData =
        formattedData.filter(
          (shop) =>
            shop.shop_name &&
            shop.owner_name &&
            shop.phone,
        );

      if (
        validData.length === 0
      ) {
        alert(
          "No valid shop data found",
        );

        return;
      }

      const { error } =
        await supabase
          .from("shops")
          .insert(validData);

      if (error) {
        console.log(error);

        alert(
          "Excel upload failed",
        );

        return;
      }

      alert(
        `${validData.length} shops imported successfully`,
      );

      onSuccess?.();

      e.target.value = "";
    } catch (err) {
      console.log(err);

      alert(
        "Failed to process Excel file",
      );
    } finally {
      setUploadingExcel(false);
    }
  }

  /* ====================================================== */

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="p-7">
        {/* MODE BUTTONS */}

        <div className="bg-white p-2 rounded-2xl border border-gray-200 grid grid-cols-2 gap-2 mb-8 shadow-sm">
          <button
            onClick={() =>
              setMode("manual")
            }
            className={`h-12 rounded-xl text-sm font-bold transition-all ${
              mode === "manual"
                ? "bg-[#0EA5E9] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Manual Add
          </button>

          <button
            onClick={() =>
              setMode("excel")
            }
            className={`h-12 rounded-xl text-sm font-bold transition-all ${
              mode === "excel"
                ? "bg-[#0EA5E9] text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Import Excel
          </button>
        </div>

        {/* EXCEL */}

        {mode === "excel" && (
          <div className="bg-white border border-dashed border-[#0EA5E9]/40 rounded-4xl p-10 text-center shadow-sm">
            <div className="w-20 h-20 rounded-[28px] bg-[#E0F2FE] flex items-center justify-center mx-auto mb-5">
              <Upload className="w-9 h-9 text-[#0EA5E9]" />
            </div>

            <h3 className="text-2xl font-black text-[#0F172A]">
              Upload Excel File
            </h3>

            <p className="text-gray-500 text-sm mt-2 mb-8">
              Import shops using
              .xlsx, .xls or .csv
              file
            </p>

            <label className="inline-flex h-12 px-7 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] transition-all text-white items-center gap-3 cursor-pointer font-bold shadow-lg shadow-sky-200">
              <Upload className="w-5 h-5" />

              {uploadingExcel
                ? "Uploading..."
                : "Choose Excel File"}

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={
                  handleExcelUpload
                }
              />
            </label>
          </div>
        )}

        {/* MANUAL */}

        {mode === "manual" && (
          <div className="space-y-7">
            <div className="bg-white rounded-[30px] border border-gray-100 p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                  <Store className="w-6 h-6 text-[#0EA5E9]" />
                </div>

                <div>
                  <h3 className="font-black text-lg text-[#0F172A]">
                    {editingShop
                      ? "Edit Shop"
                      : "Shop Information"}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Basic details
                    about the shop
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    label:
                      "Shop Name",
                    key: "shop_name",
                  },

                  {
                    label:
                      "Owner Name",
                    key: "owner_name",
                  },

                  {
                    label:
                      "Phone Number",
                    key: "phone",
                  },

                  {
                    label:
                      "Category",
                    key: "category",
                  },

                  {
                    label: "City",
                    key: "city",
                  },

                  {
                    label:
                      "Logo URL",
                    key: "logo",
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      {item.label}
                    </label>

                    <input
                      value={
                        form[
                          item.key as keyof typeof form
                        ]
                      }
                      onChange={(
                        e,
                      ) =>
                        setForm({
                          ...form,

                          [item.key]:
                            e.target
                              .value,
                        })
                      }
                      className={
                        inp
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Shop Address
                </label>

                <textarea
                  rows={5}
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      address:
                        e.target
                          .value,
                    })
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 py-4 text-sm outline-none resize-none focus:border-[#0EA5E9]"
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={
                    handleSave
                  }
                  disabled={
                    saving
                  }
                  className="w-full h-12 rounded-2xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  {saving
                    ? editingShop
                      ? "Updating..."
                      : "Saving..."
                    : editingShop
                    ? "Update Shop"
                    : "Register Shop"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}