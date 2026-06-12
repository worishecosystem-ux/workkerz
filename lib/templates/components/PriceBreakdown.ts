import { Booking } from "@/types/booking";

export const PriceBreakdown = (
  booking: Booking
) => `
<div
  style="
    margin-top:24px;
    border:1px solid #E2E8F0;
    border-radius:24px;
    overflow:hidden;
  "
>

<table
  width="100%"
  cellpadding="18"
>

<tr>
<td>Service Fee</td>
<td align="right">
₹${booking.service_fee || 0}
</td>
</tr>

<tr>
<td>Platform Fee</td>
<td align="right">
₹${booking.platform_fee || 0}
</td>
</tr>

<tr>
<td>GST</td>
<td align="right">
₹${booking.gst || 0}
</td>
</tr>

</table>

</div>
`;