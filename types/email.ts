import { Booking } from "./booking";

export interface CustomerEmailProps {
  booking: Booking;
}

export interface AdminEmailProps {
  booking: Booking;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  cid?: string;
}