import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "subniveles";

export async function insertarSubnivel(p, file) {
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

export async function mostrarSubniveles(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .order("id", { ascending: false });
    return data;
}

export async function buscarSubniveles(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .ilike("nombre", "%" + p.descripcion + "%");
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
