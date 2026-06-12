export interface PaymentBreakdown {
  service_fee: number;

  platform_fee: number;

  gst: number;

  discount?: number;

  grand_total: number;
}