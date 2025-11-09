import { create } from "zustand";
import { insertarCredencialesUser, insertarUsuarios, mostrarUsuarios, obtenerIDAuthSupabase } from "../index";

export const useUsuariosStore = create((set) => ({
  refetchs: null,
  datausuarios: [],
  mostrarusuarios: async()=>{
    const idAuth = await obtenerIDAuthSupabase();
    const response = await mostrarUsuarios({id_auth: idAuth});
    set({datausuarios: response})
    return response;
  },
  insertarusuarios: async(p) => {
    const data = await insertarCredencialesUser({
      usuario: p.usuario,
      pass: p.pass
    })
    const dataUserNew = await insertarUsuarios({
      usuario: p.usuario,
      apellido_p: p.apellido_p,
      apellido_m: p.apellido_m,
      nombres: p.nombres,
      nro_doc: p.nro_doc,
      telefono: p.telefono,
      correo: p.correo,
      id_rol: p.id_rol,
      id_auth: data
    })
  }
}))