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
  setBuscador: (p) => {
    set({ buscador: p });
  },

  datacursos: [],
  cursositemselect: null,
  parametros: {},

  mostrarcursos: async (p) => {
    const response = await mostrarCursos(p);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_curso ?? "",
      nombre_curso: item?.nombre_curso ?? item?.nombre ?? "",
    }));

    set({ parametros: p });
    set({ datacursos: nextData });
    set({ cursositemselect: nextData?.[0] ?? null }); // guard
    return nextData;
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
    const payload = {
      buscador: `${p?.buscador ?? ""}`.trim(),
    };

    const response = await buscarCursos(payload);
    const nextData = (response ?? []).map((item) => ({
      ...item,
      nombre: item?.nombre ?? item?.nombre_curso ?? "",
      nombre_curso: item?.nombre_curso ?? item?.nombre ?? "",
    }));

    set({ datacursos: nextData });
    set({ cursositemselect: nextData?.[0] ?? null });
    return nextData;
  },
}));
