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
  setBuscador: (p) => {
    set({ buscador: p });
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
    const payload = {
      buscador: `${p?.buscador ?? ""}`.trim(),
    };

    if (p?._id_empresa !== undefined) {
      payload._id_empresa = p._id_empresa;
    }

    const response = await buscarTipoContenidos(payload);
    set({ datatipocontenidos: response });
    return response;
  },
}));
