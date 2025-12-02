import { create } from "zustand";
import {
  mostrarVentasSupervision,
  lockVentaSupervision,
  aprobarVentaSupervision,
  rechazarVentaSupervision,
  obtenerVentaDetalle,
} from "../index";

export const useSupervisionStore = create((set, get) => ({
  ventasSupervision: [],
  loading: false,
  error: null,
  filtros: {},
  setFiltros: (f) => set({ filtros: f }),

  listarVentas: async () => {
    set({ loading: true, error: null });
    try {
      const data = await mostrarVentasSupervision();
      // Normalize or sort if needed
      set({ ventasSupervision: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  tomarRevision: async (id_venta, id_usuario) => {
    // Attempt to lock
    const result = await lockVentaSupervision({ _id_venta: id_venta, _id_usuario: id_usuario });
    if (result) {
        // Refresh list to show lock status update locally
        await get().listarVentas();
        // Fetch details
        const detalle = await obtenerVentaDetalle({ _id_venta: id_venta });
        return { success: true, detalle };
    }
    return { success: false };
  },

  aprobarVenta: async (payload) => {
      const success = await aprobarVentaSupervision(payload);
      if (success) {
          await get().listarVentas();
      }
      return success;
  },

  rechazarVenta: async (payload) => {
      const success = await rechazarVentaSupervision(payload);
      if (success) {
          await get().listarVentas();
      }
      return success;
  }

}));
