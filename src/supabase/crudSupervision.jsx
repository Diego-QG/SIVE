import Swal from "sweetalert2";
import { supabase } from "../index";

const TABLA_VENTAS = "ventas";
const TABLA_VENTA_SUPERVISION = "venta_supervision";
const TABLA_DOCENTES = "docentes";
const TABLA_USUARIOS = "usuarios";
const TABLA_VENTA_EVENTOS = "venta_eventos";
const TABLA_INCIDENTES = "incidentes";
const TABLA_EVIDENCIAS = "evidencias";

export async function mostrarVentasSupervision() {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .select(`
      id,
      total_neto,
      fecha_venta,
      observaciones,
      id_docente,
      estado_registro,
      docentes (nombres, apellido_p, apellido_m, tipo_ingreso),
      venta_supervision (estado, actor_usuario, comentario, usuarios (nombres)),
      usuarios (nombres),
      venta_items (
        id,
        materiales_editorial (nombre)
      )
    `)
    .neq("estado_registro", "borrador")
    .order("created_at", { ascending: false });

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

export async function bloquearVentaSupervision({ id_venta, id_usuario }) {
  // Check if it already exists in supervision table.
  // Assuming 1:1 relationship, or at least one active record.
  // First check current status.

  const { data: current, error: fetchError } = await supabase
    .from(TABLA_VENTA_SUPERVISION)
    .select("estado, actor_usuario, usuarios(nombres)")
    .eq("id_venta", id_venta)
    .maybeSingle();

  if (fetchError) {
     Swal.fire({ icon: "error", title: "Error", text: fetchError.message });
     return null;
  }

  // If record doesn't exist, create it (assuming it's safe to do so)
  if (!current) {
      const { data: inserted, error: insertError } = await supabase
          .from(TABLA_VENTA_SUPERVISION)
          .insert({
              id_venta,
              estado: 'en_revision',
              actor_usuario: id_usuario
          })
          .select()
          .single();

      if (insertError) {
        Swal.fire({ icon: "error", title: "Error al bloquear", text: insertError.message });
        return null;
      }
      return inserted;
  }

  // If exists, check if locked
  if (current.estado === 'en_revision' && current.actor_usuario !== id_usuario) {
      Swal.fire({
          icon: "warning",
          title: "Venta bloqueada",
          text: `Esta venta ya está siendo revisada por ${current.usuarios?.nombres ?? 'otro supervisor'}.`
      });
      return null;
  }

  // If approved or rejected, maybe allow re-review? Requirement says "Evitar que dos supervisores evalúen la misma venta a la vez".
  // If it's already approved/rejected, maybe we shouldn't lock it again unless we want to change decision?
  // Let's assume we can take it if it is not currently 'en_revision' by someone else.

  // Try to update
  const { data, error } = await supabase
    .from(TABLA_VENTA_SUPERVISION)
    .update({ estado: 'en_revision', actor_usuario: id_usuario })
    .eq("id_venta", id_venta)
    .select()
    .single();

  if (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
    return null;
  }
  return data;
}

export async function aprobarVentaSupervision({ id_venta, id_usuario, comentario }) {
    const { error } = await supabase
        .from(TABLA_VENTA_SUPERVISION)
        .update({
            estado: 'aprobado',
            actor_usuario: id_usuario,
            comentario: comentario
        })
        .eq("id_venta", id_venta)
        .select()
        .single();

    if (error) {
        Swal.fire({ icon: "error", title: "Error", text: error.message });
        return false;
    }

    // Log event
    await supabase.from(TABLA_VENTA_EVENTOS).insert({
        id_venta,
        area: 'supervision',
        evento: 'aprobado', // Assuming enum matches or text
        estado_supervision: 'aprobado',
        actor_usuario: id_usuario,
        detalle: comentario
    });

    return true;
}

export async function rechazarVentaSupervision({
    id_venta,
    id_usuario,
    comentario,
    id_asesor, // For incident recipient
    evidencia_archivo,
    severidad
}) {
    // 1. Upload evidence if exists (handled by caller ideally, but if passed as path/url?)
    // Assuming evidencia_archivo is the path in storage after upload, or null.

    let id_evidencia = null;
    if (evidencia_archivo) {
        const { data: evData, error: evError } = await supabase
            .from(TABLA_EVIDENCIAS)
            .insert({
                id_venta,
                area: 'supervision',
                tipo: 'incidencia', // Assuming enum or text
                archivo: evidencia_archivo,
                id_usuario: id_usuario
            })
            .select()
            .single();

        if (!evError && evData) {
            id_evidencia = evData.id;
        }
    }

    // 2. Update supervision status
    const { error: supError } = await supabase
        .from(TABLA_VENTA_SUPERVISION)
        .update({
            estado: 'rechazado',
            actor_usuario: id_usuario,
            comentario: comentario
        })
        .eq("id_venta", id_venta);

    if (supError) {
        Swal.fire({ icon: "error", title: "Error", text: supError.message });
        return false;
    }

    // 3. Create incident
    const { error: incError } = await supabase
        .from(TABLA_INCIDENTES)
        .insert({
            id_venta,
            area: 'supervision',
            severidad: severidad || 1,
            descripcion: comentario,
            usuario_reporta: id_usuario,
            usuario_recibe: id_asesor,
            id_evidencia,
            estado: 'abierto'
        });

    if (incError) {
         // Log error but don't fail the whole flow if possible, or show warning
         console.error("Error creating incident", incError);
    }

    // 4. Log event
    await supabase.from(TABLA_VENTA_EVENTOS).insert({
        id_venta,
        area: 'supervision',
        evento: 'rechazado',
        estado_supervision: 'rechazado',
        actor_usuario: id_usuario,
        detalle: comentario
    });

    return true;
}

export async function obtenerVouchersVenta(id_venta) {
    const { data, error } = await supabase
        .from(TABLA_EVIDENCIAS)
        .select("*")
        .eq("id_venta", id_venta)
        .in("tipo", ["voucher", "pago"]); // Check what 'tipo' is used for vouchers. Defaulting to these.

    if (error) return [];
    return data ?? [];
}

export async function subirEvidenciaSupervision(file, id_venta) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `evidencia_${id_venta}_${Date.now()}.${fileExt}`;
    const filePath = `supervision/${fileName}`;

    const { error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file);

    if (error) {
        console.error("Upload error:", error);
        Swal.fire('Error', 'No se pudo subir la evidencia: ' + error.message, 'error');
        return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);

    return publicUrl;
}
