export interface AreasExteriores {
  id?: number; // El 'id' ahora es opcional
  cui_number?: number;
  identificacion_plano: number;
  tipo: string;
  superficie: number;
  estado_conservacion?: string | null;
  terminacion_piso?: string | null;
  relevamiento_id?: number;
}

export interface Column {
  header: string;
  key: keyof AreasExteriores;
  type: "select" | "input" | "text";
  options?: string[] | string[] | { id: number; label: string }[]; // ✅ Ahora acepta objetos;
  conditional?: (areas: AreasExteriores) => boolean;
}
