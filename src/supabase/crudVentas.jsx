import Swal from "sweetalert2";
import { supabase } from "../index";

export async function mostrarVentasPorAsesor(p) {
    const { data, error } = await supabase.rpc("fn_mostrarventasxusuario", {
        _id_asesor: p?._id_asesor ?? null,
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