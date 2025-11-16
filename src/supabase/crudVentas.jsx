import Swal from "sweetalert2";
import { supabase } from "../index";

export async function mostrarVentasPorUsuario(p) {
    const { data, error } = await supabase.rpc("fn_mostrarventasxusuario", {
        _id_usuario: p?._id_usuario ?? null,
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return [];
    }

    return data ?? [];
}