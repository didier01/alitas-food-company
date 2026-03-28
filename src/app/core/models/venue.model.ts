export interface Venue {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  googleMapsUrl: string;
  schedule: {
    opening: string;
    closing: string;
    activeDays: string[]; // Ej: ['Lunes', 'Martes', ...]
  };
  active: boolean;
  imageUrl: string;
}
