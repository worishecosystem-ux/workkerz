
"use client";

import { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  CalendarDays,
  Images,
  UserRound,
  UserCheck,
  MapPin,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  LoaderCircle,
  BriefcaseBusiness,
} from "lucide-react";

import { useCompletedWorks } from "./useCompletedWorks";
import CompletedWorkGrid from "./CompletedWorkGrid";
import GalleryImage from "./GalleryImage";
import type { GalleryWork } from "./types";
import { formatDate } from "./utils";

export default function CompletedWorkGallery() {
  const { works, loading, error } = useCompletedWorks();

  const [selectedWork, setSelectedWork] =
    useState<GalleryWork | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  function openWork(work: GalleryWork) {
    setSelectedWork(work);
    setActiveImage(0);
  }

  function closeWork() {
    setSelectedWork(null);
    setActiveImage(0);
  }

  const images = selectedWork?.images ?? [];
  const activeImageData = images[activeImage];

  function previousImage() {
    if (images.length <= 1) return;

    setActiveImage((current) =>
      current <= 0 ? images.length - 1 : current - 1
    );
  }

  function nextImage() {
    if (images.length <= 1) return;

    setActiveImage((current) =>
      current >= images.length - 1 ? 0 : current + 1
    );
  }

  // Keyboard navigation and prevent background scrolling.
  useEffect(() => {
    if (!selectedWork) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeWork();
      if (event.key === "ArrowLeft") previousImage();
      if (event.key === "ArrowRight") nextImage();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWork, images.length]);

  return (
    <section className="relative overflow-hidden bg-[#f8faf8] px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-green-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Workkerz Portfolio
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              Real Work.
              <span className="text-emerald-600">
                {" "}Real Results.
              </span>
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Explore completed projects and the work delivered by
              professionals through Workkerz.
            </p>
          </div>

          {!loading && !error && works.length > 0 && (
            <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <BriefcaseBusiness className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-lg font-black leading-5 text-slate-900">
                  {works.length}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Completed projects
                </p>
              </div>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
              Loading completed work...
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* GRID */}
        {!loading && !error && (
          <CompletedWorkGrid
            works={works}
            onSelect={openWork}
          />
        )}

        {/* EMPTY STATE */}
        {!loading && !error && works.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <Images className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No completed projects available yet.
            </p>
          </div>
        )}

        {/* FOOTER */}
        {!loading && works.length > 0 && !error && (
          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Completed by professionals on Workkerz
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4 lg:p-5"
          onClick={closeWork}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="completed-work-title"
            className="relative flex max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl lg:h-[min(680px,90dvh)] lg:max-h-[680px]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Completed project
                  </p>
                  <h3
                    id="completed-work-title"
                    className="truncate text-sm font-bold text-slate-900 sm:text-base"
                  >
                    {selectedWork.work_name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeWork}
                aria-label="Close work details"
                className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:overflow-hidden">
              <div className="grid min-h-full grid-cols-1 lg:h-full lg:grid-cols-[1.05fr_1fr]">
                {/* IMAGE GALLERY */}
                <div className="flex min-w-0 flex-col bg-slate-950 lg:h-full lg:min-h-0">
                  {/* MAIN IMAGE */}
                  <div className="relative flex h-[300px] shrink-0 items-center justify-center overflow-hidden bg-slate-950 sm:h-[380px] lg:h-0 lg:min-h-0 lg:flex-1">
                    {activeImageData?.image_url ? (
                      <GalleryImage
                        key={
                          activeImageData.id ??
                          activeImageData.image_url
                        }
                        src={activeImageData.image_url}
                        alt={`${selectedWork.work_name} - photo ${activeImage + 1}`}
                        fit="contain"
                        fallbackClassName="bg-slate-950"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                        <Images className="h-8 w-8" />
                        <p className="text-sm">
                          No image available
                        </p>
                      </div>
                    )}

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={previousImage}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:bg-white"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={nextImage}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:bg-white"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>

                        <span className="absolute bottom-3 right-3 z-20 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                          {activeImage + 1} / {images.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* THUMBNAILS */}
                  {images.length > 1 && (
                    <div className="shrink-0 border-t border-white/10 px-3 py-3 sm:px-4">
                      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
                        {images.map((image, index) => (
                          <button
                            type="button"
                            key={
                              image.id ??
                              `${image.image_url}-${index}`
                            }
                            onClick={() => setActiveImage(index)}
                            aria-label={`View image ${index + 1}`}
                            aria-pressed={activeImage === index}
                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${
                              activeImage === index
                                ? "border-emerald-400 opacity-100"
                                : "border-white/20 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <GalleryImage
                              src={image.image_url}
                              alt={`Project photo ${index + 1}`}
                              fit="cover"
                              fallbackClassName="bg-slate-800"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PROJECT DETAILS */}
                <div className="min-w-0 bg-white p-4 sm:p-6 lg:h-full lg:overflow-y-auto lg:p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Work completed
                  </span>

                  <h4 className="mt-4 break-words text-xl font-black leading-tight text-slate-950 sm:text-2xl">
                    {selectedWork.work_name}
                  </h4>

                  {selectedWork.description && (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                      {selectedWork.description}
                    </p>
                  )}

                  {/* DATE AND TIME */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                        <CalendarDays className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">
                          Completion date
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatDate(selectedWork.completed_date)}
                        </p>
                      </div>
                    </div>

                    {selectedWork.completed_time && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <Clock3 className="h-5 w-5" />
                        </span>

                        <div>
                          <p className="text-xs text-slate-400">
                            Work time
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {selectedWork.completed_time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* WORK PROFESSIONAL */}
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Work professional
                    </p>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100">
                        {selectedWork.worker_photo ? (
                          <GalleryImage
                            src={selectedWork.worker_photo}
                            alt={selectedWork.worker_name}
                            fit="cover"
                          />
                        ) : (
                          <UserRound className="h-6 w-6" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedWork.worker_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Workkerz Professional
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOMER */}
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Booked by
                    </p>

                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <UserCheck className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {selectedWork.customer_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Workkerz Customer
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PHOTO COUNT */}
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-50/70 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <Images className="h-4 w-4" />
                      Project photos
                    </div>

                    <span className="text-sm font-black text-emerald-800">
                      {images.length}
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Project completed through Workkerz.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:px-6">
              <p className="text-xs text-slate-400">
                {images.length} project photo
                {images.length === 1 ? "" : "s"}
              </p>

              <button
                type="button"
                onClick={closeWork}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Close details
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
