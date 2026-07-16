// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Star,
//   MapPin,
//   Clock,
//   Shield,
//   CheckCircle,
//   ChevronLeft,
//   Zap,
//   Calendar,
//   MessageCircle,
//   Share2,
//   Heart,
//   Award,
//   Briefcase,
//   ThumbsUp,
// } from "lucide-react";
// import { useAdmin } from "@/app/components/context/AdminContext";
// import { getWorkerById } from "@/app/data/workers";
// import type { Worker } from "@/app/data/workers";

// const categoryColors: Record<
//   string,
//   { color: string; bg: string; label: string }
// > = {
//   construction: {
//     color: "#D97706", // Warm Amber
//     bg: "#FFF8E8",
//     label: "Construction",
//   },

//   plumbing: {
//     color: "#2563EB", // Royal Blue
//     bg: "#F3F8FF",
//     label: "Plumbing",
//   },

//   electrical: {
//     color: "#CA8A04", // Premium Gold
//     bg: "#FFFBEA",
//     label: "Electrical",
//   },

//   driving: {
//     color: "#059669", // Emerald
//     bg: "#F1FCF8",
//     label: "Driving",
//   },
// };

// function StarRating({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <Star
//           key={i}
//           className={`w-4 h-4 ${i <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
//         />
//       ))}
//     </div>
//   );
// }

// export default function WorkerProfilePage() {
//   const { id } = useParams();
//   const router = useRouter();

//   const [saved, setSaved] = useState(false);

//   const [activeTab, setActiveTab] = useState<"about" | "reviews" | "portfolio">(
//     "about",
//   );

//   const [worker, setWorker] = useState<Worker | null>(null);

//   const [loading, setLoading] = useState(true);

//   const { reviews } = useAdmin();

//   useEffect(() => {
//     const loadWorker = async () => {
//       if (!id) return;

//       setLoading(true);

//       const data = await getWorkerById(String(id));

//       setWorker(data);

//       setLoading(false);
//     };

//     loadWorker();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   console.log("CURRENT WORKER =>", worker);

//   if (!worker) {
//     return <div>Worker not found</div>;
//   }

//   const cat = categoryColors[worker.category] || {
//     color: "#FF5C39",
//     bg: "#FFF7ED",
//     label: worker.category,
//   };
//   const workerReviews = reviews.filter((r) => r.workerId === worker.id);

//   // Portfolio items (placeholder)
//   const portfolioItems = [
//     "https://images.unsplash.com/photo-1774600166432-ba8ac640b318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
//     "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
//     "https://images.unsplash.com/photo-1660330590022-9f4ff56b63f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
//   ];

//   return (
//     <div className="min-h-screen bg-[#F8FAFC]">
//       {/* Top bar */}
//       <div className="bg-[#0F172A] pt-16">
//         <div className="max-w-8xl mx-auto px-6 py-5 flex items-center gap-3">
//           <button
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back
//           </button>
//           <span className="text-gray-600">/</span>
//           <span className="text-gray-400 text-sm">Browse</span>
//           <span className="text-gray-600">/</span>
//           <span className="text-white text-sm">{worker.name}</span>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-10">
//             {/* Profile Card */}
//             <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
//               {/* Cover */}
//               <div
//                 className="h-12 sm:h-16 rounded-t-2xl relative overflow-hidden"
//                 style={{
//                   background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}50)`,
//                 }}
//               >
//                 <div
//                   className="absolute inset-0 opacity-30"
//                   style={{
//                     background:
//                       "linear-gradient(to right, rgba(255,255,255,0.18), transparent)",
//                   }}
//                 />
//               </div>

//               <div className="px-4 pb-4 -mt-8">
//                 {/* Header */}
//                 <div className="flex items-end justify-between">
//                   <div className="flex gap-3 items-end flex-1 min-w-0">
//                     <div className="relative shrink-0">
//                       <img
//                         src={worker.photo}
//                         alt={worker.name}
//                         className="w-16 h-16 rounded-xl border-[3px] border-white object-cover shadow"
//                       />

//                       {worker.available && (
//                         <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0 pb-1">
//                       <div className="flex items-center gap-2">
//                         <h1 className="text-lg font-bold text-slate-900 truncate">
//                           {worker.name}
//                         </h1>

//                         <span
//                           className="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
//                           style={{
//                             background: cat.bg,
//                             color: cat.color,
//                           }}
//                         >
//                           {cat.label}
//                         </span>
//                       </div>

//                       <p className="text-xs text-slate-500 truncate mt-1">
//                         {worker.specialty}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex gap-1 ml-2">
//                     <button
//                       onClick={() => setSaved(!saved)}
//                       className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
//                         saved
//                           ? "bg-red-50 text-red-500"
//                           : "bg-slate-100 text-slate-500"
//                       }`}
//                     >
//                       <Heart
//                         className={`w-4 h-4 ${saved ? "fill-current" : ""}`}
//                       />
//                     </button>

//                     <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
//                       <Share2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Info */}
//                 <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
//                   <div className="flex items-center gap-1 text-slate-500">
//                     <MapPin className="w-3.5 h-3.5 text-[#FF5C39]" />
//                     <span className="truncate">{worker.location}</span>
//                   </div>

//                   <div
//                     className={`flex items-center gap-1 ${
//                       worker.available ? "text-emerald-600" : "text-gray-400"
//                     }`}
//                   >
//                     <div
//                       className={`w-2 h-2 rounded-full ${
//                         worker.available ? "bg-emerald-500" : "bg-gray-300"
//                       }`}
//                     />
//                     {worker.available ? "Available" : "Offline"}
//                   </div>

//                   <div className="flex items-center gap-1 text-slate-500">
//                     <Zap className="w-3.5 h-3.5 text-[#FF5C39]" />
//                     {worker.responseTime}
//                   </div>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-4 gap-2 mt-4">
//                   {[
//                     {
//                       value: worker.rating,
//                       label: "Rating",
//                       icon: Star,
//                       color: "#F59E0B",
//                     },
//                     {
//                       value: `${worker.completedJobs}+`,
//                       label: "Works",
//                       icon: Briefcase,
//                       color: "#3B82F6",
//                     },
//                     {
//                       value: `${worker.yearsExperience}Y`,
//                       label: "Exp",
//                       icon: Award,
//                       color: "#10B981",
//                     },
//                     {
//                       value: worker.responseTime.split(" ")[0],
//                       label: "Reply",
//                       icon: Clock,
//                       color: "#8B5CF6",
//                     },
//                   ].map((item) => {
//                     const Icon = item.icon;

//                     return (
//                       <div
//                         key={item.label}
//                         className="bg-slate-50 rounded-xl py-2 px-1 text-center"
//                       >
//                         <div
//                           className="w-7 h-7 rounded-lg mx-auto flex items-center justify-center mb-1"
//                           style={{
//                             background: `${item.color}15`,
//                           }}
//                         >
//                           <Icon
//                             className="w-4 h-4"
//                             style={{
//                               color: item.color,
//                             }}
//                           />
//                         </div>

//                         <p className="text-sm font-bold text-slate-900 leading-none">
//                           {item.value}
//                         </p>

//                         <p className="text-[10px] text-slate-500 mt-1 leading-none">
//                           {item.label}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* Button */}
//                 <button className="mt-4 w-full h-10 rounded-xl bg-[#FF5C39] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
//                   <MessageCircle className="w-4 h-4" />
//                   Contact Worker
//                 </button>
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
//               <div className="flex border-b border-gray-100">
//                 {(["about", "reviews", "portfolio"] as const).map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab)}
//                     className={`flex-1 py-4 text-sm capitalize transition-colors ${
//                       activeTab === tab
//                         ? "text-[#FF5C39] border-b-2 border-[#FF5C39] bg-orange-50/50"
//                         : "text-[#64748B] hover:text-[#0F172A]"
//                     }`}
//                     style={{ fontWeight: activeTab === tab ? 600 : 400 }}
//                   >
//                     {tab}
//                     {tab === "reviews" && (
//                       <span className="ml-1.5 text-xs bg-gray-100 text-[#64748B] px-1.5 py-0.5 rounded-full">
//                         {worker.reviewCount}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               <div className="p-6">
//                 {/* About Tab */}
//                 {activeTab === "about" && (
//                   <div className="space-y-6">
//                     <div>
//                       <h3
//                         className="text-[#0F172A] mb-3"
//                         style={{ fontWeight: 600 }}
//                       >
//                         About
//                       </h3>
//                       <p className="text-[#475569] text-sm leading-relaxed">
//                         {worker.bio}
//                       </p>
//                     </div>

//                     <div>
//                       <h3
//                         className="text-[#0F172A] mb-3"
//                         style={{ fontWeight: 600 }}
//                       >
//                         Skills & Expertise
//                       </h3>
//                       <div className="flex flex-wrap gap-2">
//                         {worker.skills.map((skill) => (
//                           <span
//                             key={skill}
//                             className="bg-[#F8FAFC] border border-gray-200 text-[#475569] text-sm px-3 py-1.5 rounded-full"
//                           >
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h3
//                         className="text-[#0F172A] mb-3"
//                         style={{ fontWeight: 600 }}
//                       >
//                         Certifications
//                       </h3>
//                       <div className="space-y-2">
//                         {worker.certifications.map((cert) => (
//                           <div key={cert} className="flex items-center gap-2.5">
//                             <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
//                               <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
//                             </div>
//                             <span className="text-[#475569] text-sm">
//                               {cert}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Reviews Tab */}
//                 {activeTab === "reviews" && (
//                   <div>
//                     {/* Rating Summary */}
//                     <div className="bg-[#F8FAFC] rounded-xl p-5 flex items-center gap-6 mb-6">
//                       <div className="text-center">
//                         <div
//                           className="text-[#0F172A]"
//                           style={{
//                             fontSize: "3rem",
//                             fontWeight: 800,
//                             lineHeight: 1,
//                           }}
//                         >
//                           {worker.rating}
//                         </div>
//                         <StarRating rating={worker.rating} />
//                         <div className="text-[#94A3B8] text-xs mt-1">
//                           {worker.reviewCount} reviews
//                         </div>
//                       </div>
//                       <div className="flex-1 space-y-1.5">
//                         {[5, 4, 3, 2, 1].map((star) => {
//                           const pct =
//                             star === 5
//                               ? 72
//                               : star === 4
//                                 ? 20
//                                 : star === 3
//                                   ? 5
//                                   : star === 2
//                                     ? 2
//                                     : 1;
//                           return (
//                             <div key={star} className="flex items-center gap-2">
//                               <span className="text-xs text-[#94A3B8] w-2">
//                                 {star}
//                               </span>
//                               <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
//                               <div className="flex-1 bg-gray-200 rounded-full h-1.5">
//                                 <div
//                                   className="h-1.5 bg-amber-400 rounded-full"
//                                   style={{ width: `${pct}%` }}
//                                 />
//                               </div>
//                               <span className="text-xs text-[#94A3B8] w-6 text-right">
//                                 {pct}%
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>

//                     {/* Review List */}
//                     {workerReviews.length > 0 ? (
//                       <div className="space-y-4">
//                         {workerReviews.map((review) => (
//                           <div
//                             key={review.id}
//                             className="border border-gray-100 rounded-xl p-4"
//                           >
//                             <div className="flex items-start gap-3 mb-3">
//                               <img
//                                 src={review.authorPhoto}
//                                 alt={review.author}
//                                 className="w-9 h-9 rounded-full object-cover"
//                               />
//                               <div className="flex-1">
//                                 <div className="flex items-center justify-between">
//                                   <span
//                                     className="text-[#0F172A] text-sm"
//                                     style={{ fontWeight: 600 }}
//                                   >
//                                     {review.author}
//                                   </span>
//                                   <span className="text-[#94A3B8] text-xs">
//                                     {review.date}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 mt-0.5">
//                                   <StarRating rating={review.rating} />
//                                   <span className="text-xs text-[#64748B] bg-gray-100 px-2 py-0.5 rounded-full">
//                                     {review.jobType}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <p className="text-[#475569] text-sm leading-relaxed">
//                               {review.comment}
//                             </p>
//                             <button className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B] mt-3 transition-colors">
//                               <ThumbsUp className="w-3.5 h-3.5" /> Helpful
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-10 text-[#94A3B8] text-sm">
//                         No reviews yet for this worker.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Portfolio Tab */}
//                 {activeTab === "portfolio" && (
//                   <div>
//                     <p className="text-[#64748B] text-sm mb-5">
//                       Past work samples from {worker.name}
//                     </p>
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                       {portfolioItems.map((img, i) => (
//                         <div
//                           key={i}
//                           className="aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
//                         >
//                           <img
//                             src={img}
//                             alt={`Portfolio ${i + 1}`}
//                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Booking Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-24 space-y-4">
//               {/* Booking Card */}
//               <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
//                 <div className="mb-3">
//                   <div
//                     className="text-[#FF5C39]"
//                     style={{
//                       fontSize: "2rem",
//                       fontWeight: 900,
//                     }}
//                   >
//                     ₹{worker.startingPrice}
//                   </div>

//                   <div className="text-sm text-[#94A3B8]">
//                     {worker.pricingType === "daily" && "Per Day"}
//                     {worker.pricingType === "monthly" && "Per Month"}
//                     {worker.pricingType === "per_job" && "Per Job"}
//                     {worker.pricingType === "per_service" && "Per Service"}
//                     {worker.pricingType === "visit_charge" && "Visit Charge"}
//                     {worker.pricingType === "custom" && "Custom Quote"}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1 mb-5">
//                   <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
//                   <span
//                     className="text-[#0F172A] text-sm"
//                     style={{ fontWeight: 600 }}
//                   >
//                     {worker.rating}
//                   </span>
//                   <span className="text-[#94A3B8] text-sm">
//                     ({worker.reviewCount} reviews)
//                   </span>
//                 </div>

//                 {/* Quick info */}
//                 <div className="space-y-3 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-[#64748B]">Availability</span>
//                     <span
//                       style={{
//                         color: worker.available ? "#10B981" : "#94A3B8",
//                         fontWeight: 600,
//                       }}
//                     >
//                       {worker.available ? "Available Now" : "Unavailable"}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-[#64748B]">Response time</span>
//                     <span
//                       className="text-[#0F172A]"
//                       style={{ fontWeight: 500 }}
//                     >
//                       {worker.responseTime}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-[#64748B]">Location</span>
//                     <span
//                       className="text-[#0F172A]"
//                       style={{ fontWeight: 500 }}
//                     >
//                       {worker.location}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-[#64748B]">Experience</span>
//                     <span
//                       className="text-[#0F172A]"
//                       style={{ fontWeight: 500 }}
//                     >
//                       {worker.yearsExperience} years
//                     </span>
//                   </div>
//                 </div>

//                 <Link
//                   href={`/book/${worker.id}`}
//                   className={`block w-full text-center text-white py-3.5 rounded-xl text-sm transition-colors mb-3 ${
//                     worker.available
//                       ? "bg-[#FF5C39] hover:bg-[#e54e2e]"
//                       : "bg-gray-300 cursor-not-allowed pointer-events-none"
//                   }`}
//                   style={{ fontWeight: 600 }}
//                 >
//                   <Calendar className="w-4 h-4 inline mr-2" />
//                   {worker.available ? "Book Now" : "Currently Unavailable"}
//                 </Link>

//                 <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-[#475569] hover:bg-gray-50 py-3 rounded-xl text-sm transition-colors">
//                   <MessageCircle className="w-4 h-4" />
//                   Send Message
//                 </button>
//               </div>

//               {/* Trust badges */}
//               <div className="bg-white rounded-2xl border border-gray-100 p-5">
//                 <h4
//                   className="text-[#0F172A] text-sm mb-4"
//                   style={{ fontWeight: 600 }}
//                 >
//                   Why Book with Confidence
//                 </h4>
//                 <div className="space-y-3">
//                   {[
//                     {
//                       icon: Shield,
//                       text: "Background checked & verified",
//                       color: "#3B82F6",
//                     },
//                     {
//                       icon: CheckCircle,
//                       text: "Satisfaction guarantee",
//                       color: "#10B981",
//                     },
//                     {
//                       icon: Clock,
//                       text: "Flexible scheduling options",
//                       color: "#8B5CF6",
//                     },
//                   ].map((badge) => {
//                     const Icon = badge.icon;
//                     return (
//                       <div
//                         key={badge.text}
//                         className="flex items-center gap-3 text-sm text-[#475569]"
//                       >
//                         <Icon
//                           className="w-4 h-4 shrink-0"
//                           style={{ color: badge.color }}
//                         />
//                         {badge.text}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
