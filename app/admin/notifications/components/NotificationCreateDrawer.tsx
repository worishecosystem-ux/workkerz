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
  onSend: (overrideForm?: NotificationForm) => void | Promise<void>;
  onChange: (key: keyof NotificationForm, value: string) => void;
  onToggleUsers: () => void;
  onSelectUser: (id: string) => void;
  onTypeChange: (type: string) => void;
};

const MAX_IMAGE_SIZE = 1024 * 1024;
const STORAGE_BUCKET = "notification-images";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [fetchingVersion, setFetchingVersion] = useState(false);

  const [versionSource, setVersionSource] = useState<
    "capacitor" | "manual" | "fallback"
  >("fallback");

  const selectedUser = users.find((user) => user.id === form.user_id);

  const fetchAppVersion = useCallback(async () => {
    setFetchingVersion(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const info = await App.getInfo();
        const version = info.version?.trim();

        if (version) {
          setAppVersion(version);
          setVersionSource("capacitor");
          return version;
        }
      }

      const manualVersion = appVersion.trim();

      if (manualVersion) {
        setVersionSource("manual");
        return manualVersion;
      }

      setVersionSource("fallback");
      return "1.0.0";
    } catch (error) {
      console.error("App version fetch error:", error);

      const fallback = appVersion.trim() || "1.0.0";

      setVersionSource(appVersion.trim() ? "manual" : "fallback");

      return fallback;
    } finally {
      setFetchingVersion(false);
    }
  }, [appVersion]);

  useEffect(() => {
    if (!open) return;
    void fetchAppVersion();
  }, [open, fetchAppVersion]);

  const buildAppUpdate = async (): Promise<NotificationForm> => {
    const version = appVersion.trim() || (await fetchAppVersion()) || "1.0.0";

    return {
      ...form,
      title: `Workkerz App ${version} is now live`,
      message: `A new version of the Workkerz app is now available. Update to version ${version} to get the latest features, performance improvements and bug fixes. Update your app now for the best Workkerz experience.`,
      type: "system",
      target: "global",
      user_id: "",
      icon: "🚀",
      image_url: form.image_url || "",
      action_url:
        "https://play.google.com/store/apps/details?id=com.workkerz.app",
    };
  };

  const applyAppUpdateTemplate = async () => {
    const nextForm = await buildAppUpdate();

    onChange("title", nextForm.title);
    onChange("message", nextForm.message);
    onChange("type", nextForm.type);
    onChange("target", nextForm.target);
    onChange("user_id", nextForm.user_id);
    onChange("icon", nextForm.icon);
    onChange("action_url", nextForm.action_url);
  };

  const sendAppUpdate = async () => {
    if (sending || uploadingImage || fetchingVersion) {
      return;
    }

    const nextForm = await buildAppUpdate();
    await onSend(nextForm);
  };

  const applyPromoTemplate = () => {
    onChange("title", "Special Offer for You");

    onChange(
      "message",
      "Discover our latest offers and get more value with Workkerz. Check out what's new today.",
    );

    onChange("type", "offer");
    onChange("target", "global");
    onChange("user_id", "");
    onChange("icon", "🎁");
    onChange("action_url", "/");
  };

  const applyAnnouncementTemplate = () => {
    onChange("title", "Important Workkerz Update");

    onChange(
      "message",
      "We have an important update for you. Please open the Workkerz app to explore the latest changes and improvements.",
    );

    onChange("type", "system");
    onChange("target", "global");
    onChange("user_id", "");
    onChange("icon", "📢");
    onChange("action_url", "/");
  };

  const handleImageUpload = async (file: File) => {
    setUploadError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size >= MAX_IMAGE_SIZE) {
      setUploadError("Image must be less than 1 MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}.${extension}`;

      const filePath = `marketing/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (storageError) {
        console.error("Notification image upload error:", storageError);

        setUploadError(storageError.message || "Image upload failed.");

        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        setUploadError("Unable to create image URL.");
        return;
      }

      onChange("image_url", publicUrl);
    } catch (error) {
      console.error("Image upload error:", error);

      setUploadError(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    void handleImageUpload(file);
  };

  const removeImage = () => {
    onChange("image_url", "");
    setUploadError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-full flex-col bg-[#f5f7f6]">
      {/* HEADER */}
      <header
        className="
    sticky top-0 z-30 shrink-0
    border-b border-sky-200/70
    bg-gradient-to-r
    from-sky-50
    via-white
    to-lime-50
    shadow-[0_2px_12px_rgba(14,165,233,0.08)]
    backdrop-blur-xl
  "
      >
        <div
          className="
      mx-auto flex min-h-24 w-full max-w-360
      items-center justify-between
      gap-3
      px-3 pt-15 pb-3

      sm:min-h-17
      sm:px-5
      sm:pt-2.5

      lg:min-h-18
      lg:px-8
      lg:pt-3
    "
        >
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {/* TITLE */}
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                {/* MARKETING BADGE */}
                <span
                  className="
              hidden
              rounded-full
              border border-lime-200
              bg-lime-50
              px-2 py-1
              text-[8px]
              font-bold
              uppercase
              tracking-wider
              text-lime-700
              shadow-sm
              md:inline-flex
              lg:px-2.5
              lg:text-[9px]
            "
                >
                  Marketing
                </span>

                {/* MOBILE/TABLET SMALL DOT */}
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 md:hidden" />

                <h1
                  className="
              truncate
              text-sm
              font-black
              tracking-tight
              text-slate-900
              sm:text-base
              lg:text-lg
            "
                >
                  Create Notification
                </h1>
              </div>

              <p
                className="
            mt-0.5
            truncate
            text-[9px]
            text-slate-500
            sm:text-[11px]
            lg:text-xs
          "
              >
                Create, preview and publish user communications
              </p>
            </div>
          </div>

          {/* DESKTOP ONLY ACTIONS */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* CANCEL */}
            <button
              type="button"
              onClick={onClose}
              disabled={sending || uploadingImage}
              className="
          relative
          overflow-hidden
          rounded-xl
          border border-sky-200
          bg-white/80
          px-4 py-2.5
          text-sm
          font-bold
          text-slate-700
          shadow-sm
          backdrop-blur-sm
          transition-all
          hover:border-sky-300
          hover:bg-sky-50
          hover:text-sky-800
          active:scale-95
          disabled:opacity-50
        "
            >
              {/* FOLD */}
              <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 overflow-hidden">
                <span className="absolute -right-1 -top-1 h-6 w-6 rotate-45 bg-sky-100" />
                <span className="absolute right-0 top-0 h-3 w-3 rounded-bl-md bg-sky-700/10" />
              </span>

              <span className="relative z-10">Cancel</span>
            </button>

            {/* SEND */}
            <button
              type="button"
              onClick={() => void onSend()}
              disabled={sending || uploadingImage}
              className="
          relative
          flex
          min-w-[190px]
          items-center
          justify-center
          gap-2
          overflow-hidden
          rounded-xl
          border border-emerald-300
          bg-gradient-to-br
          from-emerald-50
          via-lime-50
          to-lime-100
          px-5 py-2.5
          text-sm
          font-bold
          text-emerald-800
          shadow-sm
          shadow-emerald-100
          transition-all
          hover:border-emerald-400
          hover:from-emerald-100
          hover:via-lime-100
          hover:to-lime-200
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
            >
              {/* TOP RIGHT DARK FOLD */}
              <span className="pointer-events-none absolute right-0 top-0 h-7 w-7 overflow-hidden">
                <span className="absolute -right-2 -top-2 h-9 w-9 rotate-45 bg-lime-300/70" />
                <span className="absolute right-0 top-0 h-4.5 w-4.5 rounded-bl-lg bg-emerald-800/20" />
              </span>

              {/* BOTTOM LEFT DARK FOLD */}
              <span className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 overflow-hidden">
                <span className="absolute -bottom-2 -left-2 h-8 w-8 rotate-45 bg-sky-200/50" />
                <span className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-tr-lg bg-emerald-800/15" />
              </span>

              {sending ? (
                <>
                  <Loader2 size={17} className="relative z-10 animate-spin" />

                  <span className="relative z-10">Sending...</span>
                </>
              ) : (
                <>
                  <Send size={17} className="relative z-10" />

                  <span className="relative z-10">Send Notification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
  <div className="mx-auto w-full max-w-[1440px] px-3 py-3 pb-28 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-8 lg:py-7">
    {/* MOBILE + TABLET = 1 COLUMN / DESKTOP = 2 COLUMN */}
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
      {/* LEFT */}
      <div className="min-w-0 space-y-3 sm:space-y-4 md:space-y-5">

        {/* QUICK TEMPLATES */}
        <NotificationTemplates
          currentVersion={appVersion || "1.0.0"}
          onApply={(template) => {
            onChange("title", template.title);
            onChange("message", template.message);
            onChange("type", template.type);
            onChange("target", "global");
            onChange("user_id", "");
            onChange("icon", template.icon);
            onChange("action_url", template.action_url);
          }}
        />

        {/* CONTENT */}
        <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)] sm:rounded-2xl lg:shadow-[0_4px_24px_rgba(0,0,0,0.035)]">
          <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 lg:px-6">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h2 className="text-xs font-black text-gray-900 sm:text-sm">
                  Notification Content
                </h2>

                <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-[11px]">
                  Create the communication users will receive.
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-gray-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-gray-400 sm:px-2.5 sm:py-1.5 sm:text-[9px]">
                Required
              </span>
            </div>
          </div>

          <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:space-y-5 md:p-5 lg:p-6">

            {/* TITLE */}
            <Field label="Notification Title">
              <input
                value={form.title}
                onChange={(event) =>
                  onChange("title", event.target.value)
                }
                placeholder="e.g. Workkerz App 1.2.0 is now live"
                maxLength={120}
                className={`${inputClass} h-10 text-xs sm:h-11 sm:text-sm`}
              />

              <Counter value={form.title.length} max={120} />
            </Field>

            {/* MESSAGE */}
            <Field label="Message">
              <textarea
                value={form.message}
                onChange={(event) =>
                  onChange("message", event.target.value)
                }
                placeholder="Write your notification message..."
                rows={6}
                maxLength={500}
                className="min-h-[125px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 sm:min-h-[145px] sm:px-3.5 sm:py-3.5 sm:text-sm sm:leading-6 md:min-h-[170px]"
              />

              <Counter value={form.message.length} max={500} />
            </Field>

            {/* CATEGORY */}
            <Field label="Notification Category">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4">
                {notificationTypes.map((type) => {
                  const active = form.type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => onTypeChange(type.value)}
                      className={`
                        flex
                        min-h-[46px]
                        items-center
                        gap-2
                        rounded-lg
                        border
                        px-2
                        text-left
                        text-[10px]
                        font-bold
                        transition
                        sm:min-h-[52px]
                        sm:gap-2.5
                        sm:rounded-xl
                        sm:px-3
                        sm:text-xs
                        md:min-h-[56px]
                        ${
                          active
                            ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-sm sm:h-8 sm:w-8 sm:text-base md:h-9 md:w-9 md:text-lg">
                        {type.icon}
                      </span>

                      <span className="min-w-0 truncate">
                        {type.label}
                      </span>

                      {active && (
                        <Check
                          size={13}
                          className="ml-auto shrink-0 text-green-600 sm:h-3.5 sm:w-3.5"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* ICON */}
            <Field label="Notification Icon">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-lg sm:h-11 sm:w-11 sm:rounded-xl sm:text-xl md:h-12 md:w-12 md:text-2xl">
                  {form.icon || "📢"}
                </div>

                <input
                  value={form.icon}
                  onChange={(event) =>
                    onChange("icon", event.target.value)
                  }
                  placeholder="📢"
                  maxLength={10}
                  className={`${inputClass} min-w-0 text-base sm:text-lg`}
                />
              </div>
            </Field>

            {/* ACTION URL */}
            <Field label="Open Page After Notification Click">
              <input
                value={form.action_url}
                onChange={(event) =>
                  onChange("action_url", event.target.value)
                }
                placeholder="/update"
                className={`${inputClass} h-10 text-xs sm:h-11 sm:text-sm`}
              />

              <p className="mt-1.5 text-[9px] text-gray-400 sm:text-[10px]">
                App Update template automatically uses{" "}
                <span className="font-bold text-gray-500">/update</span>.
              </p>
            </Field>
          </div>
        </section>

        {/* IMAGE */}
        <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)] sm:rounded-2xl lg:shadow-[0_4px_24px_rgba(0,0,0,0.035)]">
          <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 lg:px-6">
            <h2 className="text-xs font-black text-gray-900 sm:text-sm">
              Marketing Image
            </h2>

            <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-[11px]">
              Upload directly to Supabase. Maximum size: less than 1 MB.
            </p>
          </div>

          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            {form.image_url ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:rounded-2xl">
                <div className="relative aspect-[16/7] overflow-hidden bg-gray-100">
                  <img
                    src={form.image_url}
                    alt="Notification"
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={sending}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-500 shadow-lg transition hover:bg-white disabled:opacity-50 sm:right-3 sm:top-3 sm:h-9 sm:w-9 sm:rounded-xl"
                  >
                    <Trash2 size={14} className="sm:h-4 sm:w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 sm:gap-3 sm:p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 sm:h-8 sm:w-8">
                      <FileImage size={14} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-700 sm:text-xs">
                        Image uploaded
                      </p>

                      <p className="truncate text-[9px] text-gray-400 sm:text-[10px]">
                        Ready to send
                      </p>
                    </div>
                  </div>

                  <label className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-gray-600 transition hover:bg-gray-50 sm:px-3 sm:py-2 sm:text-[10px]">
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      disabled={uploadingImage || sending}
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
                  min-h-[160px]
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  border-dashed
                  px-4
                  text-center
                  transition
                  sm:min-h-[190px]
                  sm:rounded-2xl
                  md:min-h-[220px]
                  ${
                    uploadingImage
                      ? "cursor-wait border-green-300 bg-green-50"
                      : "border-gray-200 bg-gray-50/70 hover:border-green-400 hover:bg-green-50/40"
                  }
                `}
              >
                {uploadingImage ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 sm:h-14 sm:w-14 sm:rounded-2xl">
                      <Loader2 size={22} className="animate-spin sm:h-[26px] sm:w-[26px]" />
                    </div>

                    <p className="mt-3 text-xs font-bold text-gray-800 sm:mt-4 sm:text-sm">
                      Uploading...
                    </p>

                    <p className="mt-1 text-[9px] text-gray-400 sm:text-[10px]">
                      Please wait
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm transition group-hover:bg-green-50 group-hover:text-green-600 sm:h-14 sm:w-14 sm:rounded-2xl">
                      <ImagePlus size={22} className="sm:h-[26px] sm:w-[26px]" />
                    </div>

                    <p className="mt-3 text-xs font-bold text-gray-800 sm:mt-4 sm:text-sm">
                      Upload marketing image
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400 sm:text-[11px]">
                      JPG, PNG or WEBP
                    </p>

                    <span className="mt-3 rounded-lg bg-green-50 px-2.5 py-1.5 text-[8px] font-bold text-green-700 sm:mt-4 sm:px-3 sm:text-[9px]">
                      LESS THAN 1 MB
                    </span>

                    <div className="mt-3 flex items-center gap-1.5 text-[9px] text-gray-400 sm:mt-4 sm:text-[10px]">
                      <UploadCloud size={12} />
                      Direct Supabase upload
                    </div>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={uploadingImage || sending}
                  className="hidden"
                />
              </label>
            )}

            {uploadError && (
              <div className="mt-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 sm:mt-3 sm:rounded-xl sm:py-2.5 sm:text-[11px]">
                {uploadError}
              </div>
            )}
          </div>
        </section>

        {/* RECIPIENT */}
        <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)] sm:rounded-2xl lg:shadow-[0_4px_24px_rgba(0,0,0,0.035)]">
          <div className="border-b border-gray-100 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 lg:px-6">
            <h2 className="text-xs font-black text-gray-900 sm:text-sm">
              Recipients
            </h2>

            <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-[11px]">
              Choose who receives this notification.
            </p>
          </div>

          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
              <TargetButton
                active={form.target === "global"}
                icon={<Globe2 size={18} />}
                title="All Users"
                description="Send to everyone"
                onClick={() => {
                  onChange("target", "global");
                  onChange("user_id", "");
                }}
              />

              <TargetButton
                active={form.target === "user"}
                icon={<UserRound size={18} />}
                title="Specific User"
                description="Send to one user"
                onClick={() => onChange("target", "user")}
              />
            </div>

            {form.target === "global" && (
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-green-100 bg-green-50 p-3 sm:mt-4 sm:gap-3 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-600 sm:h-10 sm:w-10 sm:rounded-xl">
                  <Globe2 size={16} className="sm:h-[18px] sm:w-[18px]" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black text-green-800 sm:text-xs">
                    All Users Selected
                  </p>

                  <p className="mt-0.5 text-[9px] text-green-600 sm:text-[10px]">
                    This notification will be sent to everyone.
                  </p>
                </div>
              </div>
            )}

            {form.target === "user" && (
              <div className="mt-4 sm:mt-5">
                <label className="mb-1.5 block text-[10px] font-bold text-gray-700 sm:text-xs">
                  Select User
                </label>

                <button
                  type="button"
                  onClick={onToggleUsers}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 text-left transition hover:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 sm:min-h-12 sm:px-3.5 md:min-h-14 md:px-4"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 sm:h-8 sm:w-8">
                      <UserRound size={14} />
                    </span>

                    <span className="min-w-0">
                      {selectedUser ? (
                        <>
                          <span className="block truncate text-xs font-bold text-gray-700 sm:text-sm">
                            {selectedUser.name || "User"}
                          </span>

                          {selectedUser.email && (
                            <span className="block truncate text-[9px] text-gray-400 sm:text-[10px]">
                              {selectedUser.email}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block truncate text-xs font-bold text-gray-500 sm:text-sm">
                          Select user
                        </span>
                      )}
                    </span>
                  </span>

                  <ChevronDown
                    size={15}
                    className={`
                      shrink-0
                      text-gray-400
                      transition
                      sm:h-4 sm:w-4
                      ${showUsers ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {showUsers && (
                  <div className="mt-2 max-h-[360px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl sm:max-h-[420px]">
                    {users.length === 0 ? (
                      <div className="p-6 text-center sm:p-8">
                        <UserRound
                          size={24}
                          className="mx-auto text-gray-300 sm:h-7 sm:w-7"
                        />

                        <p className="mt-2 text-[10px] font-bold text-gray-500 sm:text-xs">
                          No users found
                        </p>
                      </div>
                    ) : (
                      users.map((user) => {
                        const active = form.user_id === user.id;

                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => onSelectUser(user.id)}
                            className={`
                              flex
                              w-full
                              items-center
                              gap-2.5
                              border-b
                              border-gray-100
                              px-3
                              py-2.5
                              text-left
                              last:border-0
                              sm:gap-3
                              sm:px-4
                              sm:py-3
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
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                sm:h-9
                                sm:w-9
                                ${
                                  active
                                    ? "bg-white text-green-600"
                                    : "bg-gray-100 text-gray-500"
                                }
                              `}
                            >
                              <UserRound size={14} className="sm:h-4 sm:w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-bold text-gray-800 sm:text-xs">
                                {user.name || "User"}
                              </p>

                              {user.email ? (
                                <p className="mt-0.5 truncate text-[9px] text-gray-400 sm:text-[10px]">
                                  {user.email}
                                </p>
                              ) : (
                                <p className="mt-0.5 text-[9px] text-gray-400 sm:text-[10px]">
                                  Email not available
                                </p>
                              )}
                            </div>

                            {active && (
                              <Check
                                size={15}
                                className="shrink-0 text-green-600 sm:h-[17px] sm:w-[17px]"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* PREVIEW — MOBILE + TABLET + DESKTOP */}
      <aside className="w-full lg:sticky lg:top-[96px] lg:self-start">
        <section className="relative overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-lime-50 shadow-[0_2px_12px_rgba(14,165,233,0.05)] sm:rounded-2xl lg:shadow-[0_4px_24px_rgba(0,0,0,0.035)]">

          {/* TOP RIGHT FOLD */}
          <div className="pointer-events-none absolute right-0 top-0 h-14 w-14 overflow-hidden lg:h-20 lg:w-20">
            <div className="absolute -right-6 -top-6 h-[72px] w-[72px] rotate-45 bg-sky-200/50 lg:-right-8 lg:-top-8 lg:h-24 lg:w-24" />
            <div className="absolute right-0 top-0 h-8 w-8 rounded-bl-xl bg-sky-700/15 lg:h-11 lg:w-11 lg:rounded-bl-[24px]" />
          </div>

          {/* BOTTOM LEFT FOLD */}
          <div className="pointer-events-none absolute bottom-0 left-0 h-14 w-14 overflow-hidden lg:h-20 lg:w-20">
            <div className="absolute -bottom-6 -left-6 h-[72px] w-[72px] rotate-45 bg-lime-200/45 lg:-bottom-8 lg:-left-8 lg:h-24 lg:w-24" />
            <div className="absolute bottom-0 left-0 h-8 w-8 rounded-tr-xl bg-lime-800/15 lg:h-11 lg:w-11 lg:rounded-tr-[24px]" />
          </div>

          {/* SOFT TINT */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/25 blur-2xl lg:-right-12 lg:-top-12 lg:h-40 lg:w-40 lg:blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-lime-200/25 blur-2xl lg:-bottom-16 lg:-left-10 lg:h-40 lg:w-40 lg:blur-3xl" />

          {/* HEADER */}
          <div className="relative z-10 border-b border-sky-100/80 bg-white/65 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3 lg:px-5 lg:py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black text-gray-900 sm:text-sm">
                  Live Preview
                </h2>

                <p className="mt-0.5 text-[9px] text-gray-400 sm:mt-1 sm:text-[11px]">
                  Preview before publishing.
                </p>
              </div>

              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-700 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                LIVE
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative z-10 p-3 sm:p-4 lg:p-5">

            {/* NOTIFICATION PREVIEW */}
            <div className="overflow-hidden rounded-xl border border-sky-100 bg-white/90 shadow-sm backdrop-blur-sm lg:rounded-2xl">
              {form.image_url && (
                <div className="aspect-[16/7] overflow-hidden bg-sky-50 lg:aspect-[16/8]">
                  <img
                    src={form.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-3 sm:p-3.5 lg:p-4">
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sky-100 bg-sky-50 text-lg text-sky-600 sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl lg:h-11 lg:w-11">
                    <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 overflow-hidden lg:h-4 lg:w-4">
                      <span className="absolute -right-1 -top-1 h-[18px] w-[18px] rotate-45 bg-sky-200/70 lg:h-5 lg:w-5" />
                      <span className="absolute right-0 top-0 h-2 w-2 rounded-bl-md bg-sky-700/15 lg:h-2.5 lg:w-2.5" />
                    </span>

                    <span className="relative z-10">
                      {form.icon || "📢"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-gray-900 sm:text-sm">
                      {form.title || "Notification title"}
                    </p>

                    <p className="mt-1 line-clamp-4 text-[10px] leading-4 text-gray-500 sm:mt-1.5 sm:line-clamp-5 sm:text-xs sm:leading-5 lg:line-clamp-6">
                      {form.message ||
                        "Your notification message will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* META */}
            <div className="mt-3 space-y-1.5 sm:mt-3.5 sm:space-y-2 lg:mt-4">
              <PreviewMeta
                label="Category"
                value={form.type || "system"}
              />

              <PreviewMeta
                label="Recipient"
                value={
                  form.target === "global"
                    ? "All Users"
                    : selectedUser?.name ||
                      selectedUser?.email ||
                      "No user selected"
                }
              />

              <PreviewMeta
                label="Version"
                value={appVersion || "1.0.0"}
              />

              <PreviewMeta
                label="Open Page"
                value={form.action_url || "None"}
              />
            </div>

            {/* UPDATE CAMPAIGN */}
            {form.action_url === "/update" && (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-lime-200 bg-gradient-to-br from-lime-50 to-emerald-50 p-2.5 sm:mt-4 sm:rounded-xl sm:p-3">
                <div className="pointer-events-none absolute right-0 top-0 h-7 w-7 overflow-hidden sm:h-8 sm:w-8">
                  <div className="absolute -right-2 -top-2 h-9 w-9 rotate-45 bg-lime-200/60 sm:h-10 sm:w-10" />
                  <div className="absolute right-0 top-0 h-3.5 w-3.5 rounded-bl-md bg-lime-800/15 sm:h-4 sm:w-4 sm:rounded-bl-lg" />
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-lime-100 bg-white text-lime-600 sm:h-8 sm:w-8 sm:rounded-lg">
                    <Smartphone size={13} className="sm:h-3.5 sm:w-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-lime-800 sm:text-[10px]">
                      App Update Campaign
                    </p>

                    <p className="mt-0.5 text-[9px] leading-3.5 text-lime-700 sm:text-[10px] sm:leading-4">
                      Tapping the notification can open the update page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* READY */}
            <div className="relative mt-3 overflow-hidden rounded-lg border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-2.5 sm:mt-4 sm:rounded-xl sm:p-3">
              <div className="pointer-events-none absolute right-0 top-0 h-7 w-7 overflow-hidden sm:h-8 sm:w-8">
                <div className="absolute -right-2 -top-2 h-9 w-9 rotate-45 bg-sky-200/50 sm:h-10 sm:w-10" />
                <div className="absolute right-0 top-0 h-3.5 w-3.5 rounded-bl-md bg-sky-700/15 sm:h-4 sm:w-4 sm:rounded-bl-lg" />
              </div>

              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-sky-100 bg-white text-sky-600 sm:h-8 sm:w-8 sm:rounded-lg">
                  <Send size={13} className="sm:h-3.5 sm:w-3.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-700 sm:text-[10px]">
                    Ready to publish
                  </p>

                  <p className="mt-0.5 text-[9px] leading-3.5 text-gray-400 sm:text-[10px] sm:leading-4">
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

      {/* MOBILE + TABLET ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-gray-200 bg-white/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={onClose}
          disabled={sending || uploadingImage}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 shadow-sm disabled:opacity-50 md:py-4 md:text-base"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => void onSend()}
          disabled={sending || uploadingImage}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm disabled:opacity-60 md:py-4 md:text-base"
        >
          {sending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={17} />
              <span className="sm:hidden">Send</span>
              <span className="hidden sm:inline">Send Notification</span>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
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

function Counter({ value, max }: { value: number; max: number }) {
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
        min-h-[76px] md:min-h-[82px]
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
          ${active ? "bg-white text-green-600" : "bg-gray-50 text-gray-400"}
        `}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p
          className={`
            text-xs
            font-black
            ${active ? "text-green-700" : "text-gray-800"}
          `}
        >
          {title}
        </p>

        <p className="mt-1 text-[10px] text-gray-400">{description}</p>
      </div>

      {active && (
        <Check size={17} className="ml-auto shrink-0 text-green-600" />
      )}
    </button>
  );
}

/* =====================================================
   PREVIEW META
===================================================== */

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
      <span className="text-[10px] font-semibold text-gray-400">{label}</span>

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
