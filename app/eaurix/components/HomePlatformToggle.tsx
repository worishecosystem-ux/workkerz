"use client";

import { usePathname } from "next/navigation";
import PlatformToggle from "@/app/components/PlatformToggle";

export default function HomePlatformToggle() {
  const pathname = usePathname();

  if (pathname !== "/eaurix") {
    return null;
  }

  return <PlatformToggle isApp={true} />;
}
