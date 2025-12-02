import Swal from "sweetalert2";
import { supabase } from "./supabase.config";
import { crearInstitucionVacia, eliminarInstitucion } from "./crudInstituciones";

const tabla = "docentes";
const TABLA_VENTAS = "ventas";
const SELECT_COLUMNS =
  "id, id_empresa, id_pais, id_institucion, nro_doc, telefono, nombres, apellido_p, apellido_m, valido";

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
  const ventaId = p?._id_venta ?? null;

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

export async function buscarDocentePorTelefono(p = {}) {
  const telefono = p?.telefono ?? null;
  const empresaId = p?._id_empresa ?? null;

  if (!telefono) {
    return null;
  }

  // Corregido: primero armamos el query, luego ejecutamos con maybeSingle()
  let query = supabase
    .from(tabla)
    .select(SELECT_COLUMNS)
    .eq("telefono", `${telefono}`);

  if (empresaId) {
    query = query.eq("id_empresa", empresaId);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (handleError(error)) {
    return null;
  }

  return data ?? null;
}

export async function guardarDocenteBorrador(p = {}) {
  const ventaId = p?._id_venta ?? null;

  if (!ventaId) {
    return null;
  }

  const shouldPersist = p?.shouldPersist !== false;
  const docenteId = p?._id_docente ?? null;

  // Caso: NO persistir -> quitamos el docente de la venta y borramos el docente (y su institución si toca)
  if (!shouldPersist) {
    const { error } = await supabase
      .from(TABLA_VENTAS)
      .update({ id_docente: null })
      .eq("id", ventaId);

    if (handleError(error)) {
      return null;
    }

    let docenteData = null;

    if (docenteId) {
      const { data: docente, error: docenteError } = await supabase
        .from(tabla)
        .select("id, id_institucion")
        .eq("id", docenteId)
        .maybeSingle();

      if (handleError(docenteError)) {
        return null;
      }

      docenteData = docente ?? null;

      const { error: docenteDeleteError } = await supabase
        .from(tabla)
        .delete()
        .eq("id", docenteId);

      if (handleError(docenteDeleteError)) {
        return null;
      }

      const institucionId = p?._id_institucion ?? docenteData?.id_institucion ?? null;

      if (institucionId) {
        await eliminarInstitucion({ id: institucionId });
      }
    }

    return null;
  }

  // Caso: SÍ persistir
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
    id_institucion: p?._id_institucion ?? null,
    id_pais: p?._id_pais ?? null,
    nro_doc: p?.nro_doc ? Number(p.nro_doc) : null,
    telefono: p?.telefono ? `${p.telefono}` : null,
    nombres: p?.nombres ?? null,
    apellido_p: p?.apellido_p ?? null,
    apellido_m: p?.apellido_m ?? null,
    // valido NO se toca aquí; queda en el default (false) hasta que la venta se suba
  };

  let savedDocente = null;

  if (docenteId) {
    // Actualizar docente existente
    const { error: linkError } = await supabase
      .from(TABLA_VENTAS)
      .update({ id_docente: docenteId })
      .eq("id", ventaId);

    if (handleError(linkError)) {
      return null;
    }

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
    // Crear nuevo docente
    const { data, error } = await supabase
      .from(tabla)
      .insert(docentePayload)
      .select(SELECT_COLUMNS)
      .maybeSingle();

    if (handleError(error)) {
      return null;
    }

    savedDocente = data ?? null;

    if (savedDocente?.id) {
      const { error: ventaError } = await supabase
        .from(TABLA_VENTAS)
        .update({ id_docente: savedDocente.id })
        .eq("id", ventaId);

      if (handleError(ventaError)) {
        return null;
      }
    }
  }

  if (!savedDocente?.id) {
    return null;
  }

  // Aseguramos que la venta tenga el docente enlazado
  const { error: ventaError } = await supabase
    .from(TABLA_VENTAS)
    .update({ id_docente: savedDocente.id })
    .eq("id", ventaId);

  if (handleError(ventaError)) {
    return null;
  }

  // 👇 OJO: aquí ya NO cambiamos valido.
  // El docente sigue con valido=false hasta que la venta se marque como "subido" en la BD.
  return savedDocente;
}

export async function crearDocenteConInstitucionBorrador(p = {}) {
  const ventaId = p?._id_venta ?? null;
  const empresaId = p?._id_empresa ?? null;
  const paisId = p?._id_pais ?? null;

  if (!ventaId || !empresaId) {
    return null;
  }

  const institucion = await crearInstitucionVacia({ id_pais: paisId });
  const institucionId = institucion?.id ?? null;

  const docentePayload = {
    id_empresa: empresaId,
    id_institucion: institucionId,
    id_pais: paisId,
    nro_doc: null,
    telefono: null,
    nombres: null,
    apellido_p: null,
    apellido_m: null,
    // valido queda en false por default
  };

  const { data: docente, error } = await supabase
    .from(tabla)
    .insert(docentePayload)
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (handleError(error)) {
    if (institucionId) {
      await eliminarInstitucion({ id: institucionId });
    }
    return null;
  }

  if (!docente?.id) {
    if (institucionId) {
      await eliminarInstitucion({ id: institucionId });
    }
    return null;
  }

  const { error: ventaError } = await supabase
    .from(TABLA_VENTAS)
    .update({ id_docente: docente.id })
    .eq("id", ventaId);

  if (handleError(ventaError)) {
    await supabase.from(tabla).delete().eq("id", docente.id);
    if (institucionId) {
      await eliminarInstitucion({ id: institucionId });
    }
    return null;
  }

  // 👇 Tampoco cambiamos valido aquí. Sigue en false.
  return { docente, institucion };
}
