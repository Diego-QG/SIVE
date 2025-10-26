import { create } from "zustand";
import { mostrarTipoContenidos } from "../index";

export const useTipoContenidosStore = create((set) => ({
    tipocontenidositemselect: [],
    selecttipodocumento: (p) => {
        set({tipocontenidositemselect: p})
    },
    datatipocontenidos: [],
    mostrartipocontenidos: async () => {
        const response = await mostrarTipoContenidos();
        set({ datatipocontenidos: response });
        set({ tipocontenidositemselect: response?.[0] ?? null });
        return response;
    },
}));
