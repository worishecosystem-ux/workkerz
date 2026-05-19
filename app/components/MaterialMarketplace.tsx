"use client";
import Link from "next/link";
const materials = [
{
title:"Hardware",
desc:"Tools, fasteners & workshop supplies",
icon:"🛠",
image:"https://images.unsplash.com/photo-1504148455328-c376907d081c"
},
{
title:"Construction",
desc:"Cement, steel and building materials",
icon:"🏗",
image:"https://images.unsplash.com/photo-1541888946425-d81bb19240f5"
},
{
title:"Electrical",
desc:"Wires, switches and electrical components",
icon:"⚡",
image:"https://images.unsplash.com/photo-1621905251189-08b45d6a269e"
},
{
title:"Industrial",
desc:"Machines, equipment & repair products",
icon:"⚙",
image:"https://images.unsplash.com/photo-1565008447742-97f6f38c985c"
}
];

export default function MaterialMarketplace(){
return(
<section className="max-w-7xl mx-auto px-6 py-16">

{/* heading */}
<div className="flex justify-between items-end mb-10">

<div>
<p className="uppercase tracking-[3px] text-orange-500 text-sm font-semibold mb-4">
Material Marketplace
</p>

<h2 className="text-5xl font-bold text-white mb-4">
Source Quality Materials
</h2>

<p className="text-gray-300 text-xl max-w-xl leading-relaxed">
Browse top material categories and shop from trusted local suppliers.
</p>

</div>

<Link href="/e-aurix" className="text-orange-400 font-semibold hover:text-orange-300">
Browse All →
</Link>

</div>


{/* Cards */}
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

{materials.map((item,i)=>(
<div
key={i}
className="bg-white rounded-3xl overflow-hidden shadow-xl hover:-translate-y-2 transition duration-300"
>

{/* image */}
<div className="h-48 overflow-hidden">
<img
src={item.image}
alt={item.title}
className="w-full h-full object-cover"
/>
</div>


<div className="p-6">

<div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-xl mb-5">
{item.icon}
</div>

<h3 className="text-3xl font-semibold text-slate-900 mb-3">
{item.title}
</h3>

<p className="text-slate-500 leading-8 mb-6">
{item.desc}
</p>

<button className="text-[#FF5C39] font-semibold">
Explore →
</button>

</div>

</div>
))}

</div>

</section>
)
}