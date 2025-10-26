import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "tipocontenidos";

export async function insertarTipoContenido(p) {
    const { error, data } = await supabase.rpc("insertartipocontenido", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function mostrarTipoContenidos(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .order("id", { ascending: false });
    return data;
}

export async function buscarTipoContenidos(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .ilike("nombre", "%" + p.descripcion + "%");
    return data;
}

export async function eliminarTipoContenido(p) {
    const { error } = await supabase.from(tabla).delete().eq("id", p.id);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function editarTipoContenido(p) {
    const { error } = await supabase.rpc("editartipocontenido", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}
