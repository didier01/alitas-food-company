export interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  descuentoPorcentaje?: number;
  precioEspecial?: number;
  imagenUrl: string;
  sedeIds: string[]; // puede ser ['ALL'] para todas las sedes
  fechaInicio: string; // ISO String recomendado
  fechaFin: string; // ISO String recomendado
  diasAplica: string[]; // Ej: ['Martes', 'Miercoles']
  activa: boolean;
}
