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
  setBuscador: (p) => {
    set({ buscador: p });
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
    const payload = {
      id_empresa: p?.id_empresa,
      buscador: `${p?.buscador ?? ""}`.trim(),
    };

    const response = await buscarEditoriales(payload);
    const nextData = response ?? [];

    set({ dataeditoriales: nextData });
    set({ editorialesitemselect: nextData?.[0] ?? null });
    return nextData;
  },
}));
