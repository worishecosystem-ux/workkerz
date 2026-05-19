import nodemailer from "nodemailer";

export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,
        },
      });

    await transporter.sendMail({
      from:
        process.env.EMAIL_USER,

      to:
        body.customerEmail,

      subject:
        `✅ Booking Confirmed - ${body.bookingId}`,

      html: `
        <div
          style="
            background:#F0FDF4;
            padding:30px;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:620px;
              margin:auto;
              background:white;
              border-radius:24px;
              overflow:hidden;
              border:1px solid #DCFCE7;
            "
          >

            <div
              style="
                background:linear-gradient(135deg,#16A34A,#22C55E);
                padding:30px;
                text-align:center;
              "
            >

              <h1
                style="
                  color:white;
                  margin:0;
                  font-size:28px;
                  font-weight:800;
                "
              >
                Booking Confirmed
              </h1>

              <p
                style="
                  color:rgba(255,255,255,.9);
                  margin-top:10px;
                  font-size:14px;
                "
              >
                Your booking has been approved successfully
              </p>

            </div>

            <div style="padding:24px;">

              <div
                style="
                  background:#F8FAFC;
                  border-radius:18px;
                  padding:18px;
                  margin-bottom:18px;
                "
              >

                <div
                  style="
                    font-size:12px;
                    color:#64748B;
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
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    Customer
                  </td>

                  <td
                    align="right"
                    style="
                      padding:14px 0;
                      font-weight:700;
                      color:#0F172A;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    ${body.customerName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 0;
                      color:#64748B;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    Worker
                  </td>

                  <td
                    align="right"
                    style="
                      padding:14px 0;
                      font-weight:700;
                      color:#0F172A;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    ${body.workerName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 0;
                      color:#64748B;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    Service
                  </td>

                  <td
                    align="right"
                    style="
                      padding:14px 0;
                      font-weight:700;
                      color:#0F172A;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    ${body.serviceType}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:14px 0;
                      color:#64748B;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    Booking Time
                  </td>

                  <td
                    align="right"
                    style="
                      padding:14px 0;
                      font-weight:700;
                      color:#0F172A;
                      border-bottom:1px solid #E2E8F0;
                    "
                  >
                    ${body.bookingDate}
                    ${body.bookingTime}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:18px 0 0;
                      color:#64748B;
                    "
                  >
                    Total Amount
                  </td>

                  <td
                    align="right"
                    style="
                      padding:18px 0 0;
                      font-size:28px;
                      font-weight:900;
                      color:#16A34A;
                    "
                  >
                    ₹${body.total}
                  </td>
                </tr>

              </table>

            </div>

          </div>

        </div>
      `,
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