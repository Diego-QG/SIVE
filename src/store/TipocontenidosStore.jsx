import { create } from "zustand";
import {
  buscarTipoContenidos,
  editarTipoContenido,
  eliminarTipoContenido,
  insertarTipoContenido,
  mostrarTipoContenidos,
} from "../index";

export const useTipoContenidosStore = create((set, get) => ({
  buscador: "",
  setBuscador: async (p) => {
    set({ buscador: p });

    const trimmedValue = p?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarTipoContenidos(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = response ?? [];

        set({
          datatipocontenidos: nextData,
          tipocontenidositemselect: nextData?.[0] ?? null,
        });
      }
    }
  },

  datatipocontenidos: [],
  tipocontenidositemselect: null,
  parametros: {},

  mostrartipocontenidos: async (p) => {
    const response = await mostrarTipoContenidos(p);
    set({ parametros: p });
    set({ datatipocontenidos: response });
    set({ tipocontenidositemselect: response?.[0] ?? null }); // guard
    return response;
  },

  selecttipocontenido: (p) => set({ tipocontenidositemselect: p }),

  insertartipocontenido: async (p) => {
    await insertarTipoContenido(p);
    const { mostrartipocontenidos, parametros } = get();
    await mostrartipocontenidos(parametros);
  },

  eliminartipocontenido: async (p) => {
    await eliminarTipoContenido(p);
    const { mostrartipocontenidos, parametros } = get();
    await mostrartipocontenidos(parametros);
  },

  editartipocontenido: async (p) => {
    await editarTipoContenido(p);
    const { mostrartipocontenidos, parametros } = get();
    await mostrartipocontenidos(parametros);
  },

  buscartipocontenidos: async (p) => {
    const response = await buscarTipoContenidos(p);
    set({ datatipocontenidos: response });
    return response;
  },
}));
