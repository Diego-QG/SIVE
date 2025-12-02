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
    const processed = data
      .filter(record => record.ventas) // Only keep records with associated sales
      .map(record => {
       const v = record.ventas; // The nested sale object
       return {
         ...v, // Sale properties (id, total_neto, etc)
         // Overwrite id with the sale id? Or keep supervision id?
         // The UI expects 'id' to be the sale id for actions like 'tomarRevision' (which uses id_venta).
         // However, `venta_supervision` table has its own ID.
         // Let's keep `id` as sale ID because the existing code uses it for `tomarRevision(row.id, ...)` -> `bloquearVentaSupervision({id_venta: row.id})`.
         // Wait, `bloquearVentaSupervision` takes `id_venta`.
         // Let's look at `Supervision.jsx`: `const idVenta = row.id;`
         // So `row.id` MUST be the sale ID.
         id: Number(v?.id),

         // Docente info from nested sale
         nombre_docente: `${v?.docentes?.nombres} ${v?.docentes?.apellido_p} ${v?.docentes?.apellido_m}`,
         tipo_ingreso: v?.docentes?.tipo_ingreso,

         // Items
         resumen_venta: (v?.venta_items || []).map(i => i.materiales_editorial?.nombre).join(', ') || '-',

         // Seller info (from nested sale)
         nombre_vendedor: v?.usuarios?.nombres,

         // Supervision info (from root record)
         estado_supervision: record.estado,
         supervisor_nombre: record.usuarios?.nombres ?? '-',
         comentario_supervision: record.comentario ?? '',
         actor_usuario: record.actor_usuario, // Important for permission checks

         // Keep reference to supervision record ID if needed?
         id_supervision: record.id
       };
    });
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
