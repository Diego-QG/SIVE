import Swal from "sweetalert2";
import { supabase } from "../index";

const tabla = "docentes";
const TABLA_VENTAS = "ventas";
const SELECT_COLUMNS =
  "id, id_empresa, id_pais, nro_doc, telefono, nombres, apellido_p, apellido_m";

const handleError = (error) => {
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return true;
  }

  return false;
};

export async function obtenerDocentePorVenta(p = {}) {
  const ventaId = p?._id_venta ?? p?.id_venta ?? p?.id ?? null;

  if (!ventaId) {
    return null;
  }

  const { data: venta, error: ventaError } = await supabase
    .from(TABLA_VENTAS)
    .select("id_docente")
    .eq("id", ventaId)
    .maybeSingle();

  if (handleError(ventaError)) {
    return null;
  }

  const docenteId = venta?.id_docente ?? null;

  if (!docenteId) {
    return null;
  }

  const { data: docente, error: docenteError } = await supabase
    .from(tabla)
    .select(SELECT_COLUMNS)
    .eq("id", docenteId)
    .maybeSingle();

  if (handleError(docenteError)) {
    return null;
  }

  return docente ?? null;
}

export async function guardarDocenteBorrador(p = {}) {
  const ventaId = p?._id_venta ?? p?.id_venta ?? null;

  if (!ventaId) {
    return null;
  }

  const shouldPersist = p?.shouldPersist !== false;

  if (!shouldPersist) {
    const { error } = await supabase
      .from(TABLA_VENTAS)
      .update({ id_docente: null })
      .eq("id", ventaId);

    if (handleError(error)) {
      return null;
    }

    return null;
  }

  const empresaId = p?._id_empresa ?? null;

  if (!empresaId) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "La empresa del docente no es válida.",
    });
    return null;
  }

  const docentePayload = {
    id_empresa: empresaId,
    id_pais: p?._id_pais ?? null,
    nro_doc: p?.nro_doc ? Number(p.nro_doc) : null,
    telefono: p?.telefono ? `${p.telefono}` : null,
    nombres: p?.nombres ?? null,
    apellido_p: p?.apellido_p ?? null,
    apellido_m: p?.apellido_m ?? null,
  };

  const docenteId = p?._id_docente ?? null;
  let savedDocente = null;

  if (docenteId) {
    const { data, error } = await supabase
      .from(tabla)
      .update(docentePayload)
      .eq("id", docenteId)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (handleError(error)) {
      return null;
    }

    savedDocente = data ?? null;
  } else {
    const { data, error } = await supabase
      .from(tabla)
      .insert(docentePayload)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (handleError(error)) {
      return null;
    }

    savedDocente = data ?? null;
  }

  if (!savedDocente?.id) {
    return null;
  }

  const { error: ventaError } = await supabase
    .from(TABLA_VENTAS)
    .update({ id_docente: savedDocente.id })
    .eq("id", ventaId);

  if (handleError(ventaError)) {
    return null;
  }

  return savedDocente;
}