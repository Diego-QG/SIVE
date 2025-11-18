import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "evidencias";
const storageBucket = "imagenes";
const storageFolder = "vouchers_recibidos";

export async function insertarVoucherRecibido(p, file) {
    const { error, data: nuevo_id } = await supabase.rpc("fn_insertarvoucherrecibido", {
        _id_venta: p?._id_venta ?? null,
        _archivo: p?._archivo ?? null,
        _id_usuario: p?._id_usuario ?? null,
    });
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }

    if (!file?.size || !nuevo_id) {
        return;
    }

    const publicUrl = await subirImagen(nuevo_id, file);
    if (!publicUrl) {
        return;
    }

    await actualizarArchivoEvidencia({
        id: nuevo_id,
        archivo: publicUrl,
    });
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

    if (data) {
        const { data: urlimagen, error: errorUrl } = await supabase.storage
            .from(storageBucket)
            .getPublicUrl(ruta);

        if (errorUrl) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: errorUrl.message,
            });
            return null;
        }

        return urlimagen?.publicUrl ?? null;
    }

    return null;
}

async function actualizarArchivoEvidencia({ id, archivo }) {
    if (!id || !archivo) {
        return;
    }

    const { error } = await supabase
        .from(tabla)
        .update({ archivo })
        .eq("id", id);
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
    if (p?.archivo && p.archivo !== "-") {
        const ruta = `${storageFolder}/${p.id}`;
        await supabase.storage.from(storageBucket).remove([ruta]);
    }
}