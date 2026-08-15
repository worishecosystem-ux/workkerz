"use client";

import {
  Check,
  ChevronDown,
  FileImage,
  Globe2,
  ImagePlus,
  Loader2,
  Send,
  Smartphone,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import NotificationTemplates from "./NotificationTemplates";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

import { supabase } from "@/lib/supabase";

import { notificationTypes } from "./NotificationFilters";

/* =====================================================
   TYPES
===================================================== */

export type UserOption = {
  id: string;
  email: string | null;
  name: string | null;
};

export type NotificationForm = {
  title: string;
  message: string;
  type: string;
  target: string;
  user_id: string;
  icon: string;
  image_url: string;
  action_url: string;
};

type Props = {
  open: boolean;
  sending: boolean;

  form: NotificationForm;

  users: UserOption[];

  showUsers: boolean;

  onClose: () => void;

  onSend: (
    overrideForm?: NotificationForm
  ) => void | Promise<void>;

  onChange: (
    key: keyof NotificationForm,
    value: string
  ) => void;

  onToggleUsers: () => void;

  onSelectUser: (id: string) => void;

  onTypeChange: (type: string) => void;
};

/* =====================================================
   CONSTANTS
===================================================== */

const MAX_IMAGE_SIZE = 1024 * 1024;

const STORAGE_BUCKET = "notification-images";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/* =====================================================
   COMPONENT
===================================================== */

export default function NotificationCreateDrawer({
  open,
  sending,
  form,
  users,
  showUsers,
  onClose,
  onSend,
  onChange,
  onToggleUsers,
  onSelectUser,
  onTypeChange,
}: Props) {
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [uploadError, setUploadError] =
    useState("");

  const [appVersion, setAppVersion] =
    useState("");

  const [fetchingVersion, setFetchingVersion] =
    useState(false);

  const [versionSource, setVersionSource] =
    useState<
      "capacitor" | "manual" | "fallback"
    >("fallback");

  /* ===================================================
     SELECTED USER
  =================================================== */

  const selectedUser = users.find(
    (user) => user.id === form.user_id
  );

  /* ===================================================
     FETCH CAPACITOR VERSION
  =================================================== */

  const fetchAppVersion =
    useCallback(async () => {
      setFetchingVersion(true);

      try {
        /*
         * Native Android / iOS
         */

        if (Capacitor.isNativePlatform()) {
          const info = await App.getInfo();

          const version =
            info.version?.trim();

          if (version) {
            setAppVersion(version);
            setVersionSource("capacitor");

            return version;
          }
        }

        /*
         * Browser fallback
         */

        const manualVersion =
          appVersion.trim();

        if (manualVersion) {
          setVersionSource("manual");

          return manualVersion;
        }

        setVersionSource("fallback");

        return "1.0.0";
      } catch (error) {
        console.error(
          "App version fetch error:",
          error
        );

        const fallback =
          appVersion.trim() || "1.0.0";

        setVersionSource(
          appVersion.trim()
            ? "manual"
            : "fallback"
        );

        return fallback;
      } finally {
        setFetchingVersion(false);
      }
    }, [appVersion]);

  /* ===================================================
     AUTO FETCH VERSION
  =================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    void fetchAppVersion();
  }, [open, fetchAppVersion]);

  /* ===================================================
     BUILD APP UPDATE
  =================================================== */

  const buildAppUpdate =
    async (): Promise<NotificationForm> => {
      const version =
        appVersion.trim() ||
        (await fetchAppVersion()) ||
        "1.0.0";

      return {
        ...form,

        title:
          `Workkerz App ${version} is now live`,

        message:
          `A new version of the Workkerz app is now available. Update to version ${version} to get the latest features, performance improvements and bug fixes. Update your app now for the best Workkerz experience.`,

        type: "system",

        target: "global",

        user_id: "",

        icon: "🚀",

        image_url:
          form.image_url || "",

        action_url:
          "https://play.google.com/store/apps/details?id=com.workkerz.app",
      };
    };

  /* ===================================================
     APPLY APP UPDATE TEMPLATE
  =================================================== */

  const applyAppUpdateTemplate =
    async () => {
      const nextForm =
        await buildAppUpdate();

      onChange(
        "title",
        nextForm.title
      );

      onChange(
        "message",
        nextForm.message
      );

      onChange(
        "type",
        nextForm.type
      );

      onChange(
        "target",
        nextForm.target
      );

      onChange(
        "user_id",
        nextForm.user_id
      );

      onChange(
        "icon",
        nextForm.icon
      );

      onChange(
        "action_url",
        nextForm.action_url
      );
    };

  /* ===================================================
     SEND APP UPDATE DIRECTLY
  =================================================== */

  const sendAppUpdate = async () => {
    if (
      sending ||
      uploadingImage ||
      fetchingVersion
    ) {
      return;
    }

    const nextForm =
      await buildAppUpdate();

    await onSend(nextForm);
  };

  /* ===================================================
     PROMOTION TEMPLATE
  =================================================== */

  const applyPromoTemplate = () => {
    onChange(
      "title",
      "Special Offer for You"
    );

    onChange(
      "message",
      "Discover our latest offers and get more value with Workkerz. Check out what's new today."
    );

    onChange(
      "type",
      "offer"
    );

    onChange(
      "target",
      "global"
    );

    onChange(
      "user_id",
      ""
    );

    onChange(
      "icon",
      "🎁"
    );

    onChange(
      "action_url",
      "/"
    );
  };

  /* ===================================================
     ANNOUNCEMENT TEMPLATE
  =================================================== */

  const applyAnnouncementTemplate = () => {
    onChange(
      "title",
      "Important Workkerz Update"
    );

    onChange(
      "message",
      "We have an important update for you. Please open the Workkerz app to explore the latest changes and improvements."
    );

    onChange(
      "type",
      "system"
    );

    onChange(
      "target",
      "global"
    );

    onChange(
      "user_id",
      ""
    );

    onChange(
      "icon",
      "📢"
    );

    onChange(
      "action_url",
      "/"
    );
  };

  /* ===================================================
     IMAGE UPLOAD
  =================================================== */

  const handleImageUpload = async (
    file: File
  ) => {
    setUploadError("");

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setUploadError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      return;
    }

    if (file.size >= MAX_IMAGE_SIZE) {
      setUploadError(
        "Image must be less than 1 MB."
      );

      return;
    }

    try {
      setUploadingImage(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const fileName =
        `notification-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}.${extension}`;

      const filePath =
        `marketing/${fileName}`;

      const {
        error: storageError,
      } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (storageError) {
        console.error(
          "Notification image upload error:",
          storageError
        );

        setUploadError(
          storageError.message ||
            "Image upload failed."
        );

        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(
          filePath
        );

      const publicUrl =
        publicUrlData.publicUrl;

      if (!publicUrl) {
        setUploadError(
          "Unable to create image URL."
        );

        return;
      }

      onChange(
        "image_url",
        publicUrl
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  /* ===================================================
     FILE CHANGE
  =================================================== */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    void handleImageUpload(file);
  };

  /* ===================================================
     REMOVE IMAGE
  =================================================== */

  const removeImage = () => {
    onChange(
      "image_url",
      ""
    );

    setUploadError("");
  };

  /* ===================================================
     CLOSED
  =================================================== */

  if (!open) {
    return null;
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-full flex-col bg-[#f5f7f6]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-30 shrink-0 border-b border-gray-200/80 bg-white/95 backdrop-blur">

        <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={
                sending ||
                uploadingImage
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-500
                transition
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              <X size={18} />
            </button>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="hidden rounded-full bg-green-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-green-700 sm:inline-flex">
                  Marketing
                </span>

                <h1 className="truncate text-base font-black tracking-tight text-gray-950 sm:text-lg">
                  Create Notification
                </h1>

              </div>

              <p className="mt-0.5 truncate text-[11px] text-gray-400 sm:text-xs">
                Create, preview and publish user communications
              </p>

            </div>

          </div>

          <div className="hidden items-center gap-2 sm:flex">

            <button
              type="button"
              onClick={onClose}
              disabled={
                sending ||
                uploadingImage
              }
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                void onSend()
              }
              disabled={
                sending ||
                uploadingImage
              }
              className="
                flex
                min-w-[190px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-green-600
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-green-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {sending ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Send Notification
                </>
              )}
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="flex-1 overflow-y-auto">

        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 pb-28 sm:px-6 sm:py-7 lg:px-8">

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-5">

              {/* =================================================
                  QUICK TEMPLATES
              ================================================= */}

              <NotificationTemplates
                currentVersion={
                  appVersion || "1.0.0"
                }
                onApply={(template) => {
                  onChange(
                    "title",
                    template.title
                  );

                  onChange(
                    "message",
                    template.message
                  );

                  onChange(
                    "type",
                    template.type
                  );

                  onChange(
                    "target",
                    "global"
                  );

                  onChange(
                    "user_id",
                    ""
                  );

                  onChange(
                    "icon",
                    template.icon
                  );

                  onChange(
                    "action_url",
                    template.action_url
                  );
                }}
              />

              {/* =================================================
                  CONTENT
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.035)]">

                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h2 className="text-sm font-black text-gray-900">
                        Notification Content
                      </h2>

                      <p className="mt-1 text-[11px] text-gray-400">
                        Create the communication users will receive.
                      </p>

                    </div>

                    <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                      Required
                    </span>

                  </div>

                </div>

                <div className="space-y-5 p-5 sm:p-6">

                  {/* TITLE */}

                  <Field label="Notification Title">

                    <input
                      value={form.title}
                      onChange={(event) =>
                        onChange(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Workkerz App 1.2.0 is now live"
                      maxLength={120}
                      className={inputClass}
                    />

                    <Counter
                      value={
                        form.title.length
                      }
                      max={120}
                    />

                  </Field>

                  {/* MESSAGE */}

                  <Field label="Message">

                    <textarea
                      value={form.message}
                      onChange={(event) =>
                        onChange(
                          "message",
                          event.target.value
                        )
                      }
                      placeholder="Write your notification message..."
                      rows={7}
                      maxLength={500}
                      className="
                        min-h-[170px]
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-gray-200
                        bg-gray-50
                        px-3.5
                        py-3.5
                        text-sm
                        leading-6
                        text-gray-800
                        outline-none
                        transition
                        placeholder:text-gray-400
                        focus:border-green-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-green-50
                      "
                    />

                    <Counter
                      value={
                        form.message.length
                      }
                      max={500}
                    />

                  </Field>

                  {/* CATEGORY */}

                  <Field label="Notification Category">

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">

                      {notificationTypes.map(
                        (type) => {
                          const active =
                            form.type ===
                            type.value;

                          return (
                            <button
                              key={
                                type.value
                              }
                              type="button"
                              onClick={() =>
                                onTypeChange(
                                  type.value
                                )
                              }
                              className={`
                                flex
                                min-h-[48px]
                                items-center
                                gap-2.5
                                rounded-xl
                                border
                                px-3
                                text-left
                                text-xs
                                font-bold
                                transition
                                ${
                                  active
                                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }
                              `}
                            >

                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-base">
                                {type.icon}
                              </span>

                              <span className="truncate">
                                {type.label}
                              </span>

                              {active && (
                                <Check
                                  size={14}
                                  className="ml-auto shrink-0 text-green-600"
                                />
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </Field>

                  {/* ICON */}

                  <Field label="Notification Icon">

                    <div className="flex gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xl">
                        {form.icon ||
                          "📢"}
                      </div>

                      <input
                        value={
                          form.icon
                        }
                        onChange={(event) =>
                          onChange(
                            "icon",
                            event.target.value
                          )
                        }
                        placeholder="📢"
                        maxLength={10}
                        className={`${inputClass} text-lg`}
                      />

                    </div>

                  </Field>

                  {/* ACTION URL */}

                  <Field label="Open Page After Notification Click">

                    <input
                      value={
                        form.action_url
                      }
                      onChange={(event) =>
                        onChange(
                          "action_url",
                          event.target.value
                        )
                      }
                      placeholder="/update"
                      className={
                        inputClass
                      }
                    />

                    <p className="mt-1.5 text-[10px] text-gray-400">
                      App Update template automatically uses{" "}
                      <span className="font-bold text-gray-500">
                        /update
                      </span>
                      .
                    </p>

                  </Field>

                </div>

              </section>

              {/* =================================================
                  IMAGE
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.035)]">

                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                  <h2 className="text-sm font-black text-gray-900">
                    Marketing Image
                  </h2>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Upload directly to Supabase. Maximum size: less than 1 MB.
                  </p>

                </div>

                <div className="p-5 sm:p-6">

                  {form.image_url ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                      <div className="relative aspect-[16/7] overflow-hidden bg-gray-100">

                        <img
                          src={
                            form.image_url
                          }
                          alt="Notification"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={
                            removeImage
                          }
                          disabled={
                            sending
                          }
                          className="
                            absolute
                            right-3
                            top-3
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-white/95
                            text-red-500
                            shadow-lg
                            transition
                            hover:bg-white
                            disabled:opacity-50
                          "
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                      <div className="flex items-center justify-between gap-3 p-3">

                        <div className="flex min-w-0 items-center gap-2">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                            <FileImage
                              size={15}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-bold text-gray-700">
                              Image uploaded
                            </p>

                            <p className="truncate text-[10px] text-gray-400">
                              Ready to send
                            </p>

                          </div>

                        </div>

                        <label className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold text-gray-600 transition hover:bg-gray-50">

                          Replace

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                              handleFileChange
                            }
                            disabled={
                              uploadingImage ||
                              sending
                            }
                            className="hidden"
                          />

                        </label>

                      </div>

                    </div>
                  ) : (
                    <label
                      className={`
                        group
                        flex
                        min-h-[220px]
                        cursor-pointer
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border-2
                        border-dashed
                        px-5
                        text-center
                        transition
                        ${
                          uploadingImage
                            ? "cursor-wait border-green-300 bg-green-50"
                            : "border-gray-200 bg-gray-50/70 hover:border-green-400 hover:bg-green-50/40"
                        }
                      `}
                    >

                      {uploadingImage ? (
                        <>
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                            <Loader2
                              size={26}
                              className="animate-spin"
                            />
                          </div>

                          <p className="mt-4 text-sm font-bold text-gray-800">
                            Uploading...
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            Please wait
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm transition group-hover:bg-green-50 group-hover:text-green-600">
                            <ImagePlus
                              size={26}
                            />
                          </div>

                          <p className="mt-4 text-sm font-bold text-gray-800">
                            Upload marketing image
                          </p>

                          <p className="mt-1 text-[11px] text-gray-400">
                            JPG, PNG or WEBP
                          </p>

                          <span className="mt-4 rounded-lg bg-green-50 px-3 py-1.5 text-[9px] font-bold text-green-700">
                            LESS THAN 1 MB
                          </span>

                          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-400">
                            <UploadCloud
                              size={13}
                            />
                            Direct Supabase upload
                          </div>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleFileChange
                        }
                        disabled={
                          uploadingImage ||
                          sending
                        }
                        className="hidden"
                      />

                    </label>
                  )}

                  {uploadError && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[11px] font-semibold text-red-600">
                      {uploadError}
                    </div>
                  )}

                </div>

              </section>

              {/* =================================================
                  RECIPIENT
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.035)]">

                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

                  <h2 className="text-sm font-black text-gray-900">
                    Recipients
                  </h2>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Choose who receives this notification.
                  </p>

                </div>

                <div className="p-5 sm:p-6">

                  <div className="grid gap-3 sm:grid-cols-2">

                    <TargetButton
                      active={
                        form.target ===
                        "global"
                      }
                      icon={
                        <Globe2
                          size={20}
                        />
                      }
                      title="All Users"
                      description="Send to everyone"
                      onClick={() => {
                        onChange(
                          "target",
                          "global"
                        );

                        onChange(
                          "user_id",
                          ""
                        );
                      }}
                    />

                    <TargetButton
                      active={
                        form.target ===
                        "user"
                      }
                      icon={
                        <UserRound
                          size={20}
                        />
                      }
                      title="Specific User"
                      description="Send to one user"
                      onClick={() =>
                        onChange(
                          "target",
                          "user"
                        )
                      }
                    />

                  </div>

                  {/* GLOBAL */}

                  {form.target ===
                    "global" && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-600">
                        <Globe2
                          size={18}
                        />
                      </div>

                      <div>

                        <p className="text-xs font-black text-green-800">
                          All Users Selected
                        </p>

                        <p className="mt-0.5 text-[10px] text-green-600">
                          This notification will be sent to everyone.
                        </p>

                      </div>

                    </div>
                  )}

                  {/* SPECIFIC USER */}

                  {form.target ===
                    "user" && (
                    <div className="mt-5">

                      <label className="mb-1.5 block text-xs font-bold text-gray-700">
                        Select User
                      </label>

                      {/* SELECTED USER BUTTON */}

                      <button
                        type="button"
                        onClick={
                          onToggleUsers
                        }
                        className="
                          flex
                          min-h-12
                          w-full
                          items-center
                          justify-between
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          px-3
                          text-left
                          transition
                          hover:bg-white
                          focus:border-green-500
                          focus:ring-4
                          focus:ring-green-50
                        "
                      >

                        <span className="flex min-w-0 items-center gap-2.5">

                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <UserRound
                              size={15}
                            />
                          </span>

                          <span className="min-w-0">

                            {selectedUser ? (
                              <>
                                <span className="block truncate text-sm font-bold text-gray-700">
                                  {selectedUser.name ||
                                    "User"}
                                </span>

                                {selectedUser.email && (
                                  <span className="block truncate text-[10px] text-gray-400">
                                    {
                                      selectedUser.email
                                    }
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="block truncate text-sm font-bold text-gray-500">
                                Select user
                              </span>
                            )}

                          </span>

                        </span>

                        <ChevronDown
                          size={16}
                          className={`
                            shrink-0
                            text-gray-400
                            transition
                            ${
                              showUsers
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        />

                      </button>

                      {/* USER LIST */}

                      {showUsers && (
                        <div className="mt-2 max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">

                          {users.length ===
                          0 ? (
                            <div className="p-8 text-center">

                              <UserRound
                                size={28}
                                className="mx-auto text-gray-300"
                              />

                              <p className="mt-2 text-xs font-bold text-gray-500">
                                No users found
                              </p>

                            </div>
                          ) : (
                            users.map(
                              (user) => {
                                const active =
                                  form.user_id ===
                                  user.id;

                                return (
                                  <button
                                    key={
                                      user.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      onSelectUser(
                                        user.id
                                      )
                                    }
                                    className={`
                                      flex
                                      w-full
                                      items-center
                                      gap-3
                                      border-b
                                      border-gray-100
                                      px-4
                                      py-3
                                      text-left
                                      last:border-0
                                      ${
                                        active
                                          ? "bg-green-50"
                                          : "hover:bg-gray-50"
                                      }
                                    `}
                                  >

                                    <div
                                      className={`
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        ${
                                          active
                                            ? "bg-white text-green-600"
                                            : "bg-gray-100 text-gray-500"
                                        }
                                      `}
                                    >
                                      <UserRound
                                        size={
                                          16
                                        }
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                      <p className="truncate text-xs font-bold text-gray-800">
                                        {user.name ||
                                          "User"}
                                      </p>

                                      {user.email ? (
                                        <p className="mt-0.5 truncate text-[10px] text-gray-400">
                                          {
                                            user.email
                                          }
                                        </p>
                                      ) : (
                                        <p className="mt-0.5 text-[10px] text-gray-400">
                                          Email not available
                                        </p>
                                      )}

                                    </div>

                                    {active && (
                                      <Check
                                        size={
                                          17
                                        }
                                        className="shrink-0 text-green-600"
                                      />
                                    )}

                                  </button>
                                );
                              }
                            )
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>

              </section>

            </div>

            {/* =================================================
                PREVIEW
            ================================================= */}

            <aside className="xl:sticky xl:top-[96px] xl:self-start">

              <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.035)]">

                <div className="border-b border-gray-100 px-5 py-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-sm font-black text-gray-900">
                        Live Preview
                      </h2>

                      <p className="mt-1 text-[11px] text-gray-400">
                        Preview before publishing.
                      </p>

                    </div>

                    <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-700">

                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                      LIVE

                    </span>

                  </div>

                </div>

                <div className="p-5">

                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {form.image_url && (
                      <div className="aspect-[16/8] overflow-hidden bg-gray-100">

                        <img
                          src={
                            form.image_url
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />

                      </div>
                    )}

                    <div className="p-4">

                      <div className="flex gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl">
                          {form.icon ||
                            "📢"}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-black text-gray-900">
                            {form.title ||
                              "Notification title"}
                          </p>

                          <p className="mt-1.5 line-clamp-6 text-xs leading-5 text-gray-500">
                            {form.message ||
                              "Your notification message will appear here."}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="mt-4 space-y-2">

                    <PreviewMeta
                      label="Category"
                      value={
                        form.type ||
                        "system"
                      }
                    />

                    <PreviewMeta
                      label="Recipient"
                      value={
                        form.target ===
                        "global"
                          ? "All Users"
                          : selectedUser?.name ||
                            selectedUser?.email ||
                            "No user selected"
                      }
                    />

                    <PreviewMeta
                      label="Version"
                      value={
                        appVersion ||
                        "1.0.0"
                      }
                    />

                    <PreviewMeta
                      label="Open Page"
                      value={
                        form.action_url ||
                        "None"
                      }
                    />

                  </div>

                  {form.action_url ===
                    "/update" && (
                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3">

                      <div className="flex items-start gap-2.5">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-600">
                          <Smartphone
                            size={14}
                          />
                        </div>

                        <div>

                          <p className="text-[10px] font-black text-green-800">
                            App Update Campaign
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-green-600">
                            Tapping the notification can open the update page.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">

                    <div className="flex items-start gap-2.5">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-green-600">
                        <Send
                          size={14}
                        />
                      </div>

                      <div>

                        <p className="text-[10px] font-black text-gray-700">
                          Ready to publish
                        </p>

                        <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
                          Review your content and recipient before sending.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

            </aside>

          </div>

        </div>

      </main>

      {/* =================================================
          MOBILE ACTION BAR
      ================================================= */}

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">

        <button
          type="button"
          onClick={onClose}
          disabled={
            sending ||
            uploadingImage
          }
          className="
            flex-1
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            font-bold
            text-gray-700
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            void onSend()
          }
          disabled={
            sending ||
            uploadingImage
          }
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-green-600
            px-4
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            disabled:opacity-60
          "
        >

          {sending ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Sending...
            </>
          ) : (
            <>
              <Send size={17} />
              Send
            </>
          )}

        </button>

      </div>

    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-bold text-gray-700">
        {label}
      </label>

      {children}

    </div>
  );
}

/* =====================================================
   COUNTER
===================================================== */

function Counter({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  return (
    <p className="mt-1.5 text-right text-[10px] text-gray-400">
      {value}/{max}
    </p>
  );
}

/* =====================================================
   TARGET BUTTON
===================================================== */

function TargetButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        min-h-[82px]
        items-center
        gap-3
        rounded-xl
        border
        p-4
        text-left
        transition
        ${
          active
            ? "border-green-500 bg-green-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >

      <span
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${
            active
              ? "bg-white text-green-600"
              : "bg-gray-50 text-gray-400"
          }
        `}
      >
        {icon}
      </span>

      <div className="min-w-0">

        <p
          className={`
            text-xs
            font-black
            ${
              active
                ? "text-green-700"
                : "text-gray-800"
            }
          `}
        >
          {title}
        </p>

        <p className="mt-1 text-[10px] text-gray-400">
          {description}
        </p>

      </div>

      {active && (
        <Check
          size={17}
          className="ml-auto shrink-0 text-green-600"
        />
      )}

    </button>
  );
}

/* =====================================================
   PREVIEW META
===================================================== */

function PreviewMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">

      <span className="text-[10px] font-semibold text-gray-400">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-[10px] font-black capitalize text-gray-700">
        {value}
      </span>

    </div>
  );
}

/* =====================================================
   INPUT
===================================================== */

const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50";