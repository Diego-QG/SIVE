import { create } from "zustand";
import {
    eliminarBorrador,
    insertarBorrador,
    insertarEditorialEnVenta,
    mostrarVentasPorUsuario,
} from "../index";

export const useVentasStore = create((set) => ({
    buscador: "",
    setBuscador: (p) => set({ buscador: p }),
    dataventas: [],
    parametros: {},
    insertarborrador: async (p) => {
        const data = await insertarBorrador(p);
        return data;
    },
    eliminarborrador: async (p) => {
        const response = await eliminarBorrador(p);
        return response;
    },
    insertareditorialenventa: async (p) => {
        const response = await insertarEditorialEnVenta(p);
        return response;
    },
    mostrarventasporusuario: async (p) => {
        const response = await mostrarVentasPorUsuario(p);
        const nextData = response ?? [];

        set({ parametros: p ?? {} });
        set({ dataventas: nextData });
        return nextData;
    },
}));
