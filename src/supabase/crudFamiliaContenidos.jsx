import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "familiacontenidos";

export async function mostrarFamiliaContenidos() {
    const { data, error } = await supabase.from(tabla).select();

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
