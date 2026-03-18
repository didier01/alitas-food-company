export interface Combo {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  productosIncluidos: {
    productoId: string;
    cantidad: number;
  }[];
  sedeIds: string[]; // ['ALL'] o específicos
  activo: boolean;
}
