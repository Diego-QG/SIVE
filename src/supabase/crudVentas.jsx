import Swal from "sweetalert2";
import { supabase } from "../index";
const STORAGE_BUCKET_IMAGENES = "imagenes";
const STORAGE_FOLDER_VOUCHERS = "vouchers_recibidos";
const TABLA_EVIDENCIAS = "evidencias";

export async function insertarBorrador(p) {
  const { error, data } = await supabase.rpc("fn_insertarborrador", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return null;
  }

  return data ?? null;
}

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

export async function eliminarBorrador(p) {
    const ventaId = p?._id_venta ?? null;

    const { data: evidencias, error: evidenciasError } = await supabase
        .from(TABLA_EVIDENCIAS)
        .select("id")
        .eq("id_venta", ventaId);

    if (evidenciasError) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: evidenciasError.message,
        });
        return false;
    }

    const { error } = await supabase.rpc("fn_eliminarborrador", p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
        return false;
    }

    const rutas = (evidencias ?? [])
        .map(({ id }) => (id ? `${STORAGE_FOLDER_VOUCHERS}/${id}` : null))
        .filter(Boolean);

    if (rutas.length) {
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET_IMAGENES)
            .remove(rutas);

        if (storageError) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: storageError.message,
            });
        }
    }

    return true;
}

export async function insertarEditorialEnVenta(p) {
  const { error } = await supabase.rpc("fn_insertareditorialenventa", p);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return false;
  }

  return true;
}