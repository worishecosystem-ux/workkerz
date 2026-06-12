import { Booking } from "@/types/booking";

export const WorkerCard = (
  booking: Booking
) => `
<div
  style="
    margin-top:28px;
    background:#F8FAFC;
    border:1px solid #E2E8F0;
    border-radius:24px;
    padding:24px;
  "
>

<table width="100%">

<tr>

<td width="110">

<img
  src="cid:worker-image"
  width="90"
  height="90"
  style="
    width:90px;
    height:90px;
    border-radius:20px;
    object-fit:cover;
  "
/>

</td>

<td>

<div
  style="
    font-size:24px;
    font-weight:800;
    color:#0F172A;
  "
>
${booking.worker_name}
</div>

<div
  style="
    color:#64748B;
    margin-top:6px;
  "
>
${booking.worker_specialty || ""}
</div>

<div
  style="
    margin-top:10px;
    color:#F59E0B;
    font-weight:700;
  "
>
⭐ ${booking.worker_rating || 4.8}
</div>

</td>

</tr>

</table>

</div>
`;