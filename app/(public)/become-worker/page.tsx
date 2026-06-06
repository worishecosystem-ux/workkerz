import Link from "next/link";

export default function BecomeWorkerPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold">
        Become a Worker
      </h1>

      <p className="mt-4 text-gray-600">
        Join Workkerz and start getting work opportunities.
      </p>

      <Link
        href="https://forms.gle/ncSadKLHkuM3iqRRA"
        className="inline-block mt-6 bg-[#FF5C39] text-white px-6 py-3 rounded-xl"
      >
        Register Now
      </Link>
    </div>
  );
}