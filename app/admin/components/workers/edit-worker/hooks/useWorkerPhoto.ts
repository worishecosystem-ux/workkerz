"use client";

import { useCallback, useEffect, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function useWorkerPhoto(initialPhoto = "") {
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    setPhotoPreview(initialPhoto || "");
    setSelectedPhoto(null);
    setPhotoError("");
  }, [initialPhoto]);

  const handlePhotoSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setPhotoError("");

      if (!ALLOWED_TYPES.includes(file.type)) {
        setPhotoError("Please select a JPG, PNG or WebP image.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setPhotoError("Image size must be less than 5 MB.");
        event.target.value = "";
        return;
      }

      setSelectedPhoto(file);

      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    },
    [],
  );

  const handleRemovePhoto = useCallback(() => {
    setSelectedPhoto(null);
    setPhotoPreview("");
    setPhotoError("");
  }, []);

  const resetPhoto = useCallback((photo = "") => {
    setPhotoPreview(photo);
    setSelectedPhoto(null);
    setPhotoError("");
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  return {
    photoPreview,
    selectedPhoto,
    photoError,
    setPhotoPreview,
    setSelectedPhoto,
    setPhotoError,
    handlePhotoSelect,
    handleRemovePhoto,
    resetPhoto,
  };
}