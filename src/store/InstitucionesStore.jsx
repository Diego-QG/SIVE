import { create } from "zustand";
import {
  crearInstitucionVacia,
  guardarInstitucionBorrador,
  obtenerInstitucionPorVenta,
} from "../index";

export const useInstitucionesStore = create((set) => ({
  institucionDraft: null,

  crearinstitucionvacia: async (payload) => {
    const response = await crearInstitucionVacia(payload);
    if (response) {
      set({ institucionDraft: response });
    }
    return response;
  },

  guardarinstitucionborrador: async (payload) => {
    const response = await guardarInstitucionBorrador(payload);

    if (response) {
      set({ institucionDraft: response });
    } else if (payload?.shouldPersist === false) {
      set({ institucionDraft: null });
    }

    return response ?? null;
  },

  cargarinstitucionporventa: async (payload) => {
    const response = await obtenerInstitucionPorVenta(payload);
    set({ institucionDraft: response ?? null });
    return response ?? null;
  },

  limpiarinstituciondraft: () => set({ institucionDraft: null }),
}));