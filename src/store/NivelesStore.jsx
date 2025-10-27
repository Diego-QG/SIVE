import { create } from "zustand";
import { mostrarNiveles } from "../index";

export const useNivelesStore = create((set) => ({
    nivelesitemselect: [],
    selectnivel: (p) => {
        set({nivelesitemselect: p})
    },
    dataniveles: [],
    mostrarniveles: async () => {
        const response = await mostrarNiveles();
        set({ dataniveles: response });
        return response;
    },
}));
