import { create } from "zustand";
import { guardarDocenteBorrador, obtenerDocentePorVenta } from "../index";

export const useDocentesStore = create((set) => ({
  docentedraft: null,
  cargardocenteporventa: async (p) => {
    const response = await obtenerDocentePorVenta(p);
    set({ docentedraft: response ?? null });
    return response ?? null;
  },
  guardardocenteborrador: async (p) => {
    const response = await guardarDocenteBorrador(p);

    if (response) {
      set({ docentedraft: response });
    } else if (p?.shouldPersist === false) {
      set({ docentedraft: null });
    }

    return response ?? null;
  },
  limpiardocentedraft: () => set({ docentedraft: null }),
}));