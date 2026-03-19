export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  business_type?: string | null;
  address?: string | null;
  brand_color: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantStaff {
  id: string;
  merchant_id: string;
  user_id: string;
  role: "owner" | "staff";
  created_at: string;
}

export interface LoyaltyProgram {
  id: string;
  merchant_id: string;
  card_name: string | null;
  card_color: string | null;
  card_template?: string | null;
  card_palette?: string | null;
  card_stamp_shape?: string | null;
  card_stamp_style?: string | null;
  card_custom_bg_color?: string | null;
  card_custom_bg2_color?: string | null;
  stamps_required: number;
  reward_description: string;
  google_pass_class_id: string | null;
  apple_pass_type_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  merchant_id: string;
  name: string;
  qr_secret: string;
  created_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletPass {
  id: string;
  customer_id: string;
  merchant_id: string;
  program_id: string;
  barcode_value: string;
  stamp_count: number;
  reward_available: boolean;
  google_pass_object_id: string | null;
  apple_serial_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantWithProgram extends Merchant {
  loyalty_programs: LoyaltyProgram | null;
  locations: Location[];
}
