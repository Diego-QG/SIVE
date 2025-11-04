import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "materiales";

async function fetchAllFromRpc(functionName, payload, chunkSize = 1000) {
    const allRows = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .rpc(functionName, payload)
            .range(from, from + chunkSize - 1);

        if (error) {
            return { error };
        }

        const rows = data ?? [];
        allRows.push(...rows);

        if (rows.length < chunkSize) {
            break;
        }

        from += chunkSize;
    }

    return { data: allRows };
}


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

export async function mostrarMateriales(p) {
    const { error, data } = await fetchAllFromRpc("mostrarmateriales_editorial", p);
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
    const payload = {
        buscador: `${p?.buscador ?? ""}`.trim(),
    };

    if (p?._id_empresa !== undefined) {
        payload._id_empresa = p._id_empresa;
    }

    const { error, data } = await fetchAllFromRpc("buscarmateriales_editorial", payload);
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
