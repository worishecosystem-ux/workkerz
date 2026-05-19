import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    console.log("API HIT");

    const body = await req.json();

    console.log("BODY =>", body);

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

    console.log("EMAIL_USER =>", process.env.EMAIL_USER);

    console.log(
      "EMAIL_PASS =>",
      process.env.EMAIL_PASS ? "FOUND" : "MISSING",
    );

    // FALLBACK IMAGE
    const workerImage =
      body.worker?.photo &&
      body.worker.photo.startsWith("http")
        ? body.worker.photo
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            body.worker?.name || "Worker",
          )}&background=0F172A&color=ffffff&size=200`;

    // TRANSPORTER
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",

      port: 465,

      secure: true,

      auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,
      },
    });

    // CUSTOMER EMAIL
    await transporter.sendMail({
      from: `"Workkerz" <${process.env.EMAIL_USER}>`,

      to: customerEmail,

      subject: `Booking Request Submitted - ${body.bookingId}`,

      html: `
        <div
          style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            border-radius:24px;
            overflow:hidden;
            border:1px solid #E2E8F0;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              background:linear-gradient(135deg,#16A34A,#22C55E);
              padding:30px;
              text-align:center;
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

            <h1
              style="
                color:white;
                margin-top:18px;
                font-size:28px;
                font-weight:800;
              "
            >
              Booking Submitted Successfully
            </h1>

            <p
              style="
                color:rgba(255,255,255,.9);
                font-size:14px;
                margin-top:10px;
              "
            >
              Our team will contact you soon.
            </p>

          </div>

          <div style="padding:24px;">

            <div
              style="
                display:flex;
                gap:18px;
                align-items:center;
                margin-bottom:24px;
              "
            >

              <img
                src="${workerImage}"
                style="
                  width:90px;
                  height:90px;
                  border-radius:24px;
                  object-fit:cover;
                "
              />

              <div>

                <div
                  style="
                    font-size:24px;
                    font-weight:800;
                    color:#0F172A;
                  "
                >
                  ${body.worker?.name || "-"}
                </div>

                <div
                  style="
                    color:#64748B;
                    margin-top:4px;
                    font-size:14px;
                  "
                >
                  ${body.worker?.specialty || "-"}
                </div>

              </div>

            </div>

            <table
              width="100%"
              cellpadding="12"
              style="
                border-collapse:collapse;
                font-size:14px;
              "
            >

              <tr>
                <td style="color:#64748B;">Booking ID</td>

                <td
                  align="right"
                  style="
                    font-weight:800;
                    color:#16A34A;
                  "
                >
                  ${body.bookingId}
                </td>
              </tr>

              <tr>
                <td style="color:#64748B;">Service</td>

                <td
                  align="right"
                  style="font-weight:700;"
                >
                  ${body.form?.serviceType || "-"}
                </td>
              </tr>

              <tr>
                <td style="color:#64748B;">Date</td>

                <td
                  align="right"
                  style="font-weight:700;"
                >
                  ${body.form?.date || "-"}
                </td>
              </tr>

              <tr>
                <td style="color:#64748B;">Time</td>

                <td
                  align="right"
                  style="font-weight:700;"
                >
                  ${body.form?.time || "-"}
                </td>
              </tr>

              <tr>
                <td style="color:#64748B;">Customer</td>

                <td
                  align="right"
                  style="font-weight:700;"
                >
                  ${body.form?.name || "-"}
                </td>
              </tr>

              <tr>
                <td style="color:#64748B;">Phone</td>

                <td
                  align="right"
                  style="font-weight:700;"
                >
                  ${body.form?.phone || "-"}
                </td>
              </tr>

              <tr>
                <td
                  style="
                    color:#64748B;
                    padding-top:18px;
                    font-size:16px;
                  "
                >
                  Grand Total
                </td>

                <td
                  align="right"
                  style="
                    color:#16A34A;
                    font-size:30px;
                    font-weight:900;
                    padding-top:18px;
                  "
                >
                  ₹${body.grandTotal || 0}
                </td>
              </tr>

            </table>

          </div>

        </div>
      `,
    });

    console.log("CUSTOMER EMAIL SENT");

    // ADMIN EMAIL
    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: "mouryaashu73417@gmail.com",

      subject: `🟢 New Booking - ${body.bookingId}`,

      html: `
        <div
          style="
            font-family:Arial,sans-serif;
            padding:20px;
          "
        >

          <h2>New Booking Received</h2>

          <p>
            <b>Booking ID:</b>
            ${body.bookingId}
          </p>

          <p>
            <b>Customer:</b>
            ${body.form?.name}
          </p>

          <p>
            <b>Phone:</b>
            ${body.form?.phone}
          </p>

          <p>
            <b>Service:</b>
            ${body.form?.serviceType}
          </p>

          <p>
            <b>Worker:</b>
            ${body.worker?.name}
          </p>

          <p>
            <b>Total:</b>
            ₹${body.grandTotal}
          </p>

        </div>
      `,
    });

    console.log("ADMIN EMAIL SENT");

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.log("EMAIL ERROR =>", error);

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
