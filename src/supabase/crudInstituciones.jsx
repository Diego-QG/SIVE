import Swal from "sweetalert2";
import { supabase } from "./supabase.config";

const tabla = "instituciones";
const TABLA_VENTAS = "ventas";
const TABLA_DOCENTES = "docentes";
const SELECT_COLUMNS =
  "id, nombre, cod_institucion, id_pais, id_geo_nivel1, id_geo_nivel2, id_geo_nivel3";

const handleError = (error, context = "crudInstituciones") => {
  if (!error) return false;

  const friendlyMessage =
    error?.code === "23503"
      ? "No se puede eliminar la institución porque está asociada a docentes u otros registros."
      : error?.message;

  console.error(`[${context}] Supabase error`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    friendlyMessage,
  });

  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: friendlyMessage,
  });

  return true;
};

export async function crearInstitucionVacia(p = {}) {
  const payload = {
    nombre: p?.nombre ?? null,
    cod_institucion: p?.cod_institucion ?? null,
    id_pais: p?.id_pais ?? null,
    id_geo_nivel1: p?.id_geo_nivel1 ?? null,
    id_geo_nivel2: p?.id_geo_nivel2 ?? null,
    id_geo_nivel3: p?.id_geo_nivel3 ?? null,
  };

  const { data, error } = await supabase
    .from(tabla)
    .insert(payload)
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (handleError(error)) {
    return null;
  }

  return data ?? null;
}

export async function obtenerInstitucionPorVenta(p = {}) {
  const ventaId = p?._id_venta ?? null;

  if (!ventaId) {
    return null;
  }

  const { data: venta, error: ventaError } = await supabase
    .from(TABLA_VENTAS)
    .select("id_docente")
    .eq("id", ventaId)
    .maybeSingle();

  if (handleError(ventaError, "obtenerInstitucionPorVenta")) {
    return null;
  }

  const docenteId = venta?.id_docente ?? null;

  if (!docenteId) {
    return null;
  }

  const { data: docente, error: docenteError } = await supabase
    .from(TABLA_DOCENTES)
    .select("id_institucion")
    .eq("id", docenteId)
    .maybeSingle();

  if (handleError(docenteError, "obtenerInstitucionPorVenta")) {
    return null;
  }

  const institucionId = docente?.id_institucion ?? null;

  if (!institucionId) {
    return null;
  }

  const { data, error } = await supabase
    .from(tabla)
    .select(SELECT_COLUMNS)
    .eq("id", institucionId)
    .maybeSingle();

  if (handleError(error, "obtenerInstitucionPorVenta")) {
    return null;
  }

  return data ?? null;
}

export async function guardarInstitucionBorrador(p = {}) {
  const shouldPersist = p?.shouldPersist !== false;
  const institucionId = p?._id_institucion ?? null;

  if (!shouldPersist) {
    if (!institucionId) {
      return null;
    }

    await eliminarInstitucion({ id: institucionId });
    return null;
  }

  const payload = {
    nombre: p?.nombre ?? null,
    cod_institucion: p?.cod_institucion ?? null,
    id_pais: p?.id_pais ?? null,
    id_geo_nivel1: p?.id_geo_nivel1 ?? null,
    id_geo_nivel2: p?.id_geo_nivel2 ?? null,
    id_geo_nivel3: p?.id_geo_nivel3 ?? null,
  };

  if (institucionId) {
    const { data, error } = await supabase
      .from(tabla)
      .update(payload)
      .eq("id", institucionId)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (handleError(error, "guardarInstitucionBorrador-update")) {
      return null;
    }

    return data ?? null;
  }

  const { data, error } = await supabase
    .from(tabla)
    .insert(payload)
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (handleError(error, "guardarInstitucionBorrador-insert")) {
    return null;
  }

  return data ?? null;
}

export async function eliminarInstitucion(p = {}) {
  const institucionId = p?.id ?? null;

  if (!institucionId) {
    return false;
  }

  const { error } = await supabase.from(tabla).delete().eq("id", institucionId);

  if (handleError(error, "eliminarInstitucion")) {
    return false;
  }

  return true;
}