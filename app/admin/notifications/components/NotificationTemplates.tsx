"use client";

import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Gift,
  Megaphone,
  Settings,
  Smartphone,
  Sparkles,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useState } from "react";
import type { NotificationForm } from "./NotificationCreateDrawer";

/* =====================================================
   TEMPLATE TYPES
===================================================== */

export type NotificationTemplate = {
  id: string;
  title: string;
  description: string;

  category:
    | "version"
    | "announcement"
    | "offer"
    | "important"
    | "technical"
    | "maintenance"
    | "booking"
    | "worker"
    | "payment"
    | "general";

  icon: string;
  message: string;

  type:
    | "system"
    | "offer"
    | "booking"
    | "work"
    | "payment"
    | "message";

  action_url: string;
};

type Props = {
  onApply: (template: NotificationTemplate) => void;
  currentVersion?: string;
  onSend?: (template: NotificationTemplate) => void;
};

/* =====================================================
   CATEGORY CONFIG
===================================================== */

type CategoryConfig = {
  id: NotificationTemplate["category"];
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

const categories: CategoryConfig[] = [
  {
    id: "version",
    label: "App Version",
    description: "New app versions and updates",
    icon: Smartphone,
    color: "green",
  },
  {
    id: "announcement",
    label: "Announcements",
    description: "General announcements",
    icon: Megaphone,
    color: "blue",
  },
  {
    id: "offer",
    label: "Offers",
    description: "Offers and promotions",
    icon: Gift,
    color: "pink",
  },
  {
    id: "important",
    label: "Important",
    description: "Important user notices",
    icon: Bell,
    color: "purple",
  },
  {
    id: "technical",
    label: "App Errors",
    description: "Technical issues and errors",
    icon: AlertTriangle,
    color: "red",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Maintenance and downtime",
    icon: Wrench,
    color: "orange",
  },
  {
    id: "booking",
    label: "Booking",
    description: "Booking related messages",
    icon: CalendarCheck,
    color: "cyan",
  },
  {
    id: "worker",
    label: "Worker",
    description: "Worker related messages",
    icon: Settings,
    color: "amber",
  },
  {
    id: "payment",
    label: "Payment",
    description: "Payment related messages",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    id: "general",
    label: "General",
    description: "Engagement and general messages",
    icon: Sparkles,
    color: "gray",
  },
];

/* =====================================================
   TEMPLATES
===================================================== */

const templates: NotificationTemplate[] = [
  /* ===================================================
     APP VERSION — 10
  =================================================== */

  {
    id: "version-1",
    category: "version",
    title: "New App Version",
    description: "New version is now available",
    icon: "🚀",
    message:
      "A new version of the Workkerz app is now available. Update your app to enjoy the latest features, improvements and bug fixes.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-2",
    category: "version",
    title: "Important App Update",
    description: "Recommended app update",
    icon: "📲",
    message:
      "An important Workkerz app update is available. Please update to the latest version for the best experience.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-3",
    category: "version",
    title: "Performance Update",
    description: "Faster and smoother app",
    icon: "⚡",
    message:
      "Workkerz has been improved with better performance, faster loading and a smoother experience. Update the app now.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-4",
    category: "version",
    title: "New Features Available",
    description: "New features added",
    icon: "✨",
    message:
      "New features are now available in Workkerz. Update the app to explore everything new.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-5",
    category: "version",
    title: "Security Update",
    description: "Important security improvements",
    icon: "🔐",
    message:
      "Workkerz has received important security and stability improvements. Please update to the latest version.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-6",
    category: "version",
    title: "Bug Fix Update",
    description: "Bug fixes included",
    icon: "🛠️",
    message:
      "We have fixed several issues and improved the Workkerz experience. Update the app to get the latest fixes.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-7",
    category: "version",
    title: "Latest Workkerz Version",
    description: "Latest release notification",
    icon: "📦",
    message:
      "The latest version of Workkerz is now live. Update your app and enjoy the newest improvements.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-8",
    category: "version",
    title: "Workkerz Upgrade",
    description: "Upgrade your application",
    icon: "⬆️",
    message:
      "Your Workkerz app can now be upgraded to the latest version. Update now for improved performance and features.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-9",
    category: "version",
    title: "Better Workkerz Experience",
    description: "Experience improvements",
    icon: "🌟",
    message:
      "We have made Workkerz better, faster and more reliable. Update your app to experience the improvements.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },
  {
    id: "version-10",
    category: "version",
    title: "Update Recommended",
    description: "Recommended latest version",
    icon: "🔔",
    message:
      "A newer version of Workkerz is available. We recommend updating your app to continue enjoying the best experience.",
    type: "system",
    action_url:
      "https://play.google.com/store/apps/details?id=com.workkerz.app",
  },

  /* ===================================================
     ANNOUNCEMENT — 10
  =================================================== */

  {
    id: "announcement-1",
    category: "announcement",
    title: "Important Workkerz Announcement",
    description: "General announcement",
    icon: "📢",
    message:
      "We have an important update for the Workkerz community. Please open the app to learn more.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-2",
    category: "announcement",
    title: "Something New Is Coming",
    description: "Upcoming feature announcement",
    icon: "🚀",
    message:
      "Something exciting is coming to Workkerz. Stay connected and watch for the upcoming update.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-3",
    category: "announcement",
    title: "Workkerz Community Update",
    description: "Community announcement",
    icon: "👥",
    message:
      "We have some important news for the Workkerz community. Open the app to see what's new.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-4",
    category: "announcement",
    title: "New Experience on Workkerz",
    description: "Experience announcement",
    icon: "✨",
    message:
      "We are continuously improving Workkerz to make your experience better. Check out the latest changes.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-5",
    category: "announcement",
    title: "Workkerz News",
    description: "News notification",
    icon: "📰",
    message:
      "There is a new update from Workkerz. Open the app to stay informed.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-6",
    category: "announcement",
    title: "New Services Available",
    description: "Service announcement",
    icon: "🛠️",
    message:
      "New services are now available on Workkerz. Open the app and explore what's available near you.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-7",
    category: "announcement",
    title: "Workkerz Update for You",
    description: "User announcement",
    icon: "💚",
    message:
      "We have made some improvements to Workkerz for you. Open the app to explore the latest updates.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-8",
    category: "announcement",
    title: "New Things to Explore",
    description: "Discovery announcement",
    icon: "🔎",
    message:
      "There are new things to explore on Workkerz. Open the app and discover what's new.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-9",
    category: "announcement",
    title: "Workkerz Community Notice",
    description: "Community notice",
    icon: "📣",
    message:
      "This is an important notice from Workkerz. Please check the app for more information.",
    type: "system",
    action_url: "/",
  },
  {
    id: "announcement-10",
    category: "announcement",
    title: "Stay Updated with Workkerz",
    description: "Stay informed",
    icon: "🔔",
    message:
      "Stay connected with Workkerz for the latest services, features, offers and important announcements.",
    type: "system",
    action_url: "/",
  },

  /* ===================================================
     OFFERS — 10
  =================================================== */

  {
    id: "offer-1",
    category: "offer",
    title: "Special Offer for You",
    description: "General promotional offer",
    icon: "🎁",
    message:
      "Enjoy a special offer from Workkerz. Open the app to check the latest deals available for you.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-2",
    category: "offer",
    title: "Limited Time Offer",
    description: "Limited time promotion",
    icon: "⏰",
    message:
      "Don't miss this limited-time Workkerz offer. Check the app now and take advantage of the deal.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-3",
    category: "offer",
    title: "Exclusive Workkerz Deal",
    description: "Exclusive promotion",
    icon: "🔥",
    message:
      "An exclusive deal is waiting for you on Workkerz. Open the app to see the offer.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-4",
    category: "offer",
    title: "Save More with Workkerz",
    description: "Savings promotion",
    icon: "💰",
    message:
      "Save more on your next service with Workkerz. Check the latest offer available today.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-5",
    category: "offer",
    title: "New Offer Available",
    description: "New promotion",
    icon: "🏷️",
    message:
      "A new Workkerz offer is now available. Open the app to explore the details.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-6",
    category: "offer",
    title: "Today's Special Deal",
    description: "Daily promotion",
    icon: "⭐",
    message:
      "Check today's special Workkerz deal and get more value from your next booking.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-7",
    category: "offer",
    title: "Don't Miss This Offer",
    description: "Urgency promotion",
    icon: "🚨",
    message:
      "This Workkerz offer won't be around forever. Open the app and check it out today.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-8",
    category: "offer",
    title: "Workkerz Savings Alert",
    description: "Savings notification",
    icon: "💸",
    message:
      "You can save more on your next Workkerz service. Check the latest offer now.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-9",
    category: "offer",
    title: "Special Deal Just for You",
    description: "Personal promotion",
    icon: "🎉",
    message:
      "We have a special Workkerz deal for you. Open the app to see what's available.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "offer-10",
    category: "offer",
    title: "Weekend Workkerz Offer",
    description: "Weekend promotion",
    icon: "🎊",
    message:
      "Make your weekend easier with Workkerz. Check the latest weekend offer in the app.",
    type: "offer",
    action_url: "/",
  },

  /* ===================================================
     IMPORTANT — 10
  =================================================== */

  {
    id: "important-1",
    category: "important",
    title: "Important Notice",
    description: "Important user notice",
    icon: "⚠️",
    message:
      "Please read this important Workkerz notice carefully. Open the app for complete information.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-2",
    category: "important",
    title: "Action Required",
    description: "User action required",
    icon: "🔔",
    message:
      "Your attention is required. Please open the Workkerz app and complete the required action.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-3",
    category: "important",
    title: "Important Account Update",
    description: "Account information",
    icon: "👤",
    message:
      "There is an important update related to your Workkerz account. Please check the app.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-4",
    category: "important",
    title: "Please Check Your Account",
    description: "Account notice",
    icon: "🔐",
    message:
      "Please review your Workkerz account information and make sure everything is up to date.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-5",
    category: "important",
    title: "Important Service Notice",
    description: "Service notice",
    icon: "📢",
    message:
      "Please note this important service update from Workkerz.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-6",
    category: "important",
    title: "Important Information",
    description: "Important information",
    icon: "ℹ️",
    message:
      "We have important information that may affect your Workkerz experience. Please check the app.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-7",
    category: "important",
    title: "Policy Update",
    description: "Policy announcement",
    icon: "📋",
    message:
      "Workkerz has updated some policies and guidelines. Please review the latest information in the app.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-8",
    category: "important",
    title: "User Notice",
    description: "User communication",
    icon: "👋",
    message: "Please review this important notice from Workkerz.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-9",
    category: "important",
    title: "Service Availability Notice",
    description: "Availability notice",
    icon: "📍",
    message:
      "Some Workkerz services may have updated availability. Please check the app for current information.",
    type: "system",
    action_url: "/",
  },
  {
    id: "important-10",
    category: "important",
    title: "Important Workkerz Alert",
    description: "Important alert",
    icon: "🚨",
    message: "Please review this important alert from Workkerz.",
    type: "system",
    action_url: "/",
  },

  /* ===================================================
     TECHNICAL — 10
  =================================================== */

  {
    id: "technical-1",
    category: "technical",
    title: "Temporary App Issue",
    description: "General app error",
    icon: "⚠️",
    message:
      "We are currently experiencing a temporary issue with the Workkerz app. Our team is working to fix it.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-2",
    category: "technical",
    title: "Something Went Wrong",
    description: "Unexpected app error",
    icon: "❌",
    message:
      "Something went wrong while processing your request. Please try again after a few moments.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-3",
    category: "technical",
    title: "Service Temporarily Unavailable",
    description: "Service error",
    icon: "🔧",
    message:
      "Some Workkerz services are temporarily unavailable. We are working to restore normal service.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-4",
    category: "technical",
    title: "Login Issue",
    description: "Login problem",
    icon: "🔐",
    message:
      "Some users may currently experience login issues. Our technical team is working on the problem.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-5",
    category: "technical",
    title: "Booking System Issue",
    description: "Booking technical issue",
    icon: "📋",
    message:
      "We are currently fixing an issue affecting bookings. Please try again shortly.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "technical-6",
    category: "technical",
    title: "Payment System Issue",
    description: "Payment technical issue",
    icon: "💳",
    message:
      "We are currently experiencing a temporary payment issue. Please try again later.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "technical-7",
    category: "technical",
    title: "App Loading Issue",
    description: "Loading problem",
    icon: "⏳",
    message:
      "Some users may experience slower loading times. Our team is working to resolve the issue.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-8",
    category: "technical",
    title: "Notification Issue",
    description: "Notification problem",
    icon: "🔔",
    message:
      "Some notifications may be delayed. We are working on restoring normal notification delivery.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-9",
    category: "technical",
    title: "Technical Issue Resolved",
    description: "Issue resolution",
    icon: "✅",
    message:
      "The technical issue affecting Workkerz has been resolved. Thank you for your patience.",
    type: "system",
    action_url: "/",
  },
  {
    id: "technical-10",
    category: "technical",
    title: "System Recovery Update",
    description: "Recovery notification",
    icon: "🛠️",
    message:
      "Workkerz systems are recovering from a temporary technical issue. Services should return to normal shortly.",
    type: "system",
    action_url: "/",
  },

  /* ===================================================
     MAINTENANCE — 10
  =================================================== */

  {
    id: "maintenance-1",
    category: "maintenance",
    title: "Scheduled Maintenance",
    description: "Planned maintenance",
    icon: "🔧",
    message:
      "Workkerz will undergo scheduled maintenance. Some services may be temporarily unavailable.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-2",
    category: "maintenance",
    title: "System Maintenance Tonight",
    description: "Night maintenance",
    icon: "🌙",
    message:
      "Scheduled system maintenance is planned for tonight. Some features may be temporarily unavailable.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-3",
    category: "maintenance",
    title: "Maintenance Complete",
    description: "Maintenance finished",
    icon: "✅",
    message:
      "Scheduled maintenance has been completed. Workkerz services are now available normally.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-4",
    category: "maintenance",
    title: "System Upgrade",
    description: "Infrastructure upgrade",
    icon: "⬆️",
    message:
      "Workkerz systems are being upgraded to improve reliability and performance.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-5",
    category: "maintenance",
    title: "Temporary Downtime",
    description: "Temporary service downtime",
    icon: "⏱️",
    message:
      "Workkerz services may be temporarily unavailable while we perform important system maintenance.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-6",
    category: "maintenance",
    title: "Service Maintenance Notice",
    description: "Service maintenance",
    icon: "🛠️",
    message:
      "Some Workkerz services are undergoing maintenance. Please try again later if you experience any issues.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-7",
    category: "maintenance",
    title: "Backend Maintenance",
    description: "Backend maintenance",
    icon: "⚙️",
    message:
      "Workkerz backend systems are undergoing maintenance to improve reliability and performance.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-8",
    category: "maintenance",
    title: "Database Maintenance",
    description: "Database maintenance",
    icon: "🗄️",
    message:
      "Scheduled database maintenance is in progress. Some features may respond slower than usual.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-9",
    category: "maintenance",
    title: "Maintenance Delayed",
    description: "Maintenance delay notice",
    icon: "⏳",
    message:
      "Scheduled maintenance is taking longer than expected. We appreciate your patience.",
    type: "system",
    action_url: "/",
  },
  {
    id: "maintenance-10",
    category: "maintenance",
    title: "All Systems Operational",
    description: "System restored",
    icon: "🟢",
    message:
      "Workkerz systems are operating normally. Thank you for your patience.",
    type: "system",
    action_url: "/",
  },

  /* ===================================================
     BOOKING — 10
  =================================================== */

  {
    id: "booking-1",
    category: "booking",
    title: "Booking Confirmed",
    description: "Booking confirmation",
    icon: "✅",
    message: "Your Workkerz booking has been confirmed successfully.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-2",
    category: "booking",
    title: "New Booking Request",
    description: "New booking request",
    icon: "📋",
    message:
      "You have received a new booking request on Workkerz. Open the app to view the details.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-3",
    category: "booking",
    title: "Booking Accepted",
    description: "Booking accepted",
    icon: "👍",
    message: "Your Workkerz booking has been accepted.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-4",
    category: "booking",
    title: "Booking Cancelled",
    description: "Booking cancellation",
    icon: "❌",
    message:
      "Your Workkerz booking has been cancelled. Please open the app for more details.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-5",
    category: "booking",
    title: "Booking Reminder",
    description: "Upcoming booking",
    icon: "⏰",
    message: "This is a reminder about your upcoming Workkerz booking.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-6",
    category: "booking",
    title: "Booking Completed",
    description: "Completed booking",
    icon: "🎉",
    message:
      "Your Workkerz booking has been completed successfully.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-7",
    category: "booking",
    title: "Booking Updated",
    description: "Booking update",
    icon: "🔄",
    message:
      "Your Workkerz booking details have been updated. Please check the latest information.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-8",
    category: "booking",
    title: "Worker Assigned",
    description: "Worker assignment",
    icon: "👷",
    message:
      "A worker has been assigned to your Workkerz booking.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-9",
    category: "booking",
    title: "Booking Rescheduled",
    description: "Booking rescheduled",
    icon: "📅",
    message:
      "Your Workkerz booking has been rescheduled. Please check the updated schedule.",
    type: "booking",
    action_url: "/bookings",
  },
  {
    id: "booking-10",
    category: "booking",
    title: "Booking Action Required",
    description: "Booking action",
    icon: "🔔",
    message:
      "Your Workkerz booking requires your attention. Open the app to continue.",
    type: "booking",
    action_url: "/bookings",
  },

  /* ===================================================
     WORKER — 10
  =================================================== */

  {
    id: "worker-1",
    category: "worker",
    title: "New Work Opportunity",
    description: "Work opportunity",
    icon: "👷",
    message:
      "A new work opportunity may be available for you on Workkerz.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-2",
    category: "worker",
    title: "New Worker Booking",
    description: "Worker booking",
    icon: "📋",
    message:
      "You have a new work booking request. Open Workkerz to view the details.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-3",
    category: "worker",
    title: "Profile Update Required",
    description: "Worker profile",
    icon: "👤",
    message:
      "Please review and update your Workkerz worker profile to keep your information current.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-4",
    category: "worker",
    title: "New Customer Request",
    description: "Customer work request",
    icon: "🙋",
    message:
      "A customer may be looking for your services. Open Workkerz to check available work.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-5",
    category: "worker",
    title: "Workkerz Worker Update",
    description: "Worker announcement",
    icon: "📢",
    message:
      "There is an important update for Workkerz workers. Please check the app.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-6",
    category: "worker",
    title: "Availability Reminder",
    description: "Availability reminder",
    icon: "🟢",
    message:
      "Keep your availability updated on Workkerz so customers can find you when you are ready to work.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-7",
    category: "worker",
    title: "Complete Your Profile",
    description: "Profile completion",
    icon: "✨",
    message:
      "Complete your Workkerz profile to improve your visibility and help customers understand your services.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-8",
    category: "worker",
    title: "New Service Opportunity",
    description: "Service opportunity",
    icon: "🛠️",
    message:
      "A new service opportunity may be available on Workkerz. Check the app for details.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-9",
    category: "worker",
    title: "Worker Account Update",
    description: "Worker account notice",
    icon: "🔔",
    message:
      "There is an update related to your Workkerz worker account. Please check the app.",
    type: "work",
    action_url: "/",
  },
  {
    id: "worker-10",
    category: "worker",
    title: "Keep Working with Workkerz",
    description: "Worker engagement",
    icon: "💪",
    message:
      "Keep your profile active and stay available for new work opportunities on Workkerz.",
    type: "work",
    action_url: "/",
  },

  /* ===================================================
     PAYMENT — 10
  =================================================== */

  {
    id: "payment-1",
    category: "payment",
    title: "Payment Successful",
    description: "Successful payment",
    icon: "✅",
    message: "Your Workkerz payment has been completed successfully.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-2",
    category: "payment",
    title: "Payment Pending",
    description: "Pending payment",
    icon: "⏳",
    message:
      "Your Workkerz payment is currently pending. Please check the app for the latest status.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-3",
    category: "payment",
    title: "Payment Failed",
    description: "Failed payment",
    icon: "❌",
    message:
      "Your payment could not be completed. Please try again or choose another payment method.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-4",
    category: "payment",
    title: "Payment Required",
    description: "Payment reminder",
    icon: "💳",
    message:
      "A payment is required to continue your Workkerz booking.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-5",
    category: "payment",
    title: "Refund Initiated",
    description: "Refund notification",
    icon: "↩️",
    message:
      "Your Workkerz refund has been initiated. Please check the app for details.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-6",
    category: "payment",
    title: "Refund Completed",
    description: "Refund completed",
    icon: "💰",
    message:
      "Your Workkerz refund has been processed successfully.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-7",
    category: "payment",
    title: "Payment Update",
    description: "Payment status update",
    icon: "🔄",
    message:
      "There has been an update to your Workkerz payment status.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-8",
    category: "payment",
    title: "Payment Reminder",
    description: "Payment reminder",
    icon: "🔔",
    message:
      "This is a reminder about your pending Workkerz payment.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-9",
    category: "payment",
    title: "Transaction Successful",
    description: "Transaction confirmation",
    icon: "🎉",
    message:
      "Your Workkerz transaction was completed successfully.",
    type: "payment",
    action_url: "/",
  },
  {
    id: "payment-10",
    category: "payment",
    title: "Payment Verification",
    description: "Payment verification",
    icon: "🔐",
    message:
      "Your Workkerz payment is being verified. Please check the app for the latest status.",
    type: "payment",
    action_url: "/",
  },

  /* ===================================================
     GENERAL — 10
  =================================================== */

  {
    id: "general-1",
    category: "general",
    title: "Welcome to Workkerz",
    description: "Welcome message",
    icon: "👋",
    message:
      "Welcome to Workkerz. Find workers, services and solutions in one place.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-2",
    category: "general",
    title: "Thank You for Using Workkerz",
    description: "Thank you message",
    icon: "💚",
    message:
      "Thank you for being part of Workkerz. We are continuously working to improve your experience.",
    type: "message",
    action_url: "/",
  },
  {
    id: "general-3",
    category: "general",
    title: "Explore Workkerz",
    description: "Explore services",
    icon: "🔎",
    message:
      "Explore workers, services and materials available on Workkerz today.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-4",
    category: "general",
    title: "Need Help?",
    description: "Help message",
    icon: "❓",
    message:
      "Need help with Workkerz? Open the app to find support and useful information.",
    type: "message",
    action_url: "/",
  },
  {
    id: "general-5",
    category: "general",
    title: "Stay Connected",
    description: "Engagement message",
    icon: "📱",
    message:
      "Stay connected with Workkerz for new workers, services, offers and updates.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-6",
    category: "general",
    title: "Discover More",
    description: "Discovery message",
    icon: "✨",
    message:
      "There is more to discover on Workkerz. Open the app and explore today.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-7",
    category: "general",
    title: "Your Workkerz Experience",
    description: "Experience message",
    icon: "🌟",
    message:
      "We want to make your Workkerz experience simple, reliable and useful every day.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-8",
    category: "general",
    title: "Workkerz Is Growing",
    description: "Growth announcement",
    icon: "📈",
    message:
      "Workkerz is growing every day. Thank you for being part of our journey.",
    type: "system",
    action_url: "/",
  },
  {
    id: "general-9",
    category: "general",
    title: "Something Special for You",
    description: "Engagement message",
    icon: "🎁",
    message:
      "We have something special waiting for you on Workkerz. Open the app to discover more.",
    type: "offer",
    action_url: "/",
  },
  {
    id: "general-10",
    category: "general",
    title: "Keep Exploring Workkerz",
    description: "Engagement reminder",
    icon: "🚀",
    message:
      "Keep exploring Workkerz to find workers, services, materials and new opportunities.",
    type: "system",
    action_url: "/",
  },
];

/* =====================================================
   COLORS
===================================================== */

const colorClasses: Record<
  string,
  {
    icon: string;
    active: string;
  }
> = {
  green: {
    icon: "bg-green-50 text-green-600",
    active: "border-green-400 bg-green-50",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    active: "border-blue-400 bg-blue-50",
  },
  pink: {
    icon: "bg-pink-50 text-pink-600",
    active: "border-pink-400 bg-pink-50",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    active: "border-purple-400 bg-purple-50",
  },
  red: {
    icon: "bg-red-50 text-red-600",
    active: "border-red-400 bg-red-50",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    active: "border-orange-400 bg-orange-50",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-600",
    active: "border-cyan-400 bg-cyan-50",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    active: "border-amber-400 bg-amber-50",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    active: "border-emerald-400 bg-emerald-50",
  },
  gray: {
    icon: "bg-gray-50 text-gray-600",
    active: "border-gray-400 bg-gray-50",
  },
};

/* =====================================================
   COMPONENT
===================================================== */

export default function NotificationTemplates({
  onApply,
  currentVersion = "1.0.0",
}: Props) {
  const [category, setCategory] =
    useState<NotificationTemplate["category"]>("version");

  const [search, setSearch] = useState("");

  const selectedCategory = categories.find(
    (item) => item.id === category
  );

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = template.category === category;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      template.title.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.message.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const applyTemplate = (template: NotificationTemplate) => {
    if (template.category === "version") {
      const version = currentVersion || "1.0.0";

      onApply({
        ...template,

        title:
          template.title === "New App Version"
            ? `Workkerz App ${version} is now live`
            : template.title,

        message: template.message.replace(
          "latest version",
          `version ${version}`
        ),
      });

      return;
    }

    onApply(template);
  };

  return (
    <section
      className="
        w-full
        overflow-hidden
        rounded-xl
        border
        border-green-100
        bg-gradient-to-br
        from-green-50
        via-white
        to-white
        shadow-[0_3px_18px_rgba(0,0,0,0.035)]

        sm:rounded-2xl
        lg:shadow-[0_4px_24px_rgba(0,0,0,0.035)]
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          border-b
          border-green-100
          px-3
          py-3

          sm:px-4
          sm:py-4

          md:px-5

          lg:px-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2.5

            sm:gap-3

            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-green-600
                text-white

                sm:h-8
                sm:w-8
              "
            >
              <Sparkles
                size={13}
                className="sm:h-4 sm:w-4"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xs font-black text-gray-900 sm:text-sm">
                Notification Templates
              </h2>

              <p className="truncate text-[9px] text-gray-400 sm:text-[10px]">
                100 ready-to-use notification designs
              </p>
            </div>
          </div>

          <div className="text-[9px] font-bold text-green-600 sm:text-[10px]">
            {templates.length} Templates
          </div>
        </div>

        {/* SEARCH */}

        <div className="mt-2.5 sm:mt-4">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search templates..."
            className="
              h-9
              w-full
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              text-[11px]
              outline-none
              transition

              sm:h-10
              sm:rounded-xl
              sm:text-xs

              focus:border-green-500
              focus:ring-4
              focus:ring-green-50
            "
          />
        </div>
      </div>

      {/* =================================================
          CATEGORY TABS
      ================================================= */}

      <div
        className="
          overflow-x-auto
          border-b
          border-gray-100
          bg-white/70
          scrollbar-none
        "
      >
        <div
          className="
            flex
            min-w-max
            gap-1.5
            p-2

            sm:gap-2
            sm:p-3
          "
        >
          {categories.map((item) => {
            const Icon = item.icon;
            const active = category === item.id;
            const colors = colorClasses[item.color];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`
                  flex
                  min-h-[40px]
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  px-2
                  py-1.5
                  text-left
                  transition
                  active:scale-[0.98]

                  sm:min-h-[44px]
                  sm:gap-2
                  sm:rounded-xl
                  sm:px-3
                  sm:py-2

                  ${
                    active
                      ? colors.active
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    ${colors.icon}

                    sm:h-7
                    sm:w-7
                    sm:rounded-lg
                  `}
                >
                  <Icon
                    size={12}
                    className="sm:h-3.5 sm:w-3.5"
                  />
                </span>

                <span>
                  <span
                    className={`
                      block
                      text-[9px]
                      font-black

                      sm:text-[10px]

                      ${
                        active
                          ? "text-gray-900"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                  <span className="hidden text-[8px] text-gray-400 md:block">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================
          SELECTED CATEGORY
      ================================================= */}

      {selectedCategory && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
            border-b
            border-gray-100
            bg-white/50
            px-3
            py-2.5

            sm:gap-3
            sm:px-4
            sm:py-3

            md:px-5

            lg:px-6
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <selectedCategory.icon
              size={14}
              className="shrink-0 text-gray-500 sm:h-4 sm:w-4"
            />

            <div className="min-w-0">
              <p className="truncate text-[10px] font-black text-gray-800 sm:text-xs">
                {selectedCategory.label}
              </p>

              <p className="hidden truncate text-[9px] text-gray-400 sm:block">
                {selectedCategory.description}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[8px] font-bold text-gray-500 sm:px-2.5 sm:text-[9px]">
            {
              templates.filter(
                (item) => item.category === category
              ).length
            }{" "}
            templates
          </span>
        </div>
      )}

      {/* =================================================
          TEMPLATE GRID
      ================================================= */}

      <div
        className="
          grid
          grid-cols-2
          gap-2
          p-2.5

          sm:gap-3
          sm:p-4

          md:grid-cols-2
          md:gap-4
          md:p-5

          lg:grid-cols-3
          lg:p-6

          xl:grid-cols-4
        "
      >
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onApply={() => applyTemplate(template)}
          />
        ))}

        {filteredTemplates.length === 0 && (
          <div
            className="
              col-span-full
              rounded-xl
              border
              border-dashed
              border-gray-200
              bg-white
              p-6
              text-center

              sm:p-10
            "
          >
            <Sparkles
              size={22}
              className="mx-auto text-gray-300 sm:h-6 sm:w-6"
            />

            <p className="mt-2 text-[11px] font-bold text-gray-500 sm:mt-3 sm:text-xs">
              No templates found
            </p>

            <p className="mt-1 text-[9px] text-gray-400 sm:text-[10px]">
              Try another search.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* =====================================================
   TEMPLATE CARD
===================================================== */

function TemplateCard({
  template,
  onApply,
}: {
  template: NotificationTemplate;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="
        group
        flex
        min-h-[145px]
        w-full
        flex-col
        items-start
        rounded-xl
        border
        border-gray-200
        bg-white
        p-2.5
        text-left
        shadow-sm
        transition

        active:scale-[0.98]

        hover:-translate-y-0.5
        hover:border-green-300
        hover:bg-green-50/30
        hover:shadow-md

        sm:min-h-[160px]
        sm:rounded-2xl
        sm:p-3.5

        md:min-h-[175px]
        md:p-4

        lg:min-h-[185px]
        lg:p-4
      "
    >
      {/* ICON */}

      <div className="flex w-full items-center justify-between">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-green-50
            text-base

            sm:h-9
            sm:w-9
            sm:rounded-xl
            sm:text-lg

            md:h-10
            md:w-10
            md:text-xl
          "
        >
          {template.icon}
        </div>

        <Tag
          size={11}
          className="
            shrink-0
            text-gray-300
            transition
            group-hover:text-green-500

            sm:h-3.5
            sm:w-3.5

            md:h-4
            md:w-4
          "
        />
      </div>

      {/* CONTENT */}

      <div className="mt-2 w-full min-w-0 sm:mt-3">
        <p
          className="
            line-clamp-2
            text-[10px]
            font-black
            leading-4
            text-gray-800

            sm:text-xs
            sm:leading-4

            md:text-sm
          "
        >
          {template.title}
        </p>

        <p
          className="
            mt-0.5
            line-clamp-2
            text-[8px]
            leading-3.5
            text-gray-400

            sm:mt-1
            sm:text-[10px]
            sm:leading-4
          "
        >
          {template.description}
        </p>
      </div>

      {/* MESSAGE PREVIEW */}

      <p
        className="
          mt-2
          line-clamp-2
          text-[8px]
          leading-3.5
          text-gray-500

          sm:mt-3
          sm:text-[9px]
          sm:leading-4

          md:text-[10px]
        "
      >
        {template.message}
      </p>

      {/* ACTION */}

      <div
        className="
          mt-auto
          flex
          w-full
          items-center
          justify-between
          gap-1
          pt-2

          sm:pt-3

          md:pt-4
        "
      >
        <span
          className="
            max-w-[45%]
            truncate
            rounded-full
            bg-gray-50
            px-1.5
            py-0.5
            text-[7px]
            font-bold
            uppercase
            text-gray-400

            sm:px-2
            sm:py-1
            sm:text-[8px]
          "
        >
          {template.type}
        </span>

        <span
          className="
            truncate
            text-[8px]
            font-black
            text-green-600
            transition
            group-hover:translate-x-0.5

            sm:text-[9px]
          "
        >
          Use Template →
        </span>
      </div>
    </button>
  );
}