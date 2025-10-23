import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "empresa";

export async function insertarEmpresa(p) {
    const { data, error } = await supabase
        .from(tabla)
        .insert(p)
        .select()
        .maybeSingle();
    if (error) {
        // Swal.fire({
        //     icon: "error",
        //     title: "Oops...",
        //     text: error.message,
        // });
        return;
    }
    return data;
}

export async function mostrarEmpresaXIDUsuario(p) {
    const { data } = await supabase
        .rpc("mostrarempresaxiduser", p)
        .maybeSingle();
    // if (error) {
    //     Swal.fire({
    //         icon: "error",
    //         title: "Oops...",
    //         text: error.message,
    //     });
    //     return;
    // }
    return data;
}
