export interface Venue {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  schedule: {
    opening: string;
    closing: string;
    activeDays: string[]; // Ej: ['Lunes', 'Martes', ...]
  };
  active: boolean;
  imageUrl: string;
}
