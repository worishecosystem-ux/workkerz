"use client";

import { useEffect } from "react";

import BasicInfoSection from "./BasicInfoSection";
import PhotoSection from "./PhotoSection";
import CategorySection from "./CategorySection";
import SubcategorySection from "./SubcategorySection";
import ServiceTypeSection from "./ServiceTypeSection";
import ProfessionalInfoSection from "./ProfessionalInfoSection";
import PricingSection from "./PricingSection";
import WorkerOnboardBottomBar from "./WorkerOnboardBottomBar";

type Device = "desktop" | "tablet" | "mobile";

type PricingType =
  | "per_job"
  | "daily"
  | "half_day"
  | "full_day"
  | "monthly"
  | "visit_charge"
  | "custom";

type Categories = Record<
  string,
  {
    readonly subcategories: Record<string, readonly string[]>;
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
  setSpecialty: (value: string) => void;
  setLocation: (value: string) => void;
  setLabourChauk: (value: string) => void;

  /* =========================
     PHOTO
  ========================= */

  photo: File | null;
  setPhoto: (file: File | null) => void;

  /* =========================
     CATEGORY
  ========================= */

  category: string;
  setCategory: (value: string) => void;

  subcategory: string;
  setSubcategory: (value: string) => void;

  serviceTypes: string[];
  setServiceTypes: (values: string[]) => void;

  /* =========================
     PROFESSIONAL INFORMATION
  ========================= */

  experience: string;
  setExperience: (value: string) => void;

  responseTime: string;
  setResponseTime: (value: string) => void;

  bio: string;
  setBio: (value: string) => void;

  skills: string[];
  setSkills: (values: string[]) => void;

  services: string[];
  setServices: (values: string[]) => void;

  certifications: string[];
  setCertifications: (values: string[]) => void;

  /* =========================
     PRICING
  ========================= */

  pricingType: PricingType;
  setPricingType: (value: PricingType) => void;

  startingPrice: string;
  setStartingPrice: (value: string) => void;

  halfDayPrice: string;
  setHalfDayPrice: (value: string) => void;

  fullDayPrice: string;
  setFullDayPrice: (value: string) => void;

  monthlyPrice: string;
  setMonthlyPrice: (value: string) => void;

  visitCharge: string;
  setVisitCharge: (value: string) => void;

  /* =========================
     AVAILABILITY
  ========================= */

  available: boolean;
  setAvailable: (value: boolean) => void;

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
     ANDROID / CAPACITOR KEYBOARD HANDLING
     
     Keyboard open:
     - Add keyboard-open class
     - Bottom bar will hide

     Keyboard close:
     - Remove keyboard-open class
     - Bottom bar will show
  ===================================================== */

  useEffect(() => {
    if (device !== "mobile") return;

    let mounted = true;

    let showListener: {
      remove: () => void;
    } | null = null;

    let hideListener: {
      remove: () => void;
    } | null = null;

    const setupKeyboard = async () => {
      try {
        const { Keyboard } = await import("@capacitor/keyboard");

        if (!mounted) return;

        /* =========================
           KEYBOARD SHOW
        ========================= */

        showListener = await Keyboard.addListener("keyboardDidShow", () => {
          if (!mounted) return;

          document.documentElement.classList.add("keyboard-open");

          document.body.classList.add("keyboard-open");
        });

        /* =========================
           KEYBOARD HIDE
        ========================= */

        hideListener = await Keyboard.addListener("keyboardDidHide", () => {
          if (!mounted) return;

          document.documentElement.classList.remove("keyboard-open");

          document.body.classList.remove("keyboard-open");
        });
      } catch (error) {
        /*
         * Browser / non-Capacitor environment.
         *
         * Nothing required here.
         */
        console.debug("Capacitor Keyboard unavailable:", error);
      }
    };

    setupKeyboard();

    /* =========================
       CLEANUP
    ========================= */

    return () => {
      mounted = false;

      showListener?.remove();
      hideListener?.remove();

      document.documentElement.classList.remove("keyboard-open");

      document.body.classList.remove("keyboard-open");
    };
  }, [device]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-4 pb-28">
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
        setSpecialty={setSpecialty}
        setLocation={setLocation}
        setLabourChauk={setLabourChauk}
        device={device}
      />

      {/* =================================================
          PHOTO
      ================================================= */}

      <PhotoSection photo={photo} setPhoto={setPhoto} device={device} />

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
        subcategory={subcategory}
        setSubcategory={setSubcategory}
        categories={categories}
        device={device}
      />

      {/* =================================================
          SERVICES
      ================================================= */}

      <ServiceTypeSection
        category={category}
        subcategory={subcategory}
        serviceTypes={serviceTypes}
        setServiceTypes={setServiceTypes}
        categories={categories}
        device={device}
      />

      {/* =================================================
          PROFESSIONAL INFORMATION
      ================================================= */}

      <ProfessionalInfoSection
        experience={experience}
        setExperience={setExperience}
        responseTime={responseTime}
        setResponseTime={setResponseTime}
        bio={bio}
        setBio={setBio}
        skills={skills}
        setSkills={setSkills}
        services={services}
        setServices={setServices}
        certifications={certifications}
        setCertifications={setCertifications}
        device={device}
      />

      {/* =================================================
          PRICING
      ================================================= */}

      <PricingSection
        pricingType={pricingType}
        setPricingType={setPricingType}
        startingPrice={startingPrice}
        setStartingPrice={setStartingPrice}
        halfDayPrice={halfDayPrice}
        setHalfDayPrice={setHalfDayPrice}
        fullDayPrice={fullDayPrice}
        setFullDayPrice={setFullDayPrice}
        monthlyPrice={monthlyPrice}
        setMonthlyPrice={setMonthlyPrice}
        visitCharge={visitCharge}
        setVisitCharge={setVisitCharge}
        available={available}
        setAvailable={setAvailable}
        device={device}
      />

      {/* =================================================
          BOTTOM ACTION BAR
      ================================================= */}

      <WorkerOnboardBottomBar
        device={device}
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
      />
    </div>
  );
}
