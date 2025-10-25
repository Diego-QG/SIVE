import { create } from "zustand";
import {
  buscarEditoriales,
  editarEditorial,
  eliminarEditorial,
  insertarEditorial,
  mostrarEditoriales,
} from "../index";

export const useEditorialesStore = create((set, get) => ({
  buscador: "",
  setBuscador: async (p) => {
    set({ buscador: p });

    const trimmedValue = p?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarEditoriales(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = response ?? [];

        set({
          dataeditoriales: nextData,
          editorialesitemselect: nextData?.[0] ?? null,
        });
      }
    }
  },

  dataeditoriales: [],
  editorialesitemselect: null,
  parametros: {},

  mostrareditoriales: async (p) => {
    const response = await mostrarEditoriales(p);
    set({ parametros: p });
    set({ dataeditoriales: response });
    set({ editorialesitemselect: response?.[0] ?? null }); // guard
    return response;
  },

  selecteditorial: (p) => set({ editorialesitemselect: p }),

  insertareditorial: async (p, file) => {
    await insertarEditorial(p, file);
    const { mostrareditoriales, parametros } = get();  // <-- parametros (bien escrito)
    await mostrareditoriales(parametros);              // <-- NO uses set(...)
  },

  eliminareditorial: async (p) => {
    await eliminarEditorial(p);
    const { mostrareditoriales, parametros } = get();
    await mostrareditoriales(parametros);
  },

  editareditorial: async (p, fileold, filenew) => {
    await editarEditorial(p, fileold, filenew);
    const { mostrareditoriales, parametros } = get();
    await mostrareditoriales(parametros);
  },

  buscareditoriales: async (p) => {
    const response = await buscarEditoriales(p);
    set({ dataeditoriales: response });
    return response;
  },
}));
