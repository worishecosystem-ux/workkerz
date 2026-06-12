import axios from "axios";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { Booking } from "@/types/booking";

export async function generateInvoice(
  booking: Booking
) {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([
    595,
    842,
  ]);

  const width = page.getWidth();
  const height = page.getHeight();

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  const bold = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  // =========================
  // HEADER
  // =========================

  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: rgb(
      0.30,
      0.27,
      0.89
    ),
  });

  page.drawText(
    "WORKKERZ",
    {
      x: 40,
      y: height - 50,
      size: 28,
      font: bold,
      color: rgb(
        1,
        1,
        1
      ),
    }
  );

  page.drawText(
    "BOOKING INVOICE",
    {
      x: 40,
      y: height - 80,
      size: 13,
      font,
      color: rgb(
        1,
        1,
        1
      ),
    }
  );

  // =========================
  // WORKER IMAGE
  // =========================

  try {
    if (
      booking.worker_photo
    ) {
      const response =
        await axios.get(
          booking.worker_photo,
          {
            responseType:
              "arraybuffer",
          }
        );

      const type =
        String(response.headers[
          "content-type"
        ] ?? "");

      const image =
        type.includes(
          "png"
        )
          ? await pdfDoc.embedPng(
              response.data
            )
          : await pdfDoc.embedJpg(
              response.data
            );

      page.drawImage(
        image,
        {
          x: 430,
          y:
            height - 160,
          width: 90,
          height: 90,
        }
      );
    }
  } catch {}

  // =========================
  // BOOKING ID
  // =========================

  page.drawRectangle({
    x: 40,
    y: height - 170,
    width: 220,
    height: 40,
    color: rgb(
      0.93,
      0.94,
      1
    ),
  });

  page.drawText(
    `Booking ID: ${booking.booking_id}`,
    {
      x: 50,
      y: height - 155,
      size: 12,
      font: bold,
    }
  );

  // =========================
  // CUSTOMER
  // =========================

  page.drawText(
    "CUSTOMER DETAILS",
    {
      x: 40,
      y: height - 230,
      size: 15,
      font: bold,
    }
  );

  page.drawText(
    `Name : ${booking.customer_name}`,
    {
      x: 40,
      y: height - 255,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Email : ${booking.customer_email}`,
    {
      x: 40,
      y: height - 275,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Phone : ${
      booking.customer_phone ||
      "-"
    }`,
    {
      x: 40,
      y: height - 295,
      size: 11,
      font,
    }
  );

  // =========================
  // WORKER
  // =========================

  page.drawText(
    "WORKER DETAILS",
    {
      x: 320,
      y: height - 230,
      size: 15,
      font: bold,
    }
  );

  page.drawText(
    `Name : ${booking.worker_name}`,
    {
      x: 320,
      y: height - 255,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Specialty : ${
      booking.worker_specialty ||
      "-"
    }`,
    {
      x: 320,
      y: height - 275,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Rating : ⭐ ${
      booking.worker_rating ||
      0
    }`,
    {
      x: 320,
      y: height - 295,
      size: 11,
      font,
    }
  );

  // =========================
  // SERVICE BOX
  // =========================

  page.drawRectangle({
    x: 40,
    y: height - 430,
    width: 515,
    height: 90,
    color: rgb(
      0.97,
      0.98,
      1
    ),
  });

  page.drawText(
    "SERVICE INFORMATION",
    {
      x: 50,
      y: height - 365,
      size: 14,
      font: bold,
    }
  );

  page.drawText(
    `Service : ${booking.service_type}`,
    {
      x: 50,
      y: height - 390,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Date : ${
      booking.booking_date ||
      "-"
    }`,
    {
      x: 250,
      y: height - 390,
      size: 11,
      font,
    }
  );

  page.drawText(
    `Time : ${
      booking.booking_time ||
      "-"
    }`,
    {
      x: 400,
      y: height - 390,
      size: 11,
      font,
    }
  );

  // =========================
  // PRICING TABLE
  // =========================

  page.drawText(
    "PAYMENT SUMMARY",
    {
      x: 40,
      y: height - 480,
      size: 15,
      font: bold,
    }
  );

  const rows = [
    [
      "Service Fee",
      booking.service_fee ||
        0,
    ],
    [
      "Platform Fee",
      booking.platform_fee ||
        0,
    ],
    [
      "GST",
      booking.gst || 0,
    ],
  ];

  let y =
    height - 520;

  rows.forEach(
    ([label, amount]) => {
      page.drawText(
        String(label),
        {
          x: 50,
          y,
          size: 11,
          font,
        }
      );

      page.drawText(
        `₹${amount}`,
        {
          x: 470,
          y,
          size: 11,
          font,
        }
      );

      y -= 25;
    }
  );

  page.drawLine({
    start: {
      x: 40,
      y:
        height - 605,
    },
    end: {
      x: 555,
      y:
        height - 605,
    },
    thickness: 1,
  });

  page.drawText(
    "Grand Total",
    {
      x: 50,
      y:
        height - 635,
      size: 16,
      font: bold,
    }
  );

  page.drawText(
    `₹${booking.grand_total}`,
    {
      x: 430,
      y:
        height - 635,
      size: 18,
      font: bold,
      color: rgb(
        0,
        0.5,
        0.2
      ),
    }
  );

  // =========================
  // TERMS
  // =========================

  page.drawText(
    "Terms & Conditions",
    {
      x: 40,
      y:
        height - 700,
      size: 13,
      font: bold,
    }
  );

  page.drawText(
    "• Invoice generated by Workkerz.",
    {
      x: 50,
      y:
        height - 720,
      size: 10,
      font,
    }
  );

  page.drawText(
    "• Subject to platform policies.",
    {
      x: 50,
      y:
        height - 735,
      size: 10,
      font,
    }
  );

  page.drawText(
    "• For support contact Workkerz.",
    {
      x: 50,
      y:
        height - 750,
      size: 10,
      font,
    }
  );

  // =========================
  // FOOTER
  // =========================

  page.drawLine({
    start: {
      x: 40,
      y: 60,
    },
    end: {
      x: 555,
      y: 60,
    },
    thickness: 1,
    color: rgb(
      0.8,
      0.8,
      0.8
    ),
  });

  page.drawText(
    "© 2026 Workkerz • Trusted Workers At Your Doorstep",
    {
      x: 110,
      y: 40,
      size: 9,
      font,
      color: rgb(
        0.4,
        0.4,
        0.4
      ),
    }
  );

  const pdfBytes =
    await pdfDoc.save();

  return Buffer.from(
    pdfBytes
  );
}