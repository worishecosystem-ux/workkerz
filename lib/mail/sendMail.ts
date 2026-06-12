import { transporter } from "./transporter";

export async function sendMail(
  options: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
  }
) {
  const result =
    await transporter.sendMail({
      from: `"Workkerz" <${process.env.EMAIL_USER}>`,

      to: options.to,

      subject:
        options.subject,

      html: options.html,

      attachments:
        options.attachments ||
        [],
    });

  return result;
}