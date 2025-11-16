import { create } from "zustand";
import { mostrarFamiliaContenidos } from "../index";

export const useFamiliaContenidosStore = create((set) => ({
    familiacontenidositemselect: [],
    selectfamiliacontenido: (p) => {
        set({ familiacontenidositemselect: p })
    },
    datafamiliacontenidos: [],
    mostrarfamiliacontenidos: async () => {
        const response = await mostrarFamiliaContenidos();
        set({ datafamiliacontenidos: response });
        return response;
    },
}));
