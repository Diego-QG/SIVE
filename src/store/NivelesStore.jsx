import { create } from "zustand";
import { mostrarNiveles } from "../index";

export const useNivelesStore = create((set) => ({
    nivelesitemselect: null,
    selectnivel: (p) => {
        if (!p) {
            set({ nivelesitemselect: null });
            return;
        }

        const nextValue = {
            ...p,
            nombre: p?.nombre ?? p?.nombre_nivel ?? "",
            nombre_nivel: p?.nombre_nivel ?? p?.nombre ?? "",
        };

        set({ nivelesitemselect: nextValue });
    },
    dataniveles: [],
    mostrarniveles: async () => {
        const response = await mostrarNiveles();
        const nextData = (response ?? []).map((item) => ({
            ...item,
            nombre: item?.nombre ?? item?.nombre_nivel ?? "",
            nombre_nivel: item?.nombre_nivel ?? item?.nombre ?? "",
        }));

        set({ dataniveles: nextData });
        return nextData;
    },
}));