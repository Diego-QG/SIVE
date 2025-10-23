import { create } from "zustand";
import { mostrarModulos } from "../index";

export const useModulosStore = create((set) => ({
  dataModulos: [],
  mostrarModulos: async()=>{
    const response = await mostrarModulos();
    set({dataModulos: response})
    return response;
  }
}))