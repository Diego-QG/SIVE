import { create } from "zustand";
import {
  buscarCursos,
  editarCurso,
  eliminarCurso,
  insertarCurso,
  mostrarCursos,
} from "../index";

export const useCursosStore = create((set, get) => ({
  buscador: "",
  setBuscador: async (p) => {
    set({ buscador: p });

    const trimmedValue = p?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarCursos(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = response ?? [];

        set({
          datacursos: nextData,
          cursositemselect: nextData?.[0] ?? null,
        });
      }
    }
  },

  datacursos: [],
  cursositemselect: null,
  parametros: {},

  mostrarcursos: async (p) => {
    const response = await mostrarCursos(p);
    set({ parametros: p });
    set({ datacursos: response });
    set({ cursositemselect: response?.[0] ?? null }); // guard
    return response;
  },

  selectcurso: (p) => set({ cursositemselect: p }),

  insertarcurso: async (p) => {
    await insertarCurso(p);
    const { mostrarcursos, parametros } = get();
    await mostrarcursos(parametros);
  },

  eliminarcurso: async (p) => {
    await eliminarCurso(p);
    const { mostrarcursos, parametros } = get();
    await mostrarcursos(parametros);
  },

  editarcurso: async (p) => {
    await editarCurso(p);
    const { mostrarcursos, parametros } = get();
    await mostrarcursos(parametros);
  },

  buscarcursos: async (p) => {
    const response = await buscarCursos(p);
    set({ datacursos: response });
    return response;
  },
}));
