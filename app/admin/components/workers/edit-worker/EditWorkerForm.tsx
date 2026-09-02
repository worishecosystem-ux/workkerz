import type { Worker } from "@/app/data/workers";
import type { PriceKey } from "./editWorker.types";

import WorkerPhotoSection from "./sections/WorkerPhotoSection";
import BasicInformationSection from "./sections/BasicInformationSection";
import ServiceTypeSection from "./sections/ServiceTypeSection";
import ExperienceSection from "./sections/ExperienceSection";
import AboutWorkerSection from "./sections/AboutWorkerSection";
import PricingSection from "./sections/PricingSection";
import ReviewsSection from "./sections/ReviewsSection";
import AvailabilitySection from "./sections/AvailabilitySection";

type EditWorkerFormProps = {
  name: string;
  phone: string;
  category: string;
  subcategory: string;
  specialty: string;
  location: string;
  labourChauk: string;

  yearsExperience: string;
  completedJobs: string;
  bio: string;

  /* =====================================================
     SERVICES
     
     These are actual services selected for the worker.
     Example:
     ["Visit", "Repair", "Emergency"]
  ===================================================== */

  services: string[];

  /* =====================================================
     DATABASE AVAILABLE SERVICES
  ===================================================== */

  availableServiceTypes: string[];

  /* =====================================================
     PRICING
  ===================================================== */

  pricingType: Worker["pricingType"];

  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;

  /* =====================================================
     VISIBLE PRICING OPTIONS
     
     Controls which pricing options can be displayed.
  ===================================================== */

  visiblePricingTypes: PriceKey[];

  /* =====================================================
     DISPLAY CHARGE
     
     IMPORTANT:
     This is NOT a service name.
     
     It stores the selected pricing key:
     
     per_job
     half_day
     full_day
     monthly
     visit_charge
     
     Example:
     
     displayService = "half_day"
     
     Profile:
     Half Day ₹600
  ===================================================== */

  displayService: PriceKey | null;

  /* =====================================================
     REVIEWS
  ===================================================== */

  rating: string;
  reviewCount: string;
  responseTime: string;

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  available: boolean;

  /* =====================================================
     PHOTO
  ===================================================== */

  photoPreview: string;
  selectedPhoto: File | null;
  photoError: string;
  loading: boolean;

  fileInputRef: React.RefObject<
    HTMLInputElement | null
  >;

  /* =====================================================
     ERROR
  ===================================================== */

  error: string;

  /* =====================================================
     BASIC SETTERS
  ===================================================== */

  setName: (
    value: string,
  ) => void;

  setPhone: (
    value: string,
  ) => void;

  setCategory: (
    value: string,
  ) => void;

  setSubcategory: (
    value: string,
  ) => void;

  setSpecialty: (
    value: string,
  ) => void;

  setLocation: (
    value: string,
  ) => void;

  setLabourChauk: (
    value: string,
  ) => void;

  /* =====================================================
     EXPERIENCE
  ===================================================== */

  setYearsExperience: (
    value: string,
  ) => void;

  setCompletedJobs: (
    value: string,
  ) => void;

  /* =====================================================
     ABOUT
  ===================================================== */

  setBio: (
    value: string,
  ) => void;

  /* =====================================================
     SERVICES
  ===================================================== */

  setServices: (
    values: string[],
  ) => void;

  /* =====================================================
     PRICING
  ===================================================== */

  setPricingType: (
    value: Worker["pricingType"],
  ) => void;

  setStartingPrice: (
    value: string,
  ) => void;

  setHalfDayPrice: (
    value: string,
  ) => void;

  setFullDayPrice: (
    value: string,
  ) => void;

  setMonthlyPrice: (
    value: string,
  ) => void;

  setVisitCharge: (
    value: string,
  ) => void;

  /* =====================================================
     VISIBLE PRICING
  ===================================================== */

  setVisiblePricingTypes: React.Dispatch<
    React.SetStateAction<PriceKey[]>
  >;

  /* =====================================================
     DISPLAY CHARGE
  ===================================================== */

  setDisplayService: (
    value: PriceKey | null,
  ) => void;

  /* =====================================================
     REVIEWS
  ===================================================== */

  setRating: (
    value: string,
  ) => void;

  setReviewCount: (
    value: string,
  ) => void;

  setResponseTime: (
    value: string,
  ) => void;

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  setAvailable: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  /* =====================================================
     PHOTO ACTIONS
  ===================================================== */

  onPhotoSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  onRemovePhoto: () => void;

  onUploadClick: () => void;
};

/* =====================================================
   COMPONENT
===================================================== */

export default function EditWorkerForm({
  name,
  phone,
  category,
  subcategory,
  specialty,
  location,
  labourChauk,

  yearsExperience,
  completedJobs,
  bio,

  services,
  availableServiceTypes,

  pricingType,
  startingPrice,
  halfDayPrice,
  fullDayPrice,
  monthlyPrice,
  visitCharge,
  visiblePricingTypes,

  displayService,

  rating,
  reviewCount,
  responseTime,

  available,

  photoPreview,
  selectedPhoto,
  photoError,
  loading,
  fileInputRef,

  error,

  setName,
  setPhone,
  setCategory,
  setSubcategory,
  setSpecialty,
  setLocation,
  setLabourChauk,

  setYearsExperience,
  setCompletedJobs,

  setBio,

  setServices,

  setPricingType,
  setStartingPrice,
  setHalfDayPrice,
  setFullDayPrice,
  setMonthlyPrice,
  setVisitCharge,
  setVisiblePricingTypes,

  setDisplayService,

  setRating,
  setReviewCount,
  setResponseTime,

  setAvailable,

  onPhotoSelect,
  onRemovePhoto,
  onUploadClick,
}: EditWorkerFormProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-28 [-webkit-overflow-scrolling:touch] sm:px-6 sm:py-6 sm:pb-28 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">

        {/* =================================================
            WORKER PHOTO
        ================================================= */}

        <WorkerPhotoSection
          name={name}
          photoPreview={photoPreview}
          selectedPhoto={selectedPhoto}
          photoError={photoError}
          loading={loading}
          fileInputRef={fileInputRef}
          onPhotoSelect={onPhotoSelect}
          onRemovePhoto={onRemovePhoto}
          onUploadClick={onUploadClick}
        />

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <BasicInformationSection
          name={name}
          phone={phone}
          category={category}
          subcategory={subcategory}
          specialty={specialty}
          location={location}
          labourChauk={labourChauk}
          setName={setName}
          setPhone={setPhone}
          setCategory={setCategory}
          setSubcategory={setSubcategory}
          setSpecialty={setSpecialty}
          setLocation={setLocation}
          setLabourChauk={setLabourChauk}
        />

        {/* =================================================
            SERVICE TYPES
           
            ONLY ACTUAL SERVICES ARE MANAGED HERE.
           
            Example:
           
            services = [
              "Visit",
              "Repair",
              "Emergency"
            ]
           
            Display Charge is completely separate.
        ================================================= */}

        <ServiceTypeSection
          services={services}
          setServices={setServices}
          availableServices={
            availableServiceTypes
          }
        />

        {/* =================================================
            EXPERIENCE
        ================================================= */}

        <ExperienceSection
          yearsExperience={
            yearsExperience
          }
          completedJobs={
            completedJobs
          }
          setYearsExperience={
            setYearsExperience
          }
          setCompletedJobs={
            setCompletedJobs
          }
        />

        {/* =================================================
            ABOUT WORKER
        ================================================= */}

        <AboutWorkerSection
          bio={bio}
          setBio={setBio}
        />

        {/* =================================================
            PRICING
           
            All actual prices are entered here.
           
            Display Charge is selected from the
            pricing options that have a valid price.
           
            Example:
           
            Starting Price   ₹300
            Half Day         ₹600
            Full Day         ₹1000
            Visit Charge     ₹200
           
            Display Charge:
            Half Day ₹600
           
            displayService = "half_day"
        ================================================= */}

        <PricingSection
          pricingType={
            pricingType
          }

          startingPrice={
            startingPrice
          }

          halfDayPrice={
            halfDayPrice
          }

          fullDayPrice={
            fullDayPrice
          }

          monthlyPrice={
            monthlyPrice
          }

          visitCharge={
            visitCharge
          }

          visiblePricingTypes={
            visiblePricingTypes
          }

          /* DISPLAY CHARGE */

          displayService={
            displayService
          }

          /* PRICING SETTERS */

          setPricingType={
            setPricingType
          }

          setStartingPrice={
            setStartingPrice
          }

          setHalfDayPrice={
            setHalfDayPrice
          }

          setFullDayPrice={
            setFullDayPrice
          }

          setMonthlyPrice={
            setMonthlyPrice
          }

          setVisitCharge={
            setVisitCharge
          }

          /* VISIBLE PRICING */

          setVisiblePricingTypes={
            setVisiblePricingTypes
          }

          /* DISPLAY CHARGE SETTER */

          setDisplayService={
            setDisplayService
          }
        />

        {/* =================================================
            REVIEWS
        ================================================= */}

        <ReviewsSection
          rating={rating}
          reviewCount={
            reviewCount
          }
          responseTime={
            responseTime
          }
          setRating={setRating}
          setReviewCount={
            setReviewCount
          }
          setResponseTime={
            setResponseTime
          }
        />

        {/* =================================================
            AVAILABILITY
        ================================================= */}

        <AvailabilitySection
          available={available}
          setAvailable={
            setAvailable
          }
        />

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs leading-5 text-red-600 sm:text-sm">
              {error}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}