import nodemailer from "nodemailer";

declare global {
  var workkerzTransporter:
    | nodemailer.Transporter
    | undefined;
}

function createTransporter() {
  const provider =
    process.env.EMAIL_PROVIDER ||
    "gmail";

  switch (provider) {
    case "hostinger":
      return nodemailer.createTransport({
        host:
          process.env.SMTP_HOST,
        port: Number(
          process.env.SMTP_PORT ||
            465
        ),
        secure: true,

        auth: {
          user:
            process.env.EMAIL_USER,
          pass:
            process.env.EMAIL_PASS,
        },

        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

    case "zoho":
      return nodemailer.createTransport({
        host:
          "smtp.zoho.in",

        port: 465,

        secure: true,

        auth: {
          user:
            process.env.EMAIL_USER,
          pass:
            process.env.EMAIL_PASS,
        },

        pool: true,
      });

    case "gmail":
    default:
      return nodemailer.createTransport({
        service: "gmail",

        auth: {
          user:
            process.env.EMAIL_USER,
          pass:
            process.env.EMAIL_PASS,
        },

        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });
  }
}

export const transporter =
  global.workkerzTransporter ||
  createTransporter();

if (
  process.env.NODE_ENV !==
  "production"
) {
  global.workkerzTransporter =
    transporter;
}