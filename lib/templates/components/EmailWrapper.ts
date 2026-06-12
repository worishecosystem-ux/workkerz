export const EmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F8FAFC;
    font-family:
    Inter,
    Arial,
    sans-serif;
  "
>

<div
  style="
    background:#F8FAFC;
    padding:40px 15px;
  "
>

<div
  style="
    max-width:720px;
    margin:auto;
    background:#ffffff;
    border-radius:32px;
    overflow:hidden;
    border:1px solid #E2E8F0;
    box-shadow:
      0 25px 60px
      rgba(15,23,42,.08);
  "
>

${content}

</div>

</div>

</body>
</html>
`;