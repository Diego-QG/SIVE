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
  setBuscador: (p) => {
    set({ buscador: p });
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
      buscador: `${p?.buscador ?? ""}`.trim(),
    };

    const response = await buscarSubniveles(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_subnivel ?? "",
      nombre_subnivel: item?.nombre_subnivel ?? item?.nombre ?? "",
    }));

    set({ datasubniveles: nextData });
    set({ subnivelesitemselect: nextData?.[0] ?? null });
    return nextData;
  },
}));
