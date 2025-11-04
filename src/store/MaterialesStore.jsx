import { create } from "zustand";
import {
  buscarMateriales,
  editarMaterial,
  eliminarMaterial,
  insertarMaterial,
  mostrarMateriales,
} from "../index";

export const useMaterialesStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },

  datamateriales: [],
  materialesitemselect: null,
  parametros: {},

  mostrarmateriales: async (p) => {
    const payload = p ?? {};
    const response = await mostrarMateriales(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_material ?? "",
      nombre_material: item?.nombre_material ?? item?.nombre ?? "",
    }));

    set({ parametros: payload });
    set({ datamateriales: nextData });
    set({ materialesitemselect: nextData?.[0] ?? null }); // guard
    return nextData;
  },

  selectmaterial: (p) => set({ materialesitemselect: p }),

  insertarmaterial: async (p) => {
    await insertarMaterial(p);
    const { mostrarmateriales, parametros } = get();
    await mostrarmateriales(parametros);
  },

  eliminarmaterial: async (p) => {
    await eliminarMaterial(p);
    const { mostrarmateriales, parametros } = get();
    await mostrarmateriales(parametros);
  },

  editarmaterial: async (p) => {
    await editarMaterial(p);
    const { mostrarmateriales, parametros } = get();
    await mostrarmateriales(parametros);
  },

  buscarmateriales: async (p) => {
    const payload = {
      buscador: `${p?.buscador ?? ""}`.trim(),
    };

    if (p?._id_empresa !== undefined) {
      payload._id_empresa = p._id_empresa;
    }

    const response = await buscarMateriales(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_material ?? "",
      nombre_material: item?.nombre_material ?? item?.nombre ?? "",
    }));

    set({ datamateriales: nextData });
    set({ materialesitemselect: nextData?.[0] ?? null });
    return nextData;
  },
}));
