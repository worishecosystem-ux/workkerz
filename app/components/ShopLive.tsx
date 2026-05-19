"use client";

const shops = [
{
name:"Sharma Hardware",
category:"Construction Supplies",
sales:"+120 Orders",
img:"https://images.unsplash.com/photo-1581578731548-c64695cc6952"
},
{
name:"Khan Electricals",
category:"Electrical Store",
sales:"+84 Orders",
img:"https://images.unsplash.com/photo-1519710164239-da123dc03ef4"
},
{
name:"Gupta Tools",
category:"Industrial Tools",
sales:"+67 Orders",
img:"https://images.unsplash.com/photo-1497366754035-f200968a6e72"
},
{
name:"Om Traders",
category:"Hardware Dealer",
sales:"+95 Orders",
img:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
},
];

export default function ShopLive(){

const cards=[...shops,...shops];

return(
<section className="bg-[#1E293B] py-4 overflow-hidden border-y border-amber-200">

{/* Live Strip Header */}
<div className="flex items-center mb-3 px-6">
<span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
🔴 LIVE MARKET
</span>

<p className="ml-4 text-gray-300 text-sm">
Top Shops • Real-Time Commerce Activity
</p>
</div>

{/* Moving Cards */}
<div className="marquee flex">
{cards.map((shop,i)=>(
<div
key={i}
className="mx-4 min-w-85 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4"
>

<img
src={shop.img}
alt={shop.name}
className="w-16 h-16 rounded-xl object-cover"
/>

<div className="flex-1">

<h3 className="font-bold text-slate-800">
{shop.name}
</h3>

<p className="text-sm text-gray-500">
{shop.category}
</p>

<div className="mt-2 flex items-center justify-between">

<span className="text-green-600 font-semibold">
📈 {shop.sales}
</span>

<span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
Trending
</span>

</div>

</div>

</div>
))}
</div>

</section>
)
}