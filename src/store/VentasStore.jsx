import { create } from "zustand";
import { mostrarVentasPorAsesor } from "../index";

export const useVentasStore = create((set) => ({
    buscador: "",
    setBuscador: (p) => set({ buscador: p }),
    dataventas: [],
    parametros: {},
    mostrarVentas: async (p) => {
        const response = await mostrarVentasPorAsesor(p);
        const nextData = response ?? [];

        set({ parametros: p ?? {} });
        set({ dataventas: nextData });
        return nextData;
    },
}));