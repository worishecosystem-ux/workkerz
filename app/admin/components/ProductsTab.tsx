"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
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

/* =========================================================
   PROPS
========================================================= */

type ProductsTabProps = {
  shop: any;
  onBack: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

function ProductsTab({ shop, onBack }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<ProductCategory | "">("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [mobileFilters, setMobileFilters] = useState(false);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  async function loadProducts() {
    if (!shop?.id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getProducts(shop.id, true);

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shop?.id) {
      loadProducts();
    }
  }, [shop?.id]);

  /* =======================================================
     SUCCESS
  ======================================================= */

  function showSuccess(message: string) {
    setSuccessMsg(message);

    window.setTimeout(() => {
      setSuccessMsg("");
    }, 2500);
  }

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.brand || "")
          .toLowerCase()
          .includes(query) ||
        String(product.categoryLabel || "")
          .toLowerCase()
          .includes(query) ||
        product.variants?.some(
          (variant) =>
            String(variant.variantName || "")
              .toLowerCase()
              .includes(query) ||
            String(variant.sku || "")
              .toLowerCase()
              .includes(query),
        );

      const matchesCategory =
        !catFilter || product.category === catFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, catFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const active = products.filter(
      (product) => product.is_active !== false,
    ).length;

    const inactive = products.length - active;

    const totalStock = products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0,
    );

    return {
      total: products.length,
      active,
      inactive,
      stock: totalStock,
    };
  }, [products]);

  /* =======================================================
     ADD
  ======================================================= */

  function openAdd() {
    setEditing(null);
    setDrawerOpen(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function openEdit(product: Product) {
    setEditing(product);
    setDrawerOpen(true);
  }

  /* =======================================================
     CLOSE
  ======================================================= */

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSave(data: Omit<Product, "id">) {
    try {
      const payload: Omit<Product, "id"> = {
        ...data,
        shop_id: shop?.id || data.shop_id,
      };

      if (!payload.shop_id) {
        throw new Error("Shop ID is missing.");
      }

      if (editing) {
        await updateProduct(editing.id, payload);

        showSuccess("Product updated successfully");
      } else {
        await addProduct(payload);

        showSuccess("Product added successfully");
      }

      await loadProducts();

      closeDrawer();
    } catch (error) {
      console.error("PRODUCT SAVE ERROR:", error);

      throw error;
    }
  }

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  async function handleToggleStatus(product: Product) {
    try {
      const nextStatus = product.is_active === false;

      setProducts((previous) =>
        previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_active: nextStatus,
              }
            : item,
        ),
      );

      await toggleProductStatus(product.id, nextStatus);

      showSuccess(
        nextStatus
          ? "Product is now live"
          : "Product is now inactive",
      );
    } catch (error) {
      console.error("STATUS ERROR:", error);

      await loadProducts();
    }
  }

  /* =======================================================
     UPDATE STOCK
  ======================================================= */

  async function handleStockChange(
    product: Product,
    value: number,
  ) {
    const stock =
      Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : 0;

    try {
      setProducts((previous) =>
        previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock,
              }
            : item,
        ),
      );

      await updateProduct(product.id, {
        stock,
      });

      showSuccess("Stock updated");
    } catch (error) {
      console.error("STOCK UPDATE ERROR:", error);

      await loadProducts();
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(product.id);

      const deleted = await deleteProduct(product.id);

      if (!deleted) {
        throw new Error(
          "Product could not be deleted.",
        );
      }

      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id,
        ),
      );

      showSuccess("Product deleted successfully");
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error,
      );

      await loadProducts();
    } finally {
      setDeleteLoading(null);
    }
  }

  /* =======================================================
     PRICE
  ======================================================= */

  function getDisplayPrice(product: Product) {
    const variants =
      product.variants?.filter(
        (variant) => variant.isActive,
      ) || [];

    if (!variants.length) {
      return Number(product.price || 0);
    }

    const prices = variants.map((variant) =>
      Number(variant.price || 0),
    );

    return Math.min(...prices);
  }

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  function getProductImage(product: Product) {
    return (
      product.images?.[0] ||
      product.image ||
      "/placeholder.png"
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full w-full bg-[#f5f7fa]">

      {/* ===================================================
          TOP HEADER
      =================================================== */}

      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white">

        <div className="flex h-14 w-full items-center justify-between gap-3 px-3 sm:h-16 sm:px-5 lg:px-7 xl:px-8">

          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2.5">

            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0">

              <h1 className="truncate text-sm font-bold text-slate-950 sm:text-base">
                {shop?.shop_name || "Shop"}
              </h1>

              <p className="truncate text-[9px] text-slate-400 sm:text-[10px]">
                Product Management
              </p>

            </div>

          </div>

          {/* ADD */}

          <button
            type="button"
            onClick={openAdd}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 sm:h-10 sm:px-4 sm:text-xs"
          >
            <Plus className="h-4 w-4" />

            <span className="hidden sm:inline">
              Add Product
            </span>

            <span className="sm:hidden">
              Add
            </span>
          </button>

        </div>

      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="w-full px-3 py-3 pb-10 sm:px-5 sm:py-5 lg:px-7 xl:px-8">

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">

            <CheckCircle className="h-4 w-4 shrink-0" />

            <span className="min-w-0 flex-1">
              {successMsg}
            </span>

            <button
              type="button"
              onClick={() => setSuccessMsg("")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">

          <StatCard
            label="Products"
            value={stats.total}
          />

          <StatCard
            label="Live"
            value={stats.active}
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
          />

          <StatCard
            label="Total Stock"
            value={stats.stock}
          />

        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="mb-3 flex items-end justify-between gap-3">

          <div className="min-w-0">

            <h2 className="text-lg font-black text-slate-950 sm:text-xl">
              Products
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
              {filteredProducts.length} of{" "}
              {products.length} products
            </p>

          </div>

          {catFilter && (
            <button
              type="button"
              onClick={() => setCatFilter("")}
              className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600"
            >
              Clear category
            </button>
          )}

        </div>

        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        <div className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

          <div className="flex w-full gap-2">

            {/* SEARCH */}

            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3">

              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product, brand, SKU..."
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}

            </div>

            {/* MOBILE FILTER */}

            <button
              type="button"
              onClick={() =>
                setMobileFilters((value) => !value)
              }
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-600 sm:hidden"
            >
              Filter
            </button>

            {/* DESKTOP FILTER */}

            <select
              value={catFilter}
              onChange={(event) =>
                setCatFilter(
                  event.target.value as
                    | ProductCategory
                    | "",
                )
              }
              className="hidden h-10 w-48 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none sm:block"
            >
              <option value="">
                All Categories
              </option>

              {productCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.label}
                  </option>
                ),
              )}

            </select>

          </div>

          {/* MOBILE FILTER PANEL */}

          {mobileFilters && (
            <div className="mt-2 border-t border-slate-100 pt-2 sm:hidden">

              <select
                value={catFilter}
                onChange={(event) => {
                  setCatFilter(
                    event.target.value as
                      | ProductCategory
                      | "",
                  );

                  setMobileFilters(false);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
              >

                <option value="">
                  All Categories
                </option>

                {productCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.label}
                    </option>
                  ),
                )}

              </select>

            </div>
          )}

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="space-y-1 p-3">

              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-3 rounded-lg p-2"
                >

                  <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />

                  <div className="min-w-0 flex-1">

                    <div className="h-3 w-40 max-w-full rounded bg-slate-100" />

                    <div className="mt-2 h-2.5 w-24 rounded bg-slate-100" />

                  </div>

                  <div className="hidden h-3 w-20 rounded bg-slate-100 sm:block" />

                  <div className="h-8 w-14 shrink-0 rounded bg-slate-100" />

                </div>
              ))}

            </div>

          </div>
        )}

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        {!loading && (
          <div className="hidden w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">

            <table className="w-full min-w-[900px] border-collapse">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Product
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Price
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Stock
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      image={getProductImage(product)}
                      price={getDisplayPrice(product)}
                      onEdit={() =>
                        openEdit(product)
                      }
                      onDelete={() =>
                        handleDelete(product)
                      }
                      onToggle={() =>
                        handleToggleStatus(
                          product,
                        )
                      }
                      onStockChange={(value) =>
                        handleStockChange(
                          product,
                          value,
                        )
                      }
                      deleting={
                        deleteLoading ===
                        product.id
                      }
                    />
                  ),
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* =================================================
            MOBILE PRODUCTS
        ================================================= */}

        {!loading && (
          <div className="space-y-2 md:hidden">

            {filteredProducts.map(
              (product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  image={getProductImage(product)}
                  price={getDisplayPrice(product)}
                  onEdit={() =>
                    openEdit(product)
                  }
                  onDelete={() =>
                    handleDelete(product)
                  }
                  onToggle={() =>
                    handleToggleStatus(
                      product,
                    )
                  }
                  onStockChange={(value) =>
                    handleStockChange(
                      product,
                      value,
                    )
                  }
                  deleting={
                    deleteLoading ===
                    product.id
                  }
                />
              ),
            )}

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredProducts.length === 0 && (
            <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-14 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">

                <Package className="h-7 w-7 text-slate-300" />

              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No products found
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Try another search or add a new
                product.
              </p>

              <button
                type="button"
                onClick={
                  search || catFilter
                    ? () => {
                        setSearch("");
                        setCatFilter("");
                      }
                    : openAdd
                }
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-bold text-white"
              >
                {search || catFilter
                  ? "Clear Filters"
                  : "Add Product"}
              </button>

            </div>
          )}

      </main>

      {/* ===================================================
          FULL SCREEN PRODUCT DRAWER
      =================================================== */}

      {drawerOpen && (
        <div className="fixed inset-0 z-100">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          {/* FULL WIDTH FORM */}

          <aside className="absolute inset-0 h-full w-full overflow-hidden bg-white shadow-2xl">

            <div className="h-full w-full overflow-hidden">

              <ProductForm
                shop={shop}
                initial={
                  editing || undefined
                }
                onSave={handleSave}
                onClose={closeDrawer}
              />

            </div>

          </aside>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   DESKTOP PRODUCT ROW
========================================================= */

function ProductRow({
  product,
  image,
  price,
  onEdit,
  onDelete,
  onToggle,
  onStockChange,
  deleting,
}: {
  product: Product;
  image: string;
  price: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onStockChange: (value: number) => void;
  deleting: boolean;
}) {
  const variants =
    product.variants?.length || 0;

  return (
    <tr className="border-b border-slate-50 transition hover:bg-slate-50/70">

      {/* PRODUCT */}

      <td className="px-4 py-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">

            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain p-1"
            />

          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <p className="max-w-[300px] truncate text-xs font-bold text-slate-900">
                {product.name}
              </p>

              {product.is_active === false && (
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-500">
                  Inactive
                </span>
              )}

            </div>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {product.brand}
            </p>

            {variants > 0 && (
              <p className="mt-1 text-[9px] font-semibold text-blue-500">
                {variants} options
              </p>
            )}

          </div>

        </div>

      </td>

      {/* CATEGORY */}

      <td className="px-4 py-3">

        <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600">
          {product.categoryLabel}
        </span>

      </td>

      {/* PRICE */}

      <td className="px-4 py-3">

        <p className="text-xs font-black text-slate-900">
          ₹{price.toLocaleString("en-IN")}
        </p>

        {variants > 1 && (
          <p className="text-[8px] text-slate-400">
            onwards
          </p>
        )}

      </td>

      {/* STOCK */}

      <td className="px-4 py-3">

        <input
          type="number"
          min="0"
          value={Number(product.stock || 0)}
          onChange={(event) =>
            onStockChange(
              Number(event.target.value),
            )
          }
          className={`h-8 w-20 rounded-md border bg-white px-2 text-center text-[11px] font-bold outline-none focus:border-blue-400 ${
            product.stock > 0
              ? "border-emerald-200 text-emerald-600"
              : "border-red-200 text-red-500"
          }`}
        />

      </td>

      {/* STATUS */}

      <td className="px-4 py-3 text-center">

        <button
          type="button"
          onClick={onToggle}
          className={`relative h-6 w-11 rounded-full transition ${
            product.is_active !== false
              ? "bg-emerald-500"
              : "bg-slate-300"
          }`}
        >

          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
              product.is_active !== false
                ? "left-6"
                : "left-1"
            }`}
          />

        </button>

      </td>

      {/* ACTIONS */}

      <td className="px-4 py-3">

        <div className="flex justify-end gap-1">

          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >

            {deleting ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}

          </button>

        </div>

      </td>

    </tr>
  );
}

/* =========================================================
   MOBILE PRODUCT CARD
========================================================= */

function MobileProductCard({
  product,
  image,
  price,
  onEdit,
  onDelete,
  onToggle,
  onStockChange,
  deleting,
}: {
  product: Product;
  image: string;
  price: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onStockChange: (value: number) => void;
  deleting: boolean;
}) {
  const variants =
    product.variants?.length || 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* TOP */}

      <div className="flex gap-3 p-3">

        {/* IMAGE */}

        <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">

          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-1"
          />

          {product.is_active === false && (
            <span className="absolute left-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-[7px] font-bold text-white">
              OFF
            </span>
          )}

        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              <p className="line-clamp-2 text-xs font-bold leading-4 text-slate-900">
                {product.name}
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                {product.brand}
              </p>

            </div>

            <button
              type="button"
              onClick={onEdit}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600"
            >
              <Pencil className="h-3 w-3" />
            </button>

          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">

            <span className="text-base font-black text-slate-950">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {variants > 0 && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-600">
                {variants} options
              </span>
            )}

          </div>

          <p className="mt-1 text-[9px] text-slate-400">
            {product.categoryLabel}
          </p>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/60">

        {/* STOCK */}

        <div className="border-r border-slate-100 p-2.5">

          <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
            Stock
          </p>

          <input
            type="number"
            min="0"
            value={Number(product.stock || 0)}
            onChange={(event) =>
              onStockChange(
                Number(event.target.value),
              )
            }
            className={`h-7 w-full rounded-md border bg-white px-1 text-center text-[10px] font-bold outline-none ${
              product.stock > 0
                ? "border-emerald-200 text-emerald-600"
                : "border-red-200 text-red-500"
            }`}
          />

        </div>

        {/* STATUS */}

        <div className="border-r border-slate-100 p-2.5">

          <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
            Status
          </p>

          <button
            type="button"
            onClick={onToggle}
            className={`relative h-7 w-12 rounded-full ${
              product.is_active !== false
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
          >

            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${
                product.is_active !== false
                  ? "left-6"
                  : "left-1"
              }`}
            />

          </button>

        </div>

        {/* DELETE */}

        <div className="p-2.5">

          <p className="mb-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
            Action
          </p>

          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="flex h-7 w-full items-center justify-center gap-1 rounded-md bg-red-50 text-[9px] font-bold text-red-500 disabled:opacity-50"
          >

            {deleting ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
            ) : (
              <>
                <Trash2 className="h-3 w-3" />
                Delete
              </>
            )}

          </button>

        </div>

      </div>

      {/* MANAGE */}

      <button
        type="button"
        onClick={onEdit}
        className="flex h-9 w-full items-center justify-center gap-1 border-t border-slate-100 text-[9px] font-bold text-blue-600"
      >
        Manage Product
        <ChevronRight className="h-3 w-3" />
      </button>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
        {value.toLocaleString("en-IN")}
      </p>

    </div>
  );
}

export default ProductsTab;