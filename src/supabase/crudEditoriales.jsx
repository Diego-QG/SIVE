import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "editoriales";

export async function insertarEditorial(p, file) {
    const { error, data } = await supabase.rpc("insertareditorial", p);
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
            logo: urlImagen.publicUrl,
            id: nuevo_id,
        };
        await editarLogoEditorial(pLogoEditar);
    }
}

async function subirImagen(ideditorial, file) {
    const ruta = "editoriales/" + ideditorial;
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

async function editarLogoEditorial(p) {
    const { error } = await supabase.from("editoriales").update(p).eq("id", p.id);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
}

export async function mostrarEditoriales(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .eq("id_empresa", p.id_empresa)
        .order("id", { ascending: false });
    return data;
}

export async function buscarEditoriales(p) {
    const { data } = await supabase
        .from(tabla)
        .select()
        .eq("id_empresa", p.id_empresa)
        .ilike("nombre", "%" + p.descripcion + "%");
    return data;
}

export async function eliminarEditorial(p) {
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
        const ruta = "editoriales/" + p.id;
        await supabase.storage.from("imagenes").remove([ruta]);
    }
}

export async function editarEditorial(p, fileold, filenew) {
    const { error } = await supabase.rpc("editareditorial", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return;
    }
    if (filenew != "-" && filenew.size != undefined) {
        if (fileold != "-") {
            await editarLogoStorage(p._id, filenew);
        } else {
            const dataImagen = await subirImagen(p._id, filenew);
            const pLogoEditar = {
                logo: dataImagen.publicUrl,
                id: p._id,
            };
            await editarLogoEditorial(pLogoEditar);
        }
    }
}

export async function editarLogoStorage(id, file) {
    const ruta = "editoriales/" + id;
    await supabase.storage.from("imagenes").update(ruta, file, {
        cacheControl: "0",
        upsert: true,
    });
}
