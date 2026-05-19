import {
Star,
Package,
MapPin
} from "lucide-react";

const products=[
{
name:"UltraTech Cement",
type:"Construction",
price:"₹380",
unit:"/bag",
seller:"Sharma Hardware",
rating:"4.9",
location:"Bhopal",
tags:["OPC 53","Bulk Supply","Fast Delivery"],
stock:"120 in stock",
img:"https://images.unsplash.com/photo-1541888946425-d81bb19240f5"
},
{
name:"TMT Steel Rod",
type:"Steel",
price:"₹72",
unit:"/kg",
seller:"Gupta Traders",
rating:"4.8",
location:"Indore",
tags:["Fe500","Wholesale"],
stock:"340 in stock",
img:"https://images.unsplash.com/photo-1517048676732-d65bc937f952"
},
{
name:"Electrical Wire",
type:"Electrical",
price:"₹120",
unit:"/m",
seller:"Khan Electricals",
rating:"4.7",
location:"Bhopal",
tags:["Copper","PVC"],
stock:"89 in stock",
img:"https://images.unsplash.com/photo-1621905251189-08b45d6a269e"
},
{
name:"Tiles",
type:"Interior",
price:"₹45",
unit:"/sqft",
seller:"Om Supplies",
rating:"4.8",
location:"Ujjain",
tags:["Designer","Bulk"],
stock:"200 in stock",
img:"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
},
];

const tabs=[
"All Materials",
"Construction",
"Electrical",
"Hardware",
"Industrial"
];

export default function EAurixBrowsePage(){

return(
<div className="min-h-screen bg-slate-100">

<div className="max-w-7xl mx-auto px-6 py-8">

{/* top categories */}
<div className="flex gap-3 flex-wrap mb-8">
{tabs.map((tab,i)=>(
<button
key={i}
className={`px-6 py-3 rounded-full border
${i===0
?"bg-slate-900 text-white"
:"bg-white text-slate-600"}
`}
>
{tab}
</button>
))}
</div>



<div className="grid lg:grid-cols-[260px_1fr] gap-8">

{/* sidebar */}
<div className="bg-white rounded-3xl p-6 shadow-sm h-fit">

<h2 className="text-2xl font-semibold mb-8">
Filters
</h2>

<div className="mb-8">
<div className="flex justify-between mb-4">
<span>Price Range</span>
<span className="text-orange-500 font-semibold">
₹5000
</span>
</div>

<input
type="range"
className="w-full"
/>
</div>


<div className="mb-8">
<h4 className="mb-4 font-medium">
Supplier Rating
</h4>

<div className="flex gap-2 flex-wrap">
{["4+⭐","4.5+⭐","4.8+⭐"].map(item=>(
<button
key={item}
className="border rounded-xl px-4 py-2 text-sm"
>
{item}
</button>
))}
</div>
</div>


<div className="mb-8">
<h4 className="mb-4 font-medium">
Purchase Type
</h4>

<div className="space-y-3">
{["Retail","Wholesale","Bulk"].map(item=>(
<label key={item} className="flex gap-3">
<input type="checkbox"/>
{item}
</label>
))}
</div>
</div>

<button className="w-full border rounded-2xl py-4">
Reset All Filters
</button>

</div>



{/* product cards */}
<div>

<div className="flex justify-between items-center mb-6">
<p className="text-slate-500">
8 materials found
</p>

<button className="bg-white px-5 py-3 rounded-2xl">
Top Suppliers
</button>
</div>



<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

{products.map((item,i)=>(
<div
key={i}
className="bg-white rounded-3xl p-5 shadow-sm"
>

<div className="flex justify-between mb-5">

<div className="flex gap-4">
<img
src={item.img}
className="w-14 h-14 rounded-2xl object-cover"
/>

<div>
<h3 className="font-semibold text-lg">
{item.name}
</h3>

<p className="text-slate-500">
{item.seller}
</p>
</div>

</div>

<span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full h-fit">
{item.type}
</span>

</div>


<div className="flex gap-4 text-sm text-slate-500 mb-4">
<span className="flex items-center gap-1">
<Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>
{item.rating}
</span>

<span className="flex items-center gap-1">
<MapPin className="w-4 h-4"/>
{item.location}
</span>
</div>


<div className="flex flex-wrap gap-2 mb-6">
{item.tags.map(tag=>(
<span
key={tag}
className="bg-slate-100 px-3 py-2 rounded-full text-xs"
>
{tag}
</span>
))}
</div>


<div className="border-t pt-4 flex justify-between items-end">

<div>
<p className="text-3xl font-bold">
{item.price}
<span className="text-base text-slate-500">
{item.unit}
</span>
</p>

<p className="text-sm text-green-600 flex items-center gap-1 mt-1">
<Package className="w-4 h-4"/>
{item.stock}
</p>
</div>

<button className="bg-[#FF5C39] text-white px-6 py-3 rounded-2xl">
Buy Now
</button>

</div>

</div>
))}

</div>

</div>

</div>

</div>

</div>
)
}