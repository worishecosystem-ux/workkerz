export const HeroBanner = (
  workerName: string
) => `
<div
  style="
    padding:40px 32px 10px;
    text-align:center;
  "
>

<div
  style="
    font-size:38px;
    line-height:1.2;
    font-weight:900;
    color:#0F172A;
  "
>
Booking Confirmed
</div>

<p
  style="
    margin-top:16px;
    color:#64748B;
    font-size:16px;
  "
>
Your service request has been
successfully submitted.

Worker assigned:
<b>${workerName}</b>
</p>

</div>
`;