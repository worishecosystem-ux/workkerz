import { Booking } from "@/types/booking";

import { EmailWrapper } from "./components/EmailWrapper";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { BookingBadge } from "./components/BookingBadge";
import { WorkerCard } from "./components/WorkerCard";
import { BookingDetails } from "./components/BookingDetails";
import { PriceBreakdown } from "./components/PriceBreakdown";
import { Timeline } from "./components/Timeline";
import { TotalCard } from "./components/TotalCard";
import { CTASection } from "./components/CTASection";
import { SupportCard } from "./components/SupportCard";
import { Footer } from "./components/Footer";

export function customerEmailTemplate(
  booking: Booking
) {
  return EmailWrapper(`

    ${Header()}

    ${HeroBanner(
      booking.worker_name
    )}

    ${BookingBadge(
      booking.booking_id
    )}

    <div
      style="
        padding:32px;
      "
    >

      ${WorkerCard(
        booking
      )}

      ${BookingDetails(
        booking
      )}

      ${Timeline()}

      ${PriceBreakdown(
        booking
      )}

      ${TotalCard(
        booking.grand_total
      )}

      ${CTASection(
        booking.booking_id
      )}

      ${SupportCard()}

    </div>

    ${Footer()}

  `);
}