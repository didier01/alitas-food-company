export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  horario: {
    apertura: string;
    cierre: string;
    diasActivos: string[]; // Ej: ['Lunes', 'Martes', ...]
  };
  activa: boolean;
  imagenUrl: string;
}
