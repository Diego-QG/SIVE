import { create } from "zustand";
import {
  buscarSubniveles,
  editarSubnivel,
  eliminarSubnivel,
  insertarSubnivel,
  mostrarNiveles,
  mostrarSubniveles,
  mostrarTiposSubniveles,
} from "../index";

function enrichSubniveles(items = [], niveles = [], tipos = []) {
  const nivelesMap = new Map(niveles?.map((nivel) => [nivel.id, nivel]));
  const tiposMap = new Map(tipos?.map((tipo) => [tipo.id, tipo]));

  return items.map((item) => {
    const nivel = nivelesMap.get(item.id_nivel);
    const tipo = tiposMap.get(item.id_tipo_subnivel);

    return {
      ...item,
      nivelNombre: nivel?.nombre ?? item.nivelNombre ?? "",
      tipoNombre: tipo?.nombre ?? item.tipoNombre ?? "",
    };
  });
}

export const useSubnivelesStore = create((set, get) => ({
  buscador: "",
  datasubniveles: [],
  parametros: {},
  niveles: [],
  tiposSubniveles: [],

  setBuscador: async (value) => {
    set({ buscador: value });

    const trimmedValue = value?.trim?.() ?? "";

    if (!trimmedValue) {
      const { parametros } = get();

      if (parametros && Object.keys(parametros).length > 0) {
        const response = await mostrarSubniveles(parametros);
        const currentValue = get().buscador?.trim?.() ?? "";

        if (currentValue) {
          return;
        }

        const nextData = enrichSubniveles(
          response ?? [],
          get().niveles,
          get().tiposSubniveles
        );

        set({
          datasubniveles: nextData,
        });
      }
    }
  },

  mostrarsubniveles: async (payload) => {
    const response = await mostrarSubniveles(payload);
    set({ parametros: payload });
    const enriched = enrichSubniveles(
      response ?? [],
      get().niveles,
      get().tiposSubniveles
    );
    set({ datasubniveles: enriched });
    return enriched;
  },

  buscarsubniveles: async (payload) => {
    const response = await buscarSubniveles(payload);
    const enriched = enrichSubniveles(
      response ?? [],
      get().niveles,
      get().tiposSubniveles
    );
    set({ datasubniveles: enriched });
    return enriched;
  },

  mostrarniveles: async (payload) => {
    const response = await mostrarNiveles(payload);
    set({ niveles: response ?? [] });
    const enriched = enrichSubniveles(
      get().datasubniveles,
      response ?? [],
      get().tiposSubniveles
    );
    set({ datasubniveles: enriched });
    return response;
  },

  mostrartiposubniveles: async () => {
    const response = await mostrarTiposSubniveles();
    set({ tiposSubniveles: response ?? [] });
    const enriched = enrichSubniveles(
      get().datasubniveles,
      get().niveles,
      response ?? []
    );
    set({ datasubniveles: enriched });
    return response;
  },

  insertarsubnivel: async (payload) => {
    await insertarSubnivel(payload);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  eliminarsubnivel: async (payload) => {
    await eliminarSubnivel(payload);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },

  editarsubnivel: async (payload) => {
    await editarSubnivel(payload);
    const { mostrarsubniveles, parametros } = get();
    await mostrarsubniveles(parametros);
  },
}));