"use client";

import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import ProductForm from "./ProductForm";

import {
  type Product,
  type ProductCategory,
  productCategories,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/app/data/products";

/* ======================================= */

function ProductsTab({
  shop,
  onBack,
}: {
  shop: any;
  onBack: () => void;
}) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [catFilter, setCatFilter] =
    useState<ProductCategory | "">("");

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Product | null>(null);

  const [successMsg, setSuccessMsg] =
    useState("");

  /* =======================================
     LOAD PRODUCTS
  ======================================= */

  const loadProducts =
    async () => {
      try {
        setLoading(true);

        const data =
          await getProducts(
            shop.id,
            true,
          );

        setProducts(data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (shop?.id) {
      loadProducts();
    }
  }, [shop]);

  /* =======================================
     TOGGLE PRODUCT STATUS
  ======================================= */

  const handleToggleStatus =
    async (
      id: string,
      active: boolean,
    ) => {
      try {
        await toggleProductStatus(
          id,
          active,
        );

        await loadProducts();

        setSuccessMsg(
          active
            ? "Product Live"
            : "Product Out Of Stock",
        );

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      } catch (err) {
        console.log(err);
      }
    };

  /* =======================================
     FILTER
  ======================================= */

  const filtered =
    products.filter((p) => {
      const q =
        search.toLowerCase();

      const matchQ =
        !q ||
        p.name
          .toLowerCase()
          .includes(q) ||
        p.brand
          .toLowerCase()
          .includes(q);

      const matchCat =
        !catFilter ||
        p.category ===
          catFilter;

      return (
        matchQ &&
        matchCat
      );
    });

  /* ======================================= */

  const openAdd = () => {
    setEditing(null);

    setDrawerOpen(true);
  };

  const openEdit = (
    product: Product,
  ) => {
    setEditing(product);

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);

    setEditing(null);
  };

  /* =======================================
     SAVE
  ======================================= */

  const handleSave =
    async (
      data: Omit<
        Product,
        "id"
      >,
    ) => {
      try {
        const payload = {
          ...data,

          shop_id:
            shop.id,
        };

        if (editing) {
          await updateProduct(
            editing.id,
            payload,
          );

          setSuccessMsg(
            "Product updated successfully!",
          );
        } else {
          await addProduct(
            payload,
          );

          setSuccessMsg(
            "Product added successfully!",
          );
        }

        await loadProducts();

        closeDrawer();

        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      } catch (err) {
        console.log(err);
      }
    };

  /* =======================================
     DELETE
  ======================================= */

  const handleDelete =
    async (
      id: string,
    ) => {
      const confirmDelete =
        confirm(
          "Delete this product?",
        );

      if (!confirmDelete)
        return;

      await deleteProduct(
        id,
      );

      await loadProducts();

      setSuccessMsg(
        "Product deleted successfully!",
      );

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    };

  /* ======================================= */

  return (
    <div className="p-8">
      {/* TOP */}

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl font-black text-[#0F172A]">
            {shop.shop_name}
          </h1>

          <p className="text-sm text-[#64748B]">
            Shop Products
            Management
          </p>
        </div>
      </div>

      {/* SUCCESS */}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
          <CheckCircle className="w-4 h-4" />

          {successMsg}
        </div>
      )}

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            Products
          </h2>

          <p className="text-sm text-[#64748B]">
            {
              products.length
            }{" "}
            Products
          </p>
        </div>

        <button
          onClick={openAdd}
          className="h-11 px-5 rounded-xl bg-[#0EA5E9] text-white text-sm font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />

          Add Product
        </button>
      </div>

      {/* SEARCH */}

      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Search className="w-4 h-4 text-gray-400" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Search products..."
            className="flex-1 outline-none text-sm bg-transparent"
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <select
          value={catFilter}
          onChange={(e) =>
            setCatFilter(
              e.target
                .value as ProductCategory,
            )
          }
          className="h-11 px-4 rounded-xl border border-gray-200 text-sm"
        >
          <option value="">
            All Categories
          </option>

          {productCategories.map(
            (cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-100">
              <th className="text-left text-xs px-4 py-3 text-[#64748B]">
                Product
              </th>

              <th className="text-left text-xs px-4 py-3 text-[#64748B]">
                Category
              </th>

              <th className="text-right text-xs px-4 py-3 text-[#64748B]">
                Price
              </th>

              <th className="text-center text-xs px-4 py-3 text-[#64748B]">
                Stock
              </th>

              <th className="text-center text-xs px-4 py-3 text-[#64748B]">
                Status
              </th>

              <th className="text-right text-xs px-4 py-3 text-[#64748B]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(
              (p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-[#FAFAFA]"
                >
                  {/* PRODUCT */}

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          p
                            .images?.[0] ||
                          p.image ||
                          "/placeholder.png"
                        }
                        alt={
                          p.name
                        }
                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-[#0F172A]">
                            {
                              p.name
                            }
                          </div>

                          {!p.is_active && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          )}
                        </div>

                        <div className="text-xs text-[#94A3B8]">
                          {
                            p.brand
                          }
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}

                  <td className="px-4 py-3 text-sm text-[#64748B]">
                    {
                      p.categoryLabel
                    }
                  </td>

                  {/* PRICE */}

                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-sm">
                      ₹{p.price}
                    </div>
                  </td>

                  {/* STOCK */}

                 {/* STOCK */}

<td className="px-4 py-3 text-center">
  <div className="flex items-center justify-center gap-2">
    <input
      type="number"
      min="0"
      value={p.stock}
      onChange={async (e) => {
        const value = Number(
          e.target.value,
        );

        try {
          await updateProduct(
            p.id,
            {
              stock: value,
            },
          );

          setProducts(
            (
              prev,
            ) =>
              prev.map(
                (
                  item,
                ) =>
                  item.id ===
                  p.id
                    ? {
                        ...item,
                        stock:
                          value,
                      }
                    : item,
              ),
          );

          setSuccessMsg(
            "Stock Updated",
          );

          setTimeout(
            () => {
              setSuccessMsg(
                "",
              );
            },
            2000,
          );
        } catch (
          err
        ) {
          console.log(
            err,
          );
        }
      }}
      className={`
        w-20
        h-9
        rounded-lg
        border
        text-center
        text-sm
        font-semibold
        outline-none
        ${
          p.stock > 0
            ? "border-emerald-200 text-emerald-600"
            : "border-rose-200 text-rose-500"
        }
      `}
    />
  </div>
</td>

                  {/* STATUS */}

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          p.id,
                          !p.is_active,
                        )
                      }
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        p.is_active
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                          p.is_active
                            ? "left-8"
                            : "left-1"
                        }`}
                      />

                      <span className="sr-only">
                        Toggle
                      </span>
                    </button>
                  </td>

                  {/* ACTIONS */}

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEdit(
                            p,
                          )
                        }
                        className="w-8 h-8 rounded-lg hover:bg-sky-50 flex items-center justify-center"
                      >
                        <Pencil className="w-4 h-4 text-sky-500" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            p.id,
                          )
                        }
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        {/* EMPTY */}

        {!loading &&
          filtered.length ===
            0 && (
            <div className="py-16 text-center text-[#94A3B8]">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />

              No Products Found
            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div className="py-16 text-center text-[#94A3B8]">
            Loading
            Products...
          </div>
        )}
      </div>

      {/* DRAWER */}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={
              closeDrawer
            }
          />

          <div className="w-full max-w-xl bg-white h-full overflow-y-auto">
            <ProductForm
              shop={shop}
              initial={
                editing ||
                undefined
              }
              onSave={
                handleSave
              }
              onClose={
                closeDrawer
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsTab;