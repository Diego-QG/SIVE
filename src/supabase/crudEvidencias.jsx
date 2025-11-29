import Swal from "sweetalert2";
import { supabase } from "../index";
import { asegurarCuotaYPagos } from "./crudVentaItems";
const STORAGE_BUCKET_IMAGENES = "imagenes";
const STORAGE_FOLDER_VOUCHERS = "vouchers_recibidos";
const TIPO_VOUCHER_RECIBIDO = "voucher_recibido";

const obtenerRutaVoucher = (evidenciaId) =>
    evidenciaId ? `${STORAGE_FOLDER_VOUCHERS}/${evidenciaId}` : null;

const tabla = "evidencias";

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

    const ventaId = p?._id_venta ?? p?.id_venta ?? p?.idVenta ?? null;

    if (!file?.size || !nuevoId) {
        if (ventaId) {
            await asegurarCuotaYPagos({ idVenta: ventaId });
        }
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

    if (ventaId) {
        await asegurarCuotaYPagos({ idVenta: ventaId });
    }
}

async function subirImagen(idevidencia, file) {
    const ruta = obtenerRutaVoucher(idevidencia);
    if (!ruta) {
        return null;
    }
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET_IMAGENES)
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
        .from(STORAGE_BUCKET_IMAGENES)
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

    const ruta = obtenerRutaVoucher(p.id);
    if (ruta) {
        await supabase.storage.from(STORAGE_BUCKET_IMAGENES).remove([ruta]);
    }
}

export async function obtenerVouchersRecibidosPorVenta(p = {}) {
    const idVenta = p?._id_venta ?? p?.id_venta ?? p?.id ?? p?.idVenta ?? null;

    if (!idVenta) {
        return [];
    }

    const { data, error } = await supabase
        .from(tabla)
        .select("id, archivo")
        .eq("id_venta", idVenta)
        .eq("tipo", TIPO_VOUCHER_RECIBIDO);

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