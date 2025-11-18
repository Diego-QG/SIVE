import { create } from "zustand";
import { eliminarVoucherRecibido, insertarVoucherRecibido } from "../index";

export const useEvidenciasStore = create((set, get) => ({
  ventaidactual: null,
  voucherspendientes: [],

  setventaactual: (ventaId) => {
    set((state) => ({
      ventaidactual: ventaId ?? null,
      voucherspendientes: state.voucherspendientes.map((voucher) => ({
        ...voucher,
        ventaId: voucher.ventaId ?? ventaId ?? null,
      })),
    }));
  },

  agregarvoucherspendientes: (vouchers = []) => {
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return;
    }

    const ventaId = get().ventaidactual;
    const nuevosVouchers = vouchers
      .filter((voucher) => voucher?.file)
      .map((voucher, index) => ({
        ...voucher,
        id: voucher.id ?? `${Date.now()}-${index}`,
        ventaId: voucher.ventaId ?? ventaId ?? null,
      }));

    if (!nuevosVouchers.length) {
      return;
    }

    set((state) => ({
      voucherspendientes: [...state.voucherspendientes, ...nuevosVouchers],
    }));
  },

  removervoucherpendiente: (voucherId) => {
    if (!voucherId) {
      return;
    }

    set((state) => ({
      voucherspendientes: state.voucherspendientes.filter((item) => item.id !== voucherId),
    }));
  },

  limpiarvoucherspendientes: () => {
    set({ voucherspendientes: [] });
  },

  subirvoucherspendientes: async ({ idVenta, idUsuario } = {}) => {
    const { voucherspendientes, ventaidactual } = get();
    if (!voucherspendientes.length) {
      return false;
    }

    const ventaFallback = idVenta ?? ventaidactual ?? null;
    let algunVoucherSubido = false;

    for (const voucher of voucherspendientes) {
      const ventaDestino = voucher?.ventaId ?? ventaFallback;
      if (!voucher?.file || !ventaDestino) {
        continue;
      }

      await insertarVoucherRecibido(
        {
          _id_venta: ventaDestino,
          _id_usuario: idUsuario ?? null,
          _archivo: null,
        },
        voucher.file
      );

      algunVoucherSubido = true;
    }

    if (algunVoucherSubido) {
      set({ voucherspendientes: [] });
    }

    return algunVoucherSubido;
  },

  eliminarvoucherrecibido: async (payload) => {
    await eliminarVoucherRecibido(payload);
  },
}));