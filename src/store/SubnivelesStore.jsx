import { create } from "zustand";
import {
  buscarSubniveles,
  editarSubnivel,
  eliminarSubnivel,
  insertarSubnivel,
  mostrarSubniveles,
} from "../index";

export const useSubnivelesStore = create((set, get) => ({
  buscador: "",
  setBuscador: async (p) => {
    set({ buscador: p });

    const trimmedValue = p?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarSubniveles(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = response ?? [];

        set({
          datasubniveles: nextData,
          subnivelesitemselect: nextData?.[0] ?? null,
        });
      }
    }
  },

  datasubniveles: [],
  subnivelesitemselect: null,
  parametros: {},

  mostrarsubniveles: async (p) => {
    const response = await mostrarSubniveles(p);
    set({ parametros: p });
    set({ datasubniveles: response });
    set({ subnivelesitemselect: response?.[0] ?? null }); // guard
    return response;
  },

  selectsubnivel: (p) => set({ subnivelesitemselect: p }),

  insertarsubnivel: async (p, file) => {
    await insertarSubnivel(p, file);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  eliminarsubnivel: async (p) => {
    await eliminarSubnivel(p);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  editarsubnivel: async (p, fileold, filenew) => {
    await editarSubnivel(p, fileold, filenew);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  buscarsubniveles: async (p) => {
    const response = await buscarSubniveles(p);
    set({ datasubniveles: response });
    return response;
  },
}));
