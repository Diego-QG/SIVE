import Swal from "sweetalert2";
import { supabase } from "../index";

const TABLA_VENTA_SUPERVISION = "venta_supervision";
const TABLA_VENTA_EVENTOS = "venta_eventos";
const TABLA_INCIDENTES = "incidentes";
const TABLA_EVIDENCIAS = "evidencias";
const STORAGE_BUCKET_IMAGENES = "imagenes";
const STORAGE_FOLDER_EVIDENCIAS = "evidencias_incidentes";

export async function mostrarVentasSupervision() {
  const { data, error } = await supabase.rpc("fn_mostrar_ventas_supervision");

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

export async function lockVentaSupervision(p) {
  // p: { _id_venta, _id_usuario }
  const { data, error } = await supabase.rpc("fn_lock_venta_supervision", p);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error al bloquear venta",
      text: error.message,
    });
    return null;
  }

  return data;
}

export async function aprobarVentaSupervision(p) {
    // p: { _id_venta, _id_usuario, _comentario }
    const { data, error } = await supabase.rpc("fn_aprobar_venta_supervision", p);

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Error al aprobar",
            text: error.message,
        });
        return false;
    }
    return true;
}

export async function rechazarVentaSupervision(p) {
    // p: { _id_venta, _id_usuario, _comentario, _incidente_descripcion, _incidente_severidad, _evidencia_file }
    // First, upload evidence if exists
    let evidenciaPath = null;
    if (p.evidencia_file) {
        const file = p.evidencia_file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${p._id_venta}.${fileExt}`;
        const filePath = `${STORAGE_FOLDER_EVIDENCIAS}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET_IMAGENES)
            .upload(filePath, file);

        if (uploadError) {
             Swal.fire({
                icon: "error",
                title: "Error al subir evidencia",
                text: uploadError.message,
            });
            return false;
        }
        evidenciaPath = filePath;
    }

    const payload = {
        _id_venta: p._id_venta,
        _id_usuario: p._id_usuario,
        _comentario: p._comentario,
        _incidente_descripcion: p._incidente_descripcion,
        _incidente_severidad: p._incidente_severidad,
        _evidencia_path: evidenciaPath
    };

    const { data, error } = await supabase.rpc("fn_rechazar_venta_supervision", payload);

    if (error) {
         Swal.fire({
            icon: "error",
            title: "Error al rechazar",
            text: error.message,
        });
        return false;
    }

    return true;
}
