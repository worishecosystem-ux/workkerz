"use client";

import { Suspense } from "react";
import { EAurixShop } from "../components/EAurixShop";

function ShopContent() {
  return <EAurixShop />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}