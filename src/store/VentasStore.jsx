import { create } from "zustand";
import { insertarBorrador, mostrarVentasPorUsuario } from "../index";

export const useVentasStore = create((set) => ({
    buscador: "",
    setBuscador: (p) => set({ buscador: p }),
    dataventas: [],
    parametros: {},
    insertarborrador: async(p) => {
        await insertarBorrador(p);
    },
    mostrarventasporusuario: async (p) => {
        const response = await mostrarVentasPorUsuario(p);
        const nextData = response ?? [];

        set({ parametros: p ?? {} });
        set({ dataventas: nextData });
        return nextData;
    },
}));