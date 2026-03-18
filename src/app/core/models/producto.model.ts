export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoriaId: string;
  disponible: boolean;
  destacado: boolean;
  alergenos?: string[];
  personalizaciones?: string[];
}
