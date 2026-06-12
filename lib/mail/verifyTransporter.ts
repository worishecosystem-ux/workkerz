import { transporter } from "./transporter";

export async function verifyTransporter() {
  try {
    await transporter.verify();

    console.log(
      "✅ SMTP Connected"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ SMTP Error",
      error
    );

    return false;
  }
}