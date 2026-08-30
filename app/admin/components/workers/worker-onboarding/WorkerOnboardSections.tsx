"use client";

import {
  useEffect,
  useState,
} from "react";

import BasicInfoSection from "./BasicInfoSection";
import PhotoSection from "./PhotoSection";
import CategorySection from "./CategorySection";
import SubcategorySection from "./SubcategorySection";
import ServiceTypeSection from "./ServiceTypeSection";
import ProfessionalInfoSection from "./ProfessionalInfoSection";
import PricingSection from "./PricingSection";
import WorkerOnboardBottomBar from "./WorkerOnboardBottomBar";

import type { PricingType } from "@/app/data/workers";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type Categories = Record<
  string,
  {
    readonly subcategories: Record<
      string,
      readonly string[]
    >;
  }
>;

type Props = {
  /* =========================
     BASIC INFORMATION
  ========================= */

  name: string;
  phone: string;
  specialty: string;
  location: string;
  labourChauk: string;

  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setSpecialty: (
    value: string,
  ) => void;
  setLocation: (
    value: string,
  ) => void;
  setLabourChauk: (
    value: string,
  ) => void;

  /* =========================
     PHOTO
  ========================= */

  photo: File | null;

  setPhoto: (
    file: File | null,
  ) => void;

  /* =========================
     CATEGORY
  ========================= */

  category: string;

  setCategory: (
    value: string,
  ) => void;

  subcategory: string;

  setSubcategory: (
    value: string,
  ) => void;

  /* =========================
     SERVICE TYPES

     These are the services selected
     from ServiceTypeSection.

     They are synchronized with
     ProfessionalInfoSection services.
  ========================= */

  serviceTypes: string[];

  setServiceTypes: (
    values: string[],
  ) => void;

  /* =========================
     PROFESSIONAL INFORMATION
  ========================= */

  experience: string;

  setExperience: (
    value: string,
  ) => void;

  responseTime: string;

  setResponseTime: (
    value: string,
  ) => void;

  bio: string;

  setBio: (
    value: string,
  ) => void;

  skills: string[];

  setSkills: (
    values: string[],
  ) => void;

  services: string[];

  setServices: (
    values: string[],
  ) => void;

  certifications: string[];

  setCertifications: (
    values: string[],
  ) => void;

  /* =========================
     PRICING
  ========================= */

  pricingType: PricingType;

  setPricingType: (
    value: PricingType,
  ) => void;

  startingPrice: string;

  setStartingPrice: (
    value: string,
  ) => void;

  halfDayPrice: string;

  setHalfDayPrice: (
    value: string,
  ) => void;

  fullDayPrice: string;

  setFullDayPrice: (
    value: string,
  ) => void;

  monthlyPrice: string;

  setMonthlyPrice: (
    value: string,
  ) => void;

  visitCharge: string;

  setVisitCharge: (
    value: string,
  ) => void;

  /* =========================
     AVAILABILITY
  ========================= */

  available: boolean;

  setAvailable: (
    value: boolean,
  ) => void;

  /* =========================
     OTHER
  ========================= */

  categories: Categories;

  device: Device;

  onCancel: () => void;

  onSave: () => void;

  saving?: boolean;
};

export default function WorkerOnboardSections({
  /* =========================
     BASIC
  ========================= */

  name,
  phone,
  specialty,
  location,
  labourChauk,

  setName,
  setPhone,
  setSpecialty,
  setLocation,
  setLabourChauk,

  /* =========================
     PHOTO
  ========================= */

  photo,
  setPhoto,

  /* =========================
     CATEGORY
  ========================= */

  category,
  setCategory,

  subcategory,
  setSubcategory,

  /* =========================
     SERVICE TYPES
  ========================= */

  serviceTypes,
  setServiceTypes,

  /* =========================
     PROFESSIONAL
  ========================= */

  experience,
  setExperience,

  responseTime,
  setResponseTime,

  bio,
  setBio,

  skills,
  setSkills,

  services,
  setServices,

  certifications,
  setCertifications,

  /* =========================
     PRICING
  ========================= */

  pricingType,
  setPricingType,

  startingPrice,
  setStartingPrice,

  halfDayPrice,
  setHalfDayPrice,

  fullDayPrice,
  setFullDayPrice,

  monthlyPrice,
  setMonthlyPrice,

  visitCharge,
  setVisitCharge,

  /* =========================
     AVAILABILITY
  ========================= */

  available,
  setAvailable,

  /* =========================
     OTHER
  ========================= */

  categories,
  device,

  onCancel,
  onSave,

  saving = false,
}: Props) {
  /* =====================================================
     ANDROID / CAPACITOR KEYBOARD
  ===================================================== */

  useEffect(() => {
    if (device !== "mobile") {
      return;
    }

    let mounted = true;

    let showListener: {
      remove: () => void;
    } | null = null;

    let hideListener: {
      remove: () => void;
    } | null = null;

    const setupKeyboard =
      async () => {
        try {
          const { Keyboard } =
            await import(
              "@capacitor/keyboard"
            );

          if (!mounted) {
            return;
          }

          showListener =
            await Keyboard.addListener(
              "keyboardDidShow",
              () => {
                if (!mounted) {
                  return;
                }

                document.documentElement.classList.add(
                  "keyboard-open",
                );

                document.body.classList.add(
                  "keyboard-open",
                );
              },
            );

          hideListener =
            await Keyboard.addListener(
              "keyboardDidHide",
              () => {
                if (!mounted) {
                  return;
                }

                document.documentElement.classList.remove(
                  "keyboard-open",
                );

                document.body.classList.remove(
                  "keyboard-open",
                );
              },
            );
        } catch (error) {
          console.debug(
            "Capacitor Keyboard unavailable:",
            error,
          );
        }
      };

    setupKeyboard();

    return () => {
      mounted = false;

      showListener?.remove();
      hideListener?.remove();

      document.documentElement.classList.remove(
        "keyboard-open",
      );

      document.body.classList.remove(
        "keyboard-open",
      );
    };
  }, [device]);

  /* =====================================================
     SYNC SERVICE TYPES -> SERVICES

     ServiceTypeSection controls serviceTypes.

     ProfessionalInfoSection expects services.

     Keep both synchronized so existing components
     continue working and the selected service types
     reach the onboarding save payload.
  ===================================================== */

  useEffect(() => {
    const cleanServices =
      Array.from(
        new Map(
          serviceTypes
            .filter(
              (
                service,
              ): service is string =>
                typeof service ===
                "string",
            )
            .map((service) =>
              service.trim(),
            )
            .filter(Boolean)
            .map((service) => [
              service.toLowerCase(),
              service,
            ]),
        ).values(),
      );

    const currentServices =
      Array.isArray(services)
        ? services
        : [];

    const same =
      currentServices.length ===
        cleanServices.length &&
      currentServices.every(
        (
          service,
          index,
        ) =>
          service ===
          cleanServices[index],
      );

    if (!same) {
      setServices(
        cleanServices,
      );
    }
  }, [
    serviceTypes,
    services,
    setServices,
  ]);

  /* =====================================================
     VISIBLE PRICING TYPES
  ===================================================== */

  const [
    visiblePricingTypes,
    setVisiblePricingTypes,
  ] = useState<
    PricingType[]
  >([
    "per_job",
    "daily",
  ]);

  /* =====================================================
     PRICING TYPE SETTER
  ===================================================== */

  const handleVisiblePricingTypesChange =
    (
      values: PricingType[],
    ) => {
      setVisiblePricingTypes(
        [
          ...values,
        ],
      );
    };

  /* =====================================================
     DEBUG
  ===================================================== */

  useEffect(() => {
    console.log(
      "ONBOARD SERVICE TYPES:",
      serviceTypes,
    );

    console.log(
      "ONBOARD SERVICES:",
      services,
    );
  }, [
    serviceTypes,
    services,
  ]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-4 pb-1">

      {/* =================================================
          BASIC INFORMATION
      ================================================= */}

      <BasicInfoSection
        name={name}
        phone={phone}
        specialty={specialty}
        location={location}
        labourChauk={labourChauk}
        setName={setName}
        setPhone={setPhone}
        setSpecialty={
          setSpecialty
        }
        setLocation={
          setLocation
        }
        setLabourChauk={
          setLabourChauk
        }
        device={device}
      />

      {/* =================================================
          PHOTO
      ================================================= */}

      <PhotoSection
        photo={photo}
        setPhoto={setPhoto}
        device={device}
      />

      {/* =================================================
          CATEGORY
      ================================================= */}

      <CategorySection
        category={category}
        setCategory={setCategory}
        categories={categories}
        device={device}
      />

      {/* =================================================
          SUBCATEGORY
      ================================================= */}

      <SubcategorySection
        category={category}
        subcategory={
          subcategory
        }
        setSubcategory={
          setSubcategory
        }
        categories={categories}
        device={device}
      />

      {/* =================================================
          SERVICE TYPES
      ================================================= */}

      <ServiceTypeSection
        category={category}
        subcategory={
          subcategory
        }
        serviceTypes={
          serviceTypes
        }
        setServiceTypes={
          setServiceTypes
        }
        categories={categories}
        device={device}
      />

      {/* =================================================
          PROFESSIONAL INFORMATION
      ================================================= */}

      <ProfessionalInfoSection
        experience={
          experience
        }
        setExperience={
          setExperience
        }

        responseTime={
          responseTime
        }
        setResponseTime={
          setResponseTime
        }

        bio={bio}
        setBio={setBio}

        skills={skills}
        setSkills={
          setSkills
        }

        /*
         * IMPORTANT:
         * services remains connected to the existing
         * ProfessionalInfoSection.
         *
         * It is synchronized from serviceTypes above.
         */

        services={
          services
        }

        setServices={
          setServices
        }

        certifications={
          certifications
        }

        setCertifications={
          setCertifications
        }

        device={device}
      />

      {/* =================================================
          PRICING
      ================================================= */}

      <PricingSection
        pricingType={
          pricingType
        }

        setPricingType={
          setPricingType
        }

        startingPrice={
          startingPrice
        }

        setStartingPrice={
          setStartingPrice
        }

        halfDayPrice={
          halfDayPrice
        }

        setHalfDayPrice={
          setHalfDayPrice
        }

        fullDayPrice={
          fullDayPrice
        }

        setFullDayPrice={
          setFullDayPrice
        }

        monthlyPrice={
          monthlyPrice
        }

        setMonthlyPrice={
          setMonthlyPrice
        }

        visitCharge={
          visitCharge
        }

        setVisitCharge={
          setVisitCharge
        }

        visiblePricingTypes={
          visiblePricingTypes
        }

        setVisiblePricingTypes={
          handleVisiblePricingTypesChange
        }

        available={
          available
        }

        setAvailable={
          setAvailable
        }

        device={device}
      />

      {/* =================================================
          BOTTOM ACTION BAR
      ================================================= */}

      <WorkerOnboardBottomBar
        device={device}
        onCancel={
          onCancel
        }
        onSave={
          onSave
        }
        saving={
          saving
        }
      />

    </div>
  );
}