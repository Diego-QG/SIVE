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
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_subnivel ?? "",
      nombre_subnivel: item?.nombre_subnivel ?? item?.nombre ?? "",
    }));

    set({ parametros: p });
    set({ datasubniveles: nextData });
    set({ subnivelesitemselect: nextData?.[0] ?? null }); // guard
    return nextData;
  },

  selectsubnivel: (p) => set({ subnivelesitemselect: p }),

  insertarsubnivel: async (p) => {
    await insertarSubnivel(p);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  eliminarsubnivel: async (p) => {
    await eliminarSubnivel(p);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  editarsubnivel: async (p) => {
    await editarSubnivel(p);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  buscarsubniveles: async (p) => {
    const payload = {
      buscar: p?.buscar ?? "",
    };

    const response = await buscarSubniveles(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_subnivel ?? "",
      nombre_subnivel: item?.nombre_subnivel ?? item?.nombre ?? "",
    }));

    set({ datasubniveles: nextData });
    return nextData;
  },
}));
