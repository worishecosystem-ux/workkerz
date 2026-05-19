"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import {
  getWorkers,
  type Worker,
  type Review,
} from "@/app/data/workers";

import { supabase } from "@/lib/supabase";

import {
  getProducts,
  addProduct as addProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB,
  type Product,
} from "@/app/data/products";

/* ===================================================== */

interface AdminContextType {
  // Workers
  workers: Worker[];

  addWorker: (
    w: Omit<Worker, "id">,
  ) => Promise<any>;

  updateWorker: (
    id: string,
    w: Partial<Worker>,
  ) => Promise<void>;

  deleteWorker: (
    id: string,
  ) => Promise<void>;

  // Products
  products: Product[];

  addProduct: (
    p: Omit<Product, "id">,
  ) => Promise<boolean>;

  updateProduct: (
    id: string,
    p: Partial<Product>,
  ) => Promise<boolean>;

  deleteProduct: (
    id: string,
  ) => Promise<boolean>;

  // Reviews
  reviews: Review[];

  // Helpers
  getWorkerById: (
    id: string,
  ) => Worker | undefined;

  getProductById: (
    id: string,
  ) => Product | undefined;

  getProductsByCategory: (
    cat: string,
  ) => Product[];

  getFeaturedProducts: () => Product[];

  getRelatedProducts: (
    product: Product,
    count?: number,
  ) => Product[];

  // Stats
  stats: {
    totalWorkers: number;
    totalProducts: number;
    availableWorkers: number;
    outOfStock: number;
  };
}

/* ===================================================== */

const AdminContext =
  createContext<AdminContextType | null>(
    null,
  );

/* ===================================================== */

export function AdminProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [workers, setWorkers] =
    useState<Worker[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  /* ===================================================== */
  /* LOAD DATA */
  /* ===================================================== */

  useEffect(() => {
    loadWorkers();
    loadProducts();
  }, []);

  const loadWorkers = async () => {
    const data = await getWorkers();

    setWorkers(data || []);
  };

  const loadProducts = async () => {
    const data = await getProducts();

    setProducts(data || []);
  };

  /* ===================================================== */
  /* WORKER CRUD */
  /* ===================================================== */

  const addWorker = async (
    worker: Omit<Worker, "id">,
  ): Promise<any> => {
    const { data, error } =
      await supabase
        .from("workers")
        .insert([
          {
            name: worker.name,

            category:
              worker.category,

            specialty:
              worker.specialty,

            rating: worker.rating,

            review_count:
              worker.reviewCount,

            hourly_rate:
              worker.hourlyRate,

            location:
              worker.location,

            available:
              worker.available,

            years_experience:
              worker.yearsExperience,

            completed_jobs:
              worker.completedJobs,

            bio: worker.bio,

            skills: worker.skills,

            photo: worker.photo,

            response_time:
              worker.responseTime,

            certifications:
              worker.certifications,
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
  };

  const updateWorker = async (
    id: string,
    data: Partial<Worker>,
  ) => {
    await supabase
      .from("workers")
      .update({
        name: data.name,

        category: data.category,

        specialty:
          data.specialty,

        rating: data.rating,

        review_count:
          data.reviewCount,

        hourly_rate:
          data.hourlyRate,

        location:
          data.location,

        available:
          data.available,

        years_experience:
          data.yearsExperience,

        completed_jobs:
          data.completedJobs,

        bio: data.bio,

        skills: data.skills,

        photo: data.photo,

        response_time:
          data.responseTime,

        certifications:
          data.certifications,
      })
      .eq("id", id);

    await loadWorkers();
  };

  const deleteWorker = async (
    id: string,
  ) => {
    await supabase
      .from("workers")
      .delete()
      .eq("id", id);

    await loadWorkers();
  };

  /* ===================================================== */
  /* PRODUCT CRUD */
  /* ===================================================== */

  const addProduct = async (
    product: Omit<Product, "id">,
  ): Promise<boolean> => {
    const success =
      await addProductDB(product);

    if (success) {
      await loadProducts();
    }

    return success;
  };

  const updateProduct = async (
    id: string,
    data: Partial<Product>,
  ): Promise<boolean> => {
    const success =
      await updateProductDB(
        id,
        data,
      );

    if (success) {
      await loadProducts();
    }

    return success;
  };

  const deleteProduct = async (
    id: string,
  ): Promise<boolean> => {
    const success =
      await deleteProductDB(id);

    if (success) {
      await loadProducts();
    }

    return success;
  };

  /* ===================================================== */
  /* HELPERS */
  /* ===================================================== */

  const getWorkerById = (
    id: string,
  ) => {
    return workers.find(
      (worker) => worker.id === id,
    );
  };

  const getProductById = (
    id: string,
  ) => {
    return products.find(
      (product) =>
        product.id === id,
    );
  };

  const getProductsByCategory = (
    cat: string,
  ) => {
    return products.filter(
      (product) =>
        product.category === cat,
    );
  };

  const getFeaturedProducts = () => {
    return products.filter(
      (product) =>
        product.badge ===
          "popular" ||
        product.badge === "pro",
    );
  };

  const getRelatedProducts = (
    product: Product,
    count = 4,
  ) => {
    return products
      .filter(
        (p) =>
          p.category ===
            product.category &&
          p.id !== product.id,
      )
      .slice(0, count);
  };

  /* ===================================================== */
  /* STATS */
  /* ===================================================== */

  const stats = useMemo(
    () => ({
      totalWorkers:
        workers.length,

      totalProducts:
        products.length,

      availableWorkers:
        workers.filter(
          (worker) =>
            worker.available,
        ).length,

      outOfStock:
        products.filter(
          (product) =>
            product.stock === 0,
        ).length,
    }),
    [workers, products],
  );

  /* ===================================================== */

  return (
    <AdminContext.Provider
      value={{
        workers,

        addWorker,
        updateWorker,
        deleteWorker,

        products,

        addProduct,
        updateProduct,
        deleteProduct,

        reviews: [],

        getWorkerById,
        getProductById,
        getProductsByCategory,
        getFeaturedProducts,
        getRelatedProducts,

        stats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

/* ===================================================== */

export function useAdmin() {
  const ctx =
    useContext(AdminContext);

  if (!ctx) {
    throw new Error(
      "useAdmin must be used within AdminProvider",
    );
  }

  return ctx;
}