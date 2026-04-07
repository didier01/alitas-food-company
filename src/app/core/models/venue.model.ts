export interface Venue {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  google_maps_url: string;
  schedule_opening: string;
  schedule_closing: string;
  schedule_active_days: string[];
  active: boolean;
  image_url: string;
  created_at?: string;
}
