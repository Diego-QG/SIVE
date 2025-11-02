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
  setBuscador: async (p) => {
    set({ buscador: p });

    const trimmedValue = p?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarMateriales(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = response ?? [];

        set({
          datamateriales: nextData,
          materialesitemselect: nextData?.[0] ?? null,
        });
      }
    }
  },

  datamateriales: [],
  materialesitemselect: null,
  parametros: {},

  mostrarmateriales: async (p) => {
    const response = await mostrarMateriales(p);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_material ?? "",
      nombre_material: item?.nombre_material ?? item?.nombre ?? "",
    }));

    set({ parametros: p });
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
      buscar: p?.buscar ?? "",
    };

    const response = await buscarMateriales(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_material ?? "",
      nombre_material: item?.nombre_material ?? item?.nombre ?? "",
    }));

    set({ datamateriales: nextData });
    return nextData;
  },
}));
