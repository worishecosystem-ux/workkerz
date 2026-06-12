import { Booking } from "@/types/booking";

export function adminEmailTemplate(
  booking: Booking
) {
  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
/>
</head>

<body
  style="
    margin:0;
    background:#F8FAFC;
    font-family:
      Inter,
      Arial,
      sans-serif;
  "
>

<div
  style="
    padding:30px;
  "
>

<div
  style="
    max-width:760px;
    margin:auto;
    background:#fff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #E2E8F0;
  "
>

<!-- HEADER -->

<div
  style="
    background:
      linear-gradient(
        135deg,
        #0F172A,
        #1E293B
      );
    padding:28px;
  "
>

<div
  style="
    color:white;
    font-size:28px;
    font-weight:800;
  "
>
🟢 New Booking Received
</div>

<div
  style="
    color:#CBD5E1;
    margin-top:8px;
  "
>
Workkerz Admin Notification
</div>

</div>

<!-- BOOKING ID -->

<div
  style="
    padding:24px;
  "
>

<div
  style="
    display:inline-block;
    background:#DCFCE7;
    color:#166534;
    padding:12px 18px;
    border-radius:999px;
    font-weight:700;
  "
>
Booking ID :
${booking.booking_id}
</div>

</div>

<!-- CUSTOMER -->

<div
  style="
    padding:0 24px;
  "
>

<h2
  style="
    color:#0F172A;
  "
>
Customer Information
</h2>

<table
  width="100%"
  cellpadding="12"
  style="
    border:1px solid #E2E8F0;
    border-radius:16px;
  "
>

<tr>
<td>Name</td>
<td align="right">
<b>${booking.customer_name}</b>
</td>
</tr>

<tr>
<td>Email</td>
<td align="right">
<b>${booking.customer_email}</b>
</td>
</tr>

<tr>
<td>Phone</td>
<td align="right">
<b>${booking.customer_phone || "-"}</b>
</td>
</tr>

<tr>
<td>Address</td>
<td align="right">
<b>${booking.customer_address || "-"}</b>
</td>
</tr>

</table>

</div>

<!-- WORKER -->

<div
  style="
    padding:24px;
  "
>

<h2
  style="
    color:#0F172A;
  "
>
Worker Information
</h2>

<table
  width="100%"
  cellpadding="12"
  style="
    border:1px solid #E2E8F0;
    border-radius:16px;
  "
>

<tr>
<td>Worker</td>
<td align="right">
<b>${booking.worker_name}</b>
</td>
</tr>

<tr>
<td>Specialty</td>
<td align="right">
<b>${booking.worker_specialty}</b>
</td>
</tr>

<tr>
<td>Phone</td>
<td align="right">
<b>${booking.worker_phone || "-"}</b>
</td>
</tr>

<tr>
<td>Rating</td>
<td align="right">
<b>
⭐ ${booking.worker_rating || 0}
</b>
</td>
</tr>

</table>

</div>

<!-- SERVICE -->

<div
  style="
    padding:0 24px 24px;
  "
>

<h2>
Service Information
</h2>

<table
  width="100%"
  cellpadding="12"
  style="
    border:1px solid #E2E8F0;
    border-radius:16px;
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
<b>${booking.booking_date}</b>
</td>
</tr>

<tr>
<td>Time</td>
<td align="right">
<b>${booking.booking_time}</b>
</td>
</tr>

<tr>
<td>Status</td>
<td align="right">
<b>${booking.booking_status}</b>
</td>
</tr>

</table>

</div>

<!-- PAYMENT -->

<div
  style="
    padding:0 24px 24px;
  "
>

<h2>
Payment Summary
</h2>

<table
  width="100%"
  cellpadding="12"
  style="
    border:1px solid #E2E8F0;
    border-radius:16px;
  "
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

<tr>
<td>
<b>Grand Total</b>
</td>
<td align="right">
<b>
₹${booking.grand_total}
</b>
</td>
</tr>

</table>

</div>

<!-- ACTION BUTTONS -->

<div
  style="
    text-align:center;
    padding:0 24px 30px;
  "
>

<a
  href="https://admin.workkerz.com/bookings"
  style="
    background:#4F46E5;
    color:white;
    text-decoration:none;
    padding:14px 24px;
    border-radius:12px;
    display:inline-block;
    font-weight:700;
    margin-right:8px;
  "
>
Open Admin Panel
</a>

<a
  href="https://admin.workkerz.com/bookings/${booking.booking_id}"
  style="
    background:#0F172A;
    color:white;
    text-decoration:none;
    padding:14px 24px;
    border-radius:12px;
    display:inline-block;
    font-weight:700;
  "
>
View Booking
</a>

</div>

<!-- FOOTER -->

<div
  style="
    background:#F8FAFC;
    padding:20px;
    text-align:center;
    color:#64748B;
    font-size:13px;
    border-top:1px solid #E2E8F0;
  "
>
Workkerz Admin Notification System
</div>

</div>

</div>

</body>
</html>
`;
}