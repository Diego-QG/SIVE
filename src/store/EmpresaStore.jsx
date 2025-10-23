import { create } from "zustand"
import { insertarEmpresa, mostrarEmpresaXIDUsuario } from "../index"

export const useEmpresaStore = create((set) => ({
    dataempresa: [],
    mostrarempresa: async(p) => {
        const response = await mostrarEmpresaXIDUsuario(p)
        set({dataempresa: response})
        return response;
    },
    insertarempresa: async (p) => {
        const response = await insertarEmpresa(p)
    }
}))