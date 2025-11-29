import { create } from "zustand";
import {
    eliminarBorrador,
    insertarBorrador,
    insertarEditorialEnVenta,
    obtenerVentaDetalle,
    mostrarVentasPorUsuario,
} from "../index";

export const useVentasStore = create((set, get) => ({
    buscador: "",
    setBuscador: (p) => set({ buscador: p }),
    dataventas: [],
    parametros: {},
    refrescarVentas: async () => {
        const params = get().parametros;
        if (!params || Object.keys(params).length === 0) {
            return [];
        }

        return get().mostrarventasporusuario(params);
    },
    insertarborrador: async (p) => {
        const data = await insertarBorrador(p);
        if (data) {
            await get().refrescarVentas();
        }
        return data;
    },
    eliminarborrador: async (p) => {
        const response = await eliminarBorrador(p);
        if (response) {
            await get().refrescarVentas();
        }
        return response;
    },
    insertareditorialenventa: async (p) => {
        const response = await insertarEditorialEnVenta(p);
        if (response) {
            await get().refrescarVentas();
        }
        return response;
    },
    obtenerventadetalle: async (p) => {
        return obtenerVentaDetalle(p);
    },
    mostrarventasporusuario: async (p) => {
        const response = await mostrarVentasPorUsuario(p);
        const nextData = (response ?? []).map((venta) => {
            if (!venta || typeof venta !== "object") {
                return venta;
            }

            if ("id_venta" in venta && venta.id_venta !== null && venta.id_venta !== undefined) {
                const idVenta = Number(venta.id_venta);
                if (Number.isFinite(idVenta)) {
                    return { ...venta, id: idVenta, id_venta: idVenta };
                }
            }

            if ("id" in venta && venta.id !== null && venta.id !== undefined) {
                const idVenta = Number(venta.id);
                if (Number.isFinite(idVenta)) {
                    return { ...venta, id: idVenta, id_venta: idVenta };
                }
            }

            return venta;
        });

        set({ parametros: p ?? {} });
        set({ dataventas: nextData });
        return nextData;
    },
}));