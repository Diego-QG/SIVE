import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "materiales";

export async function insertarMaterial(p) {
    const { error, data } = await supabase.rpc("insertarmaterial", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function mostrarMateriales() {
    const { error, data } = await supabase.rpc("mostrarmateriales_editorial");
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
    return data;
}

export async function buscarMateriales(p) {
    const { error, data } = await supabase.rpc("buscarmateriales", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
    return data;
}

export async function eliminarMaterial(p) {
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

export async function editarMaterial(p) {
    const { error } = await supabase.rpc("editarmaterial", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}
