import { create } from "zustand";
import {
    mostrarVentasSupervision,
    bloquearVentaSupervision,
    aprobarVentaSupervision,
    rechazarVentaSupervision,
    obtenerVouchersVenta,
    subirEvidenciaSupervision
} from "../supabase/crudSupervision";
import { obtenerVentaDetalle } from "../supabase/crudVentas";

export const useSupervisionStore = create((set, get) => ({
  dataVentas: [],
  ventaSeleccionada: null, // For detail view
  vouchersVenta: [],
  isLoading: false,

  mostrarVentas: async () => {
    set({ isLoading: true });
    const data = await mostrarVentasSupervision();
    // Process data to flat structure if needed, similar to ventas store
    const processed = data.map(v => ({
       ...v,
       nombre_docente: `${v.docentes?.nombres} ${v.docentes?.apellido_p} ${v.docentes?.apellido_m}`,
       resumen_venta: (v.venta_items || []).map(i => i.materiales_editorial?.nombre).join(', ') || '-',
       tipo_ingreso: v.docentes?.tipo_ingreso,
       nombre_vendedor: v.usuarios?.nombres,
       estado_supervision: v.venta_supervision?.[0]?.estado ?? 'pendiente',
       supervisor_nombre: v.venta_supervision?.[0]?.usuarios?.nombres ?? '-',
       comentario_supervision: v.venta_supervision?.[0]?.comentario ?? '',
       // Ensure id is number
       id: Number(v.id)
    }));
    set({ dataVentas: processed, isLoading: false });
    return processed;
  },

  tomarRevision: async (id_venta, id_usuario) => {
      const result = await bloquearVentaSupervision({ id_venta, id_usuario });
      if (result) {
          await get().mostrarVentas(); // Refresh list to update status/locks
          return true;
      }
      return false;
  },

  aprobarVenta: async (id_venta, id_usuario, comentario) => {
      const success = await aprobarVentaSupervision({ id_venta, id_usuario, comentario });
      if (success) {
          await get().mostrarVentas();
          return true;
      }
      return false;
  },

  rechazarVenta: async (params) => {
      // params: { id_venta, id_usuario, comentario, id_asesor, evidencia_archivo, severidad }
      const success = await rechazarVentaSupervision(params);
      if (success) {
          await get().mostrarVentas();
          return true;
      }
      return false;
  },

  subirEvidencia: async (file, id_venta) => {
      return await subirEvidenciaSupervision(file, id_venta);
  },

  cargarDetalleVenta: async (id_venta) => {
      const detalle = await obtenerVentaDetalle({ _id_venta: id_venta });
      const vouchers = await obtenerVouchersVenta(id_venta);
      set({ ventaSeleccionada: detalle, vouchersVenta: vouchers });
      return { detalle, vouchers };
  },

  limpiarDetalle: () => set({ ventaSeleccionada: null, vouchersVenta: [] })

}));
