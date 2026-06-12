export const BookingBadge = (
  bookingId: string
) => `
<div
  style="
    text-align:center;
    margin-top:5px;
  "
>

<span
  style="
    display:inline-block;
    background:#EEF2FF;
    color:#4F46E5;
    border-radius:999px;
    padding:12px 22px;
    font-size:14px;
    font-weight:700;
  "
>
Booking ID • ${bookingId}
</span>

</div>
`;