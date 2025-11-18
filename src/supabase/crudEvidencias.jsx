import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "evidencias";
const storageBucket = "imagenes";
const storageFolder = "vouchers_recibidos";

export async function insertarVoucherRecibido(p, file) {
    const { error, data: nuevoId } = await supabase.rpc("fn_insertarvoucherrecibido", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }

    if (!file?.size || !nuevoId) {
        return;
    }

    const publicUrl = await subirImagen(nuevoId, file);
    if (!publicUrl) {
        return;
    }

    const payload = {
        archivo: publicUrl,
        id: nuevoId,
    };

    await editarVoucherEvidencia(payload);
}

async function subirImagen(idevidencia, file) {
    const ruta = `${storageFolder}/${idevidencia}`;
    const { data, error } = await supabase.storage
        .from(storageBucket)
        .upload(ruta, file, {
            cacheControl: "0",
            upsert: true,
        });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }

    if (!data) {
        return null;
    }

    const { data: urlimagen } = await supabase.storage
        .from(storageBucket)
        .getPublicUrl(ruta);
    return urlimagen?.publicUrl ?? null;
}

async function editarVoucherEvidencia(p) {
    const { error } = await supabase.from(tabla).update(p).eq("id", p.id);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function eliminarVoucherRecibido(p) {
    const { error } = await supabase.from(tabla).delete().eq("id", p.id);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }

    const ruta = `${storageFolder}/${p.id}`;
    await supabase.storage.from(storageBucket).remove([ruta]);
}