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

  /* CURRENT WORKER SAVED SERVICES */
  services: string[];

  /* DATABASE AVAILABLE SERVICES */
  availableServiceTypes: string[];

  pricingType: Worker["pricingType"];
  startingPrice: string;
  halfDayPrice: string;
  fullDayPrice: string;
  monthlyPrice: string;
  visitCharge: string;
  visiblePricingTypes: PriceKey[];

  rating: string;
  reviewCount: string;
  responseTime: string;

  available: boolean;

  photoPreview: string;
  selectedPhoto: File | null;
  photoError: string;
  loading: boolean;

  fileInputRef: React.RefObject<
    HTMLInputElement | null
  >;

  error: string;

  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  setSpecialty: (value: string) => void;
  setLocation: (value: string) => void;
  setLabourChauk: (value: string) => void;

  setYearsExperience: (
    value: string,
  ) => void;

  setCompletedJobs: (
    value: string,
  ) => void;

  setBio: (
    value: string,
  ) => void;

  setServices: (
    values: string[],
  ) => void;

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

  setVisiblePricingTypes: React.Dispatch<
    React.SetStateAction<PriceKey[]>
  >;

  setRating: (
    value: string,
  ) => void;

  setReviewCount: (
    value: string,
  ) => void;

  setResponseTime: (
    value: string,
  ) => void;

  setAvailable: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  onPhotoSelect: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  onRemovePhoto: () => void;

  onUploadClick: () => void;
};

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

            services:
            Current worker ke saved/selected services

            availableServiceTypes:
            Database se available service types
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
        ================================================= */}

        <PricingSection
          pricingType={pricingType}
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
          setVisiblePricingTypes={
            setVisiblePricingTypes
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