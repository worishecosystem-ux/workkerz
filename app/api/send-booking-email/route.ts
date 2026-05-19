import nodemailer from "nodemailer";

import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // VALIDATE EMAIL
    const customerEmail = body?.form?.email;

    if (!customerEmail || customerEmail.trim() === "") {
      return Response.json(
        {
          success: false,
          message: "Customer email is missing",
        },
        {
          status: 400,
        },
      );
    }
    // FALLBACK IMAGE
    const workerImage =
      body.worker.photo && body.worker.photo.startsWith("http")
        ? body.worker.photo
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            body.worker.name,
          )}&background=0F172A&color=ffffff&size=200`;

    // HTML
    const html = `
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8"/>

          <script src="https://cdn.tailwindcss.com"></script>

          <style>
            *{
              box-sizing:border-box;
            }

            body{
              margin:0;
              padding:18px;
              background:#EEF2F7;
              font-family:Arial,sans-serif;
            }

            .card{
              background:white;
              border-radius:28px;
              overflow:hidden;
              border:1px solid #E2E8F0;
            }

            .label{
              font-size:10px;
              color:#94A3B8;
              margin-bottom:6px;
              text-transform:uppercase;
              letter-spacing:.5px;
            }

            .value{
              font-size:14px;
              font-weight:700;
              color:#0F172A;
              line-height:1.5;
              word-break:break-word;
            }

            .box{
              background:#F8FAFC;
              border:1px solid #E2E8F0;
              border-radius:20px;
              padding:14px;
            }
          </style>
        </head>

        <body>

          <div class="card">

            <!-- HEADER -->
            <div
              style="
                background:linear-gradient(135deg,#020617,#0F172A,#1E293B);
                padding:15px;
              "
            >

              <table width="100%">
                <tr>

                  <!-- IMAGE -->
                  <td width="90" valign="top">

                    <img
                      src="${workerImage}"
                      width="76"
                      height="76"
                      style="
                        width:76px;
                        height:76px;
                        border-radius:22px;
                        object-fit:cover;
                        border:3px solid rgba(255,255,255,.15);
                        display:block;
                      "
                    />

                  </td>

                  <!-- INFO -->
                  <td valign="top">

                    <div
                      style="
                        color:white;
                        font-size:26px;
                        font-weight:800;
                        line-height:1.2;
                      "
                    >
                      ${body.worker.name}
                    </div>

                    <div
                      style="
                        color:rgba(255,255,255,.7);
                        margin-top:5px;
                        font-size:13px;
                      "
                    >
                      ${body.worker.specialty}
                    </div>

                    <div
                      style="
                        margin-top:10px;
                        color:#FACC15;
                        font-size:11px;
                        font-weight:700;
                      "
                    >
                      ⭐ ${body.worker.rating}
                      &nbsp;&nbsp;&nbsp;
                      <span style="color:#CBD5E1">
                        ${body.worker.completedJobs}+ Works
                      </span>
                    </div>

                  </td>

                  <!-- VERIFIED -->
                  <td width="140" align="right" valign="top">

                    <div
                      style="
                        background:rgba(255,255,255,.1);
                        color:white;
                        padding:10px 14px;
                        border-radius:14px;
                        font-size:10px;
                        display:inline-block;
                      "
                    >
                      Verified Worker
                    </div>

                  </td>

                </tr>
              </table>

            </div>

            <!-- BODY -->
            <div style="padding:15px;">

              <!-- TOP -->
              <table width="100%" style="margin-bottom:12px;">
                <tr>

                  <td>
                    <div
                      style="
                        font-size:22px;
                        font-weight:800;
                        color:#0F172A;
                      "
                    >
                      Booking Summary
                    </div>

                    <div
                      style="
                        color:#64748B;
                        margin-top:4px;
                        font-size:12px;
                      "
                    >
                      Booking ID:
                      <span
                        style="
                          color:#FF5C39;
                          font-weight:800;
                        "
                      >
                        ${body.bookingId}
                      </span>
                    </div>
                  </td>

                  <td align="right">
                    <div
                      style="
                        background:#FFF7ED;
                        color:#EA580C;
                        padding:10px 14px;
                        border-radius:14px;
                        font-size:11px;
                        font-weight:700;
                        display:inline-block;
                      "
                    >
                      Protected Booking
                    </div>
                  </td>

                </tr>
              </table>

              <!-- SERVICE -->
              <div class="box" style="margin-bottom:8px;">
                <div class="label">
                  Service Type
                </div>

                <div class="value">
                  ${body.form.serviceType || "-"}
                </div>
              </div>

              <!-- DESCRIPTION -->
              <div class="box" style="margin-bottom:10px;">
                <div class="label">
                  Work Description
                </div>

                <div class="value" style="font-size:10px;font-weight:600;">
                  ${body.form.description || "-"}
                </div>
              </div>

              <!-- DATE TIME -->
              <table width="100%" style="margin-bottom:10px;">
                <tr>

                  <td width="50%" style="padding-right:6px;">

                    <div class="box">

                      <div class="label">
                        Booking Date
                      </div>

                      <div class="value">
                        ${body.form.date || "-"}
                      </div>

                    </div>

                  </td>

                  <td width="50%" style="padding-left:6px;">

                    <div class="box">

                      <div class="label">
                        Time & Duration
                      </div>

                      <div class="value">
                        ${body.form.time || "-"}
                      </div>

                      <div
                        style="
                          color:#64748B;
                          margin-top:4px;
                          font-size:11px;
                        "
                      >
                        ${body.form.duration}hr Work
                      </div>

                    </div>

                  </td>

                </tr>
              </table>

              <!-- CUSTOMER -->
              <table width="100%" style="margin-bottom:12px;">
                <tr>

                  <td width="50%" style="padding-right:6px;">

                    <div class="box">

                      <div class="label">
                        Customer Name
                      </div>

                      <div class="value">
                        ${body.form.name || "-"}
                      </div>

                    </div>

                  </td>

                  <td width="50%" style="padding-left:6px;">

                    <div class="box">

                      <div class="label">
                        Phone Number
                      </div>

                      <div class="value">
                        ${body.form.phone || "-"}
                      </div>

                    </div>

                  </td>

                </tr>
              </table>

              <!-- EMAIL -->
              <div class="box" style="margin-bottom:10px;">
                <div class="label">
                  Email Address
                </div>

                <div class="value" style="font-size:13px;">
                  ${body.form.email || "-"}
                </div>
              </div>

              <!-- LOCATION -->
              <div class="box" style="margin-bottom:12px;">

                <div class="label">
                  Work Location
                </div>

                <div
                  class="value"
                  style="
                    font-size:12px;
                    line-height:1.8;
                    font-weight:600;
                  "
                >
                  ${[
                    body.form.address,
                    body.form.city,
                    body.form.district,
                    body.form.state,
                    body.form.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>

              </div>

              <!-- NOTES -->
              ${
                body.form.notes
                  ? `
                <div class="box" style="margin-bottom:12px;">

                  <div class="label">
                    Additional Notes
                  </div>

                  <div
                    class="value"
                    style="
                      font-size:12px;
                      line-height:1.8;
                      font-weight:600;
                    "
                  >
                    ${body.form.notes}
                  </div>

                </div>
              `
                  : ""
              }

              <!-- PRICE -->
              <div
                style="
                  background:#020617;
                  border-radius:24px;
                  padding:10px;
                  color:white;
                "
              >

                <table width="100%">

                  <tr>
                    <td
                      style="
                        color:rgba(255,255,255,.7);
                        padding-bottom:14px;
                        font-size:13px;
                      "
                    >
                      Worker Charges
                    </td>

                    <td
                      align="right"
                      style="
                        padding-bottom:18px;
                        font-size:13px;
                        font-weight:700;
                      "
                    >
                      ₹${body.totalCost}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        color:rgba(255,255,255,.7);
                        padding-bottom:14px;
                        font-size:13px;
                      "
                    >
                      Platform Fee
                    </td>

                    <td
                      align="right"
                      style="
                        padding-bottom:14px;
                        font-size:13px;
                        font-weight:700;
                      "
                    >
                      ₹${body.serviceFee}
                    </td>
                  </tr>

                  ${
                    body.materialsCost > 0
                      ? `
                    <tr>
                      <td
                        style="
                          color:rgba(255,255,255,.7);
                          padding-bottom:10px;
                          font-size:13px;
                        "
                      >
                        Materials
                      </td>

                      <td
                        align="right"
                        style="
                          padding-bottom:14px;
                          font-size:13px;
                          font-weight:700;
                        "
                      >
                        ₹${body.materialsCost}
                      </td>
                    </tr>
                  `
                      : ""
                  }

                </table>

                <div
                  style="
                    height:1px;
                    background:rgba(255,255,255,.1);
                    margin:14px 0;
                  "
                ></div>

                <table width="100%">
                  <tr>

                    <td>

                      <div
                        style="
                          color:rgba(255,255,255,.6);
                          font-size:11px;
                        "
                      >
                        Grand Total
                      </div>

                      <div
                        style="
                          margin-top:2px;
                          font-size:34px;
                          font-weight:900;
                        "
                      >
                        ₹${body.grandTotal}
                      </div>

                    </td>

                    <td align="right">

                      <div
                        style="
                          background:#FF5C39;
                          padding:10px 15px;
                          border-radius:16px;
                          display:inline-block;
                          font-size:12px;
                          font-weight:700;
                        "
                      >
                        ${body.form.duration}hr Work
                      </div>

                    </td>

                  </tr>
                </table>

              </div>

            </div>

          </div>

        </body>
      </html>
    `;

    // PDF
    const browser = await puppeteer.launch({
      headless: true,

      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, {
      waitUntil: "load",
    });

    // WAIT FOR ALL IMAGES TO LOAD
    await page.evaluate(async () => {
      const images = Array.from(document.images);

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );
    });

    const pdfBuffer = await page.pdf({
      format: "A4",

      printBackground: true,

      margin: {
        top: "10px",
        bottom: "10px",
        left: "10px",
        right: "10px",
      },
    });

    // MAIL
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,
      },
    });

    // CUSTOMER EMAIL
    // CUSTOMER EMAIL
    await transporter.sendMail({
      from: `"Workkerz" <${process.env.EMAIL_USER}>`,

      to: customerEmail,

      subject: `Booking Request sent - ${body.bookingId}`,

      html: `
<div
  style="
    width:100%;
    background:#F0FDF4;
    padding:12px;
    font-family:Arial,sans-serif;
  "
>

  <div
    style="
      width:100%;
      max-width:700px;
      margin:auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      border:1px solid #DCFCE7;
      box-shadow:0 4px 20px rgba(0,0,0,.05);
    "
  >

    <!-- HEADER -->
    <div
      style="
        background:linear-gradient(135deg,#16A34A,#22C55E);
        padding:24px 18px;
        text-align:center;
      "
    >

      <div
  style="
    width:80px;
    height:80px;
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    backdrop-filter:blur(8px);
  "
>

  <img
  src="https://workkerz.com/workkerzapp.png"
  alt="Workkerz"
  style="
    width:80px;
    height:80px;
    object-fit:contain;
  "
/>

</div>

      <h1
        style="
          margin:12px 0 4px;
          color:white;
          font-size:22px;
          font-weight:800;
          line-height:1.3;
        "
      >
        Your worker booking request has been submitted
      </h1>

      <p
        style="
          margin:0;
          color:rgba(255,255,255,.92);
          font-size:12px;
          line-height:1.6;
        "
      >
        i will reach out to you soon to confirm the details and schedule your service
      </p>

    </div>

    <!-- BODY -->
    <div style="padding:18px;">

      <!-- BOOKING ID -->
      <div
        style="
          background:#F0FDF4;
          border:1px solid #BBF7D0;
          border-radius:14px;
          padding:14px;
          margin-bottom:14px;
        "
      >

        <div
          style="
            font-size:10px;
            color:#15803D;
            margin-bottom:5px;
            text-transform:uppercase;
            letter-spacing:.5px;
          "
        >
          Booking ID
        </div>

        <div
          style="
            font-size:22px;
            font-weight:900;
            color:#16A34A;
            line-height:1.2;
          "
        >
          ${body.bookingId}
        </div>

      </div>

      <!-- DETAILS -->
      <table
        width="100%"
        cellspacing="0"
        style="
          font-size:13px;
        "
      >

        <tr>
          <td
            style="
              padding:10px 0;
              color:#64748B;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Worker
          </td>

          <td
            align="right"
            style="
              padding:10px 0;
              color:#0F172A;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.worker.name}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:10px 0;
              color:#64748B;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Service
          </td>

          <td
            align="right"
            style="
              padding:10px 0;
              color:#0F172A;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.form.serviceType}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:10px 0;
              color:#64748B;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Booking Date
          </td>

          <td
            align="right"
            style="
              padding:10px 0;
              color:#0F172A;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.form.date}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:14px 0 0;
              color:#64748B;
              font-size:13px;
            "
          >
            Grand Total
          </td>

          <td
            align="right"
            style="
              padding:14px 0 0;
              color:#16A34A;
              font-size:28px;
              font-weight:900;
            "
          >
            ₹${body.grandTotal}
          </td>
        </tr>

      </table>

      <!-- INFO -->
      <div
        style="
          margin-top:16px;
          background:#F8FAFC;
          border-radius:14px;
          padding:14px;
          color:#475569;
          line-height:1.7;
          font-size:12px;
        "
      >
        Our team will contact you soon to confirm your booking details and schedule the service.
      </div>

      <!-- PDF -->
      <div
        style="
          margin-top:12px;
          background:#ECFDF5;
          border:1px solid #BBF7D0;
          border-radius:14px;
          padding:14px;
          color:#15803D;
          font-size:12px;
          font-weight:600;
          line-height:1.6;
        "
      >
        Your booking summary PDF is attached with this email.
      </div>

    </div>

  </div>

</div>
`,

      attachments: [
        {
          filename: `${body.bookingId}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    // ADMIN EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: "mouryaashu73417@gmail.com",

      subject: `🟢 New Booking Request Received - ${body.bookingId}`,

      html: `
<div
  style="
    background:#F0FDF4;
    padding:20px;
    font-family:Arial,sans-serif;
  "
>

  <div
    style="
      max-width:620px;
      margin:auto;
      background:#ffffff;
      border-radius:24px;
      overflow:hidden;
      border:1px solid #DCFCE7;
      box-shadow:0 10px 30px rgba(0,0,0,.06);
    "
  >

    <!-- HEADER -->
    <div
      style="
        background:linear-gradient(135deg,#16A34A,#22C55E);
        padding:28px 22px;
        text-align:center;
      "
    >
<div
  style="
    width:80px;
    height:80px;
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
    backdrop-filter:blur(8px);
  "
>

 <img
  src="https://workkerz.com/workkerzapp.png"
  alt="Workkerz"
  style="
    width:80px;
    height:80px;
    object-fit:contain;
  "
/>

</div>

      <h1
        style="
          margin:14px 0 6px;
          color:#ffffff;
          font-size:24px;
          font-weight:800;
          line-height:1.3;
        "
      >
        New Booking Request Received
      </h1>

      <p
        style="
          margin:0;
          color:rgba(255,255,255,.92);
          font-size:13px;
          line-height:1.7;
        "
      >
        A new customer has submitted a booking request on Workkerz.
      </p>

    </div>

    <!-- BODY -->
    <div style="padding:22px;">

      <!-- BOOKING ID -->
      <div
        style="
          background:#F0FDF4;
          border:1px solid #BBF7D0;
          border-radius:18px;
          padding:16px;
          margin-bottom:18px;
        "
      >

        <div
          style="
            color:#15803D;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:.6px;
            margin-bottom:6px;
          "
        >
          Booking ID
        </div>

        <div
          style="
            font-size:24px;
            font-weight:900;
            color:#16A34A;
          "
        >
          ${body.bookingId}
        </div>

      </div>

      <!-- DETAILS -->
      <table
        width="100%"
        cellspacing="0"
        style="
          border-collapse:collapse;
        "
      >

        <tr>
          <td
            style="
              padding:14px 0;
              color:#64748B;
              font-size:13px;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Customer
          </td>

          <td
            align="right"
            style="
              padding:14px 0;
              color:#0F172A;
              font-size:14px;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.form.name}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:14px 0;
              color:#64748B;
              font-size:13px;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Phone
          </td>

          <td
            align="right"
            style="
              padding:14px 0;
              color:#0F172A;
              font-size:14px;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.form.phone}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:14px 0;
              color:#64748B;
              font-size:13px;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Worker
          </td>

          <td
            align="right"
            style="
              padding:14px 0;
              color:#0F172A;
              font-size:14px;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.worker.name}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:14px 0;
              color:#64748B;
              font-size:13px;
              border-bottom:1px solid #E2E8F0;
            "
          >
            Service
          </td>

          <td
            align="right"
            style="
              padding:14px 0;
              color:#0F172A;
              font-size:14px;
              font-weight:700;
              border-bottom:1px solid #E2E8F0;
            "
          >
            ${body.form.serviceType}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding:18px 0 0;
              color:#64748B;
              font-size:13px;
            "
          >
            Grand Total
          </td>

          <td
            align="right"
            style="
              padding:18px 0 0;
              color:#16A34A;
              font-size:30px;
              font-weight:900;
            "
          >
            ₹${body.grandTotal}
          </td>
        </tr>

      </table>

      <!-- FOOTER NOTE -->
      <div
        style="
          margin-top:20px;
          background:#F8FAFC;
          border-radius:16px;
          padding:16px;
          color:#475569;
          font-size:12px;
          line-height:1.7;
        "
      >
        Booking summary PDF has been attached with this email for reference.
      </div>

    </div>

  </div>

</div>
`,

      attachments: [
        {
          filename: `${body.bookingId}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
