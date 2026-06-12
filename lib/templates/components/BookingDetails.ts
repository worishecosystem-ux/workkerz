import { Booking } from "@/types/booking";

export const BookingDetails = (
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
  style="
    border-collapse:collapse;
  "
>

<tr>
<td>Service</td>
<td align="right">
<b>${booking.service_type}</b>
</td>
</tr>

<tr>
<td>Date</td>
<td align="right">
<b>${booking.booking_date || "-"}</b>
</td>
</tr>

<tr>
<td>Time</td>
<td align="right">
<b>${booking.booking_time || "-"}</b>
</td>
</tr>

<tr>
<td>Customer</td>
<td align="right">
<b>${booking.customer_name}</b>
</td>
</tr>

</table>

</div>
`;