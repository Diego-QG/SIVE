import { create } from "zustand";
import { mostrarGeo1, mostrarGeo2, mostrarGeo3, mostrarPaises } from "../index";

const initialState = {
  paises: [],
  departamentos: [],
  provincias: [],
  distritos: [],
  paisSeleccionado: null,
  departamentoSeleccionado: null,
  provinciaSeleccionada: null,
  distritoSeleccionado: null,
};

export const useUbicacionesStore = create((set, get) => ({
  ...initialState,

  cargarpaises: async () => {
    const response = await mostrarPaises();
    const data = response ?? [];
    set({ paises: data });
    return data;
  },

  seleccionarpais: async (payload) => {
    const { paises } = get();
    const selected =
      typeof payload === "object"
        ? payload
        : paises.find((pais) => Number(pais.id) === Number(payload));

    set({
      paisSeleccionado: selected ?? null,
      departamentos: [],
      departamentoSeleccionado: null,
      provincias: [],
      provinciaSeleccionada: null,
      distritos: [],
      distritoSeleccionado: null,
    });

    if (!selected?.id) {
      return null;
    }

    const departamentos = (await mostrarGeo1({ id_pais: selected.id })) ?? [];
    set({ departamentos });
    return selected;
  },

  seleccionardepartamento: async (payload) => {
    const { departamentos } = get();
    const selected =
      typeof payload === "object"
        ? payload
        : departamentos.find((item) => Number(item.id) === Number(payload));

    set({
      departamentoSeleccionado: selected ?? null,
      provincias: [],
      provinciaSeleccionada: null,
      distritos: [],
      distritoSeleccionado: null,
    });

    if (!selected?.id) {
      return null;
    }

    const provincias = (await mostrarGeo2({ id_nivel1: selected.id })) ?? [];
    set({ provincias });
    return selected;
  },

  seleccionarprovincia: async (payload) => {
    const { provincias } = get();
    const selected =
      typeof payload === "object"
        ? payload
        : provincias.find((item) => Number(item.id) === Number(payload));

    set({
      provinciaSeleccionada: selected ?? null,
      distritos: [],
      distritoSeleccionado: null,
    });

    if (!selected?.id) {
      return null;
    }

    const distritos = (await mostrarGeo3({ id_nivel2: selected.id })) ?? [];
    set({ distritos });
    return selected;
  },

  seleccionardistrito: (payload) => {
    const { distritos } = get();
    const selected =
      typeof payload === "object"
        ? payload
        : distritos.find((item) => Number(item.id) === Number(payload));

    set({ distritoSeleccionado: selected ?? null });
    return selected;
  },

  limpiarubicaciones: () => set((state) => ({
    ...initialState,
    paises: state.paises,
  })),
}));