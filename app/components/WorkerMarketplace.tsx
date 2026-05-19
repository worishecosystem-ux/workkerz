"use client";

import Link from "next/link";

const services = [
{
title:"Construction",
desc:"Builders, contractors & renovation experts",
icon:"🔨",
image:"https://images.unsplash.com/photo-1504307651254-35680f356dfd"
},
{
title:"Plumbing",
desc:"Pipes, fixtures & water system specialists",
icon:"💧",
image:"https://images.unsplash.com/photo-1585704032915-c3400ca199e7"
},
{
title:"Electrical",
desc:"Wiring, panels & smart home experts",
icon:"⚡",
image:"https://images.unsplash.com/photo-1621905252507-b35492cc74b4"
},
{
title:"Driving",
desc:"Chauffeurs, delivery & logistics drivers",
icon:"🚗",
image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70"
}
];

export default function WorkerMarketplace(){
return(
<section className="max-w-7xl mx-auto px-6 py-16">

{/* heading */}
<div className="flex justify-between items-end mb-10">

<div>
<p className="uppercase tracking-[3px] text-orange-500 text-sm font-semibold mb-4">
Our Services
</p>

<h2 className="text-5xl font-bold text-white mb-4">
Find the Right Expert
</h2>

<p className="text-gray-300 text-xl max-w-xl leading-relaxed">
Browse our four core service categories and connect with the right professional for any job.
</p>

</div>

<Link href="/browse" className="text-orange-400 font-semibold hover:text-orange-300">
Browse All →
</Link>

</div>


{/* cards */}
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

{services.map((service,i)=>(
<div
key={i}
className="bg-white rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 transition duration-300"
>

{/* top image */}
<div className="h-48 overflow-hidden">
<img
src={service.image}
alt={service.title}
className="w-full h-full object-cover"
/>
</div>


{/* bottom content */}
<div className="p-6">

<div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-xl mb-5">
{service.icon}
</div>

<h3 className="text-3xl font-semibold text-slate-900 mb-3">
{service.title}
</h3>

<p className="text-slate-500 leading-8 mb-6">
{service.desc}
</p>

<Link href="/browse" className="text-[#FF5C39] font-semibold">
Explore →
</Link>

</div>

</div>
))}

</div>

</section>
)
}



