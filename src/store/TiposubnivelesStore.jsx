import { create } from "zustand";
import { mostrarTipoSubniveles } from "../index";

export const useTiposubnivelesStore = create((set) => ({
    tiposubnivelesitemselect: [],
    selecttiposubnivel: (p) => {
        set({tiposubnivelesitemselect: p})
    },
    datatiposubniveles: [],
    mostrartiposubniveles: async () => {
        const response = await mostrarTipoSubniveles();
        set({ datatiposubniveles: response });
        set({ tiposubnivelesitemselect: response?.[0] ?? null });
        return response;
    },
}));
