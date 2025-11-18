import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "evidencias";

export async function insertarVoucherRecibido(p, file) {
    const { error, data } = await supabase.rpc("fn_insertarvoucherrecibido", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
    const img = file.size;
    if (img != undefined) {
        const nuevo_id = data;
        const urlImagen = await subirImagen(nuevo_id, file);
        const pLogoEditar = {
            archivo: urlImagen.publicUrl,
            id: nuevo_id,
        };
        await editarVoucherEvidencia(pLogoEditar);
    }
}

async function subirImagen(idevidencia, file) {
    const ruta = "vouchers_recibidos/" + idevidencia;
    const { data, error } = await supabase.storage
        .from("imagenes")
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
        const { data: urlimagen } = await supabase.storage
            .from("imagenes")
            .getPublicUrl(ruta);
        return urlimagen;
    }
}

async function editarVoucherEvidencia(p) {
    const { error } = await supabase.from("evidencias").update(p).eq("id", p.id);
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
    if (p.logo != "-") {
        const ruta = "vouchers_recibidos/" + p.id;
        await supabase.storage.from("imagenes").remove([ruta]);
    }
}