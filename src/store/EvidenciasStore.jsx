import { create } from "zustand";
import {
  buscarEditoriales,
  editarEditorial,
  eliminarEditorial,
  eliminarVoucherRecibido,
  insertarEditorial,
  insertarVoucherRecibido,
  mostrarEditoriales,
  mostrarEditorialesPorUsuario,
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

  insertarvoucherrecibido: async (p, file) => {
    await insertarVoucherRecibido(p, file);
    const { mostrareditoriales, parametros } = get();  // <-- parametros (bien escrito)
    await mostrareditoriales(parametros);              // <-- NO uses set(...)
  },

  eliminarvoucherrecibido: async (p) => {
    await eliminarVoucherRecibido(p);
    const { mostrareditoriales, parametros } = get();
    await mostrareditoriales(parametros);
  },

}));
