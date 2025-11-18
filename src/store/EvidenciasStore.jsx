import { create } from "zustand";
import { eliminarVoucherRecibido, insertarVoucherRecibido } from "../index";

const revokePreview = (voucher) => {
  if (voucher?.preview && typeof URL !== "undefined") {
    try {
      URL.revokeObjectURL(voucher.preview);
    } catch (_error) {
      /* noop */
    }
  }
};

const generateVoucherId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const resolveArchivoNombre = (file, fallbackId) => {
  const rawName = typeof file?.name === "string" ? file.name.trim() : "";
  if (rawName) {
    return rawName;
  }

  return `voucher_recibido_${fallbackId ?? Date.now()}`;
};

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

  agregarvoucherspendientes: (vouchers) => {
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return;
    }

    const ventaId = get().ventaidactual;

    const nuevosVouchers = vouchers
      .filter((voucher) => voucher?.file)
      .map((voucher) => ({
        ...voucher,
        id: voucher.id ?? generateVoucherId(),
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

    set((state) => {
      const voucher = state.voucherspendientes.find((item) => item.id === voucherId);
      if (voucher) {
        revokePreview(voucher);
      }

      return {
        voucherspendientes: state.voucherspendientes.filter((item) => item.id !== voucherId),
      };
    });
  },

  limpiarvoucherspendientes: () => {
    const { voucherspendientes } = get();
    voucherspendientes.forEach(revokePreview);
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
      const file = voucher?.file;
      const ventaDestino = voucher?.ventaId ?? ventaFallback;

      if (!file || !ventaDestino) {
        continue;
      }

      await insertarVoucherRecibido(
        {
          _id_venta: ventaDestino,
          _id_usuario: idUsuario ?? null,
          _archivo: resolveArchivoNombre(file, voucher.id),
        },
        file
      );

      algunVoucherSubido = true;
    }

    if (algunVoucherSubido) {
      get().limpiarvoucherspendientes();
    }

    return algunVoucherSubido;
  },

  eliminarvoucherrecibido: async (payload) => {
    await eliminarVoucherRecibido(payload);
  },
}));