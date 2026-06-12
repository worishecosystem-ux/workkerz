"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import { getWorkers, type Worker, type Review } from "@/app/data/workers";

import {
  getProducts,
  addProduct as addProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB,
  type Product,
} from "@/app/data/products";

import { getShops, type Shop } from "@/app/data/shops";

import { supabase } from "@/lib/supabase";

/* ===================================================== */

interface AdminContextType {
  /* WORKERS */

  workers: Worker[];

  addWorker: (w: Omit<Worker, "id">) => Promise<any>;

  updateWorker: (id: string, w: Partial<Worker>) => Promise<void>;

  deleteWorker: (id: string) => Promise<void>;

  /* PRODUCTS */

  products: Product[];

  visibleProducts: Product[];

  addProduct: (p: Omit<Product, "id">) => Promise<boolean>;

  updateProduct: (id: string, p: Partial<Product>) => Promise<boolean>;

  deleteProduct: (id: string) => Promise<boolean>;

  /* SHOPS */

  shops: Shop[];

  onlineShops: Shop[];

  offlineShops: Shop[];

  /* ORDERS */

  orders: any[];

  /* REVIEWS */

  reviews: Review[];

  /* HELPERS */

  getWorkerById: (id: string) => Worker | undefined;

  getProductById: (id: string) => Product | undefined;

  getProductsByCategory: (cat: string) => Product[];

  getFeaturedProducts: () => Product[];

  getRelatedProducts: (product: Product, count?: number) => Product[];

  /* STATS */

  stats: {
    totalWorkers: number;

    totalProducts: number;

    visibleProducts: number;

    totalShops: number;

    onlineShops: number;

    offlineShops: number;

    totalOrders: number;

    availableWorkers: number;

    outOfStock: number;
  };
}

/* ===================================================== */

const AdminContext = createContext<AdminContextType | null>(null);

/* ===================================================== */

export function AdminProvider({ children }: { children: ReactNode }) {
  /* ===================================================== */
  /* STATES */
  /* ===================================================== */

  const [workers, setWorkers] = useState<Worker[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [shops, setShops] = useState<Shop[]>([]);

  const [orders, setOrders] = useState<any[]>([]);

  /* ===================================================== */
  /* LOAD DATA */
  /* ===================================================== */

  useEffect(() => {
    loadWorkers();

    loadProducts();

    loadShops();

    loadOrders();
  }, []);

  /* ===================================================== */
  /* LOAD WORKERS */
  /* ===================================================== */

  const loadWorkers = async () => {
    const data = await getWorkers();

    setWorkers(data || []);
  };

  /* ===================================================== */
  /* LOAD PRODUCTS */
  /* ===================================================== */

  const loadProducts = async () => {
    try {
      const data = await getProducts(undefined, true);

      setProducts(data || []);
    } catch (error) {
      console.log(error);

      setProducts([]);
    }
  };

  /* ===================================================== */
  /* LOAD SHOPS */
  /* ===================================================== */

  const loadShops = async () => {
    try {
      const data = await getShops();

      setShops(data || []);
    } catch (error) {
      console.log(error);

      setShops([]);
    }
  };

  /* ===================================================== */
  /* LOAD ORDERS */
  /* ===================================================== */

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*");

      if (error) {
        console.log(error);

        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.log(error);

      setOrders([]);
    }
  };

  /* ===================================================== */
  /* ONLINE SHOPS */
  /* ===================================================== */

  const onlineShops = shops.filter((shop) => shop.status === "online");

  const offlineShops = shops.filter((shop) => shop.status !== "online");

  const onlineShopIds = onlineShops.map((shop) => shop.id);

  /* ===================================================== */
  /* VISIBLE PRODUCTS */
  /* ===================================================== */

  const visibleProducts = products.filter(
    (product) => product.shop_id && onlineShopIds.includes(product.shop_id),
  );

  /* ===================================================== */
  /* WORKER CRUD */
  /* ===================================================== */

  const addWorker = async (worker: Omit<Worker, "id">): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from("workers")
        .insert([
          {
            name: worker.name,

            category: worker.category,

            specialty: worker.specialty,

            rating: worker.rating,

            review_count: worker.reviewCount,

            pricing_type: worker.pricingType,

            starting_price: worker.startingPrice,

            half_day_price: worker.halfDayPrice,

            full_day_price: worker.fullDayPrice,

            monthly_price: worker.monthlyPrice,

            visit_charge: worker.visitCharge,

            location: worker.location,

            available: worker.available,

            years_experience: worker.yearsExperience,

            completed_jobs: worker.completedJobs,

            bio: worker.bio,

            skills: worker.skills,

            photo: worker.photo,

            response_time: worker.responseTime,

            certifications: worker.certifications,
          },
        ])
        .select()
        .single();

      if (error) {
        console.log(error);

        return null;
      }

      await loadWorkers();

      return data;
    } catch (error) {
      console.log(error);

      return null;
    }
  };

  /* ===================================================== */

  const updateWorker = async (id: string, data: Partial<Worker>) => {
    await supabase
      .from("workers")
      .update({
        name: data.name,

        category: data.category,

        specialty: data.specialty,

        rating: data.rating,

        review_count: data.reviewCount,

        pricing_type: data.pricingType,

        starting_price: data.startingPrice,

        half_day_price: data.halfDayPrice,

        full_day_price: data.fullDayPrice,

        monthly_price: data.monthlyPrice,

        visit_charge: data.visitCharge,
        location: data.location,

        available: data.available,

        years_experience: data.yearsExperience,

        completed_jobs: data.completedJobs,

        bio: data.bio,

        skills: data.skills,

        photo: data.photo,

        response_time: data.responseTime,

        certifications: data.certifications,
      })
      .eq("id", id);

    await loadWorkers();
  };

  /* ===================================================== */

  const deleteWorker = async (id: string) => {
    await supabase.from("workers").delete().eq("id", id);

    await loadWorkers();
  };

  /* ===================================================== */
  /* PRODUCT CRUD */
  /* ===================================================== */

  const addProduct = async (product: Omit<Product, "id">): Promise<boolean> => {
    try {
      await addProductDB(product);

      await loadProducts();

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  /* ===================================================== */

  const updateProduct = async (
    id: string,
    data: Partial<Product>,
  ): Promise<boolean> => {
    try {
      await updateProductDB(id, data);

      await loadProducts();

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  /* ===================================================== */

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await deleteProductDB(id);

      await loadProducts();

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  /* ===================================================== */
  /* HELPERS */
  /* ===================================================== */

  const getWorkerById = (id: string) => {
    return workers.find((worker) => worker.id === id);
  };

  /* ===================================================== */

  const getProductById = (id: string) => {
    return visibleProducts.find((product) => product.id === id);
  };

  /* ===================================================== */

  const getProductsByCategory = (cat: string) => {
    return visibleProducts.filter((product) => product.category === cat);
  };

  /* ===================================================== */

  const getFeaturedProducts = () => {
    return visibleProducts.filter(
      (product) =>
        (product.badge === "popular" || product.badge === "pro") &&
        product.stock > 0,
    );
  };

  /* ===================================================== */

  const getRelatedProducts = (product: Product, count = 4) => {
    return visibleProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, count);
  };

  /* ===================================================== */
  /* STATS */
  /* ===================================================== */

  const stats = useMemo(
    () => ({
      totalWorkers: workers.length,

      totalProducts: products.length,

      visibleProducts: visibleProducts.length,

      totalShops: shops.length,

      onlineShops: onlineShops.length,

      offlineShops: offlineShops.length,

      totalOrders: orders.length,

      availableWorkers: workers.filter((worker) => worker.available).length,

      outOfStock: visibleProducts.filter((product) => product.stock <= 0)
        .length,
    }),
    [
      workers,
      products,
      visibleProducts,
      shops,
      onlineShops,
      offlineShops,
      orders,
    ],
  );

  /* ===================================================== */

  return (
    <AdminContext.Provider
      value={{
        /* WORKERS */

        workers,

        addWorker,

        updateWorker,

        deleteWorker,

        /* PRODUCTS */

        products,

        visibleProducts,

        addProduct,

        updateProduct,

        deleteProduct,

        /* SHOPS */

        shops,

        onlineShops,

        offlineShops,

        /* ORDERS */

        orders,

        /* REVIEWS */

        reviews: [],

        /* HELPERS */

        getWorkerById,

        getProductById,

        getProductsByCategory,

        getFeaturedProducts,

        getRelatedProducts,

        /* STATS */

        stats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

/* ===================================================== */

export function useAdmin() {
  const ctx = useContext(AdminContext);

  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }

  return ctx;
}
