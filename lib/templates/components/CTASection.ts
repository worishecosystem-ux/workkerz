export const CTASection = (
  bookingId: string
) => `
<div
  style="
    margin-top:28px;
    text-align:center;
  "
>

<a
  href="https://workkerz.com/booking/${bookingId}"
  style="
    background:#4F46E5;
    color:white;
    text-decoration:none;
    padding:16px 28px;
    border-radius:14px;
    font-weight:700;
    display:inline-block;
  "
>
Track Booking
</a>

</div>
`;