import { create } from "zustand";
import { mostrarUsuarios, obtenerIDAuthSupabase } from "../index";

export const useUsuariosStore = create((set) => ({
  datausuarios: [],
  mostrarusuarios: async()=>{
    const idAuth = await obtenerIDAuthSupabase();
    const response = await mostrarUsuarios({id_auth: idAuth});
    set({datausuarios: response})
    return response;
  }
}))