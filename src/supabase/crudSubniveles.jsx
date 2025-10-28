import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "subniveles";

export async function insertarSubnivel(p) {
    const { error, data } = await supabase.rpc("insertarsubnivel", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function mostrarSubniveles() {
    const { error, data } = await supabase.rpc("mostrarsubniveles");
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

export async function buscarSubniveles(p) {
    const { error, data } = await supabase.rpc("buscarsubniveles", p);
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

export async function eliminarSubnivel(p) {
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

export async function editarSubnivel(p) {
    const { error } = await supabase.rpc("editarsubnivel", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}
