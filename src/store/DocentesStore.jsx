import { create } from "zustand";
import { guardarDocenteBorrador, obtenerDocentePorVenta } from "../index";
import { useVentasStore } from "./VentasStore";

const refreshVentasSilently = async () => {
  try {
    const { refrescarVentas } = useVentasStore.getState();
    if (typeof refrescarVentas === "function") {
      await refrescarVentas();
    }
  } catch (error) {
    console.error("No se pudo refrescar la lista de ventas", error);
  }
};

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

    if (p?._id_venta ?? p?.id_venta ?? p?.id) {
      await refreshVentasSilently();
    }
    
    return response ?? null;
  },
  limpiardocentedraft: () => set({ docentedraft: null }),
}));