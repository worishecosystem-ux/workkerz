import Link from "next/link";

export default function BecomeSellerPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold">
        Become a Seller
      </h1>

      <p className="mt-4 text-gray-600">
        Sell products and materials through E-Aurix.
      </p>

      <Link
        href="https://forms.gle/3uBc51yk2mbe8gCdA"
        className="inline-block mt-6 bg-[#0EA5E9] text-white px-6 py-3 rounded-xl"
      >
        Start Selling
      </Link>
    </div>
  );
}