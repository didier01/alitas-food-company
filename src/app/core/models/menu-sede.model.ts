export interface MenuSede {
  id: string;
  sedeId: string;
  nombre: string;
  productoIds: string[]; // lista de productos habilitados para esa sede
  esCompartido: boolean; // si true, aplica a todas las sedes
  activo: boolean;
}
