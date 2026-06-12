export const TotalCard = (
  total: number
) => `
<div
  style="
    margin-top:24px;
    background:
      linear-gradient(
        135deg,
        #DCFCE7,
        #ECFDF5
      );
    border:1px solid #BBF7D0;
    border-radius:24px;
    padding:28px;
    text-align:center;
  "
>

<div
  style="
    color:#15803D;
    font-weight:700;
  "
>
GRAND TOTAL
</div>

<div
  style="
    margin-top:10px;
    font-size:46px;
    font-weight:900;
    color:#166534;
  "
>
₹${total}
</div>

</div>
`;