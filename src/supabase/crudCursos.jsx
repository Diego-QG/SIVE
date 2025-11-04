import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "cursos";

export async function insertarCurso(p) {
    const { error, data } = await supabase.rpc("insertarcurso", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function mostrarCursos() {
    const { error, data } = await supabase.rpc("mostrarcursos");
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

export async function buscarCursos(p) {
    const payload = {
        buscador: `${p?.buscador ?? ""}`.trim(),
    };

    const { error, data } = await supabase.rpc("buscarcursos", payload);
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

export async function eliminarCurso(p) {
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

export async function editarCurso(p) {
    const { error } = await supabase.rpc("editarcurso", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}
