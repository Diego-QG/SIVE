import Swal from "sweetalert2";
import { supabase } from "../index";

const handleError = (error, context = "crudVentaItems") => {
  if (!error) return false;

  const friendlyMessage =
    error?.code === "42501"
      ? "No tienes permisos para completar esta acción. Verifica las políticas de seguridad o los triggers asociados."
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

export async function obtenerSubnivelesPorNivel({ idNivel }) {
  if (!idNivel) return [];

  const { data, error } = await supabase
    .from("subniveles")
    .select("id, nombre, id_nivel, ordinal, codigo")
    .eq("id_nivel", idNivel)
    .order("ordinal", { ascending: true })
    .order("nombre", { ascending: true });

  if (handleError(error)) return [];

  return data ?? [];
}

export async function obtenerContenidosPorNivel({ idNivel, idSubnivel, editorialId }) {
  if (!idNivel || !idSubnivel) return { contenidos: [], packs: [] };

  const contenidoQuery = supabase
    .from("contenidobase")
    .select(
      `id, nombre, espaquete, id_curso, id_subnivel,
      cursos(id, nombre, id_nivel),
      subniveles(id, nombre, id_nivel)`
    )
    .eq("id_subnivel", idSubnivel)
    .not("id_curso", "is", null)
    .order("nombre", { ascending: true });

  const packQuery = editorialId
    ? supabase
        .from("pack")
        .select("id, nombre, id_nivel, descripcion, id_editorial")
        .eq("id_nivel", idNivel)
        .eq("id_editorial", editorialId)
        .order("nombre", { ascending: true })
    : supabase
        .from("pack")
        .select("id, nombre, id_nivel, descripcion, id_editorial")
        .eq("id_nivel", idNivel)
        .order("nombre", { ascending: true });

  const [{ data: contenidos, error: contenidoError }, { data: packs, error: packError }] =
    await Promise.all([contenidoQuery, packQuery]);

  if (handleError(contenidoError) || handleError(packError)) {
    return { contenidos: [], packs: [] };
  }

  return { contenidos: contenidos ?? [], packs: packs ?? [] };
}

export async function obtenerMaterialesParaVenta({
  editorialId,
  nivelId,      // no lo usamos directamente en la query, pero lo dejamos por si acaso
  subnivelId,
  contenidoSeleccionado,
}) {
  if (!editorialId || !contenidoSeleccionado) return [];

  const esPack =
    contenidoSeleccionado?.tipo === "pack" ||
    contenidoSeleccionado?.espaquete === true;

  // ------------------------
  // 1. Determinar id_contenidobase a usar
  // ------------------------

  let idContenidoBase = null;

  if (!esPack) {
    // Caso CURSO: el combo viene de contenidobase, así que su id es el id_contenidobase
    idContenidoBase = Number(contenidoSeleccionado.id);
  } else {
    // Caso PACK: debemos buscar el contenidobase "maestro" del pack para ese subnivel
    if (!subnivelId) {
      console.warn("⚠ No hay subnivelId para buscar contenidobase del pack");
      return [];
    }

    const { data: cbRow, error: cbError } = await supabase
      .from("contenidobase")
      .select("id")
      .eq("id_subnivel", subnivelId)
      .eq("espaquete", true)
      .limit(1)
      .maybeSingle(); // usa single() o maybeSingle() según versión

    if (cbError) {
      handleError(cbError);
      return [];
    }

    if (!cbRow) {
      console.warn(
        "⚠ No se encontró contenidobase con espaquete=true para ese subnivel"
      );
      return [];
    }

    idContenidoBase = Number(cbRow.id);
  }

  if (!idContenidoBase) {
    console.warn("⚠ No se pudo determinar idContenidoBase");
    return [];
  }

  // ------------------------
  // 2. Armar query a materiales_editorial
  // ------------------------

  let query = supabase
    .from("materiales_editorial")
    .select(
      `id, nombre, precio, anio, id_mes, id_tipocontenido,
       id_contenidobase, id_pack,
       tipocontenidos:tipocontenidos(nombre, codigo),
       meses:meses(nombre, codigo),
       contenidobase:contenidobase(
         id, nombre, id_subnivel, espaquete,
         cursos:cursos(id, nombre, id_nivel),
         subniveles:subniveles(id, nombre, id_nivel)
       ),
       pack:pack(id, nombre, id_nivel)`
    )
    .eq("id_editorial", editorialId)
    .eq("id_contenidobase", idContenidoBase);

  if (esPack) {
    const idPack = Number(contenidoSeleccionado.id);
    query = query.eq("id_pack", idPack);
  }

  // Orden: año DESC, mes ASC, tipo contenido ASC
  query = query
    .order("anio", { ascending: false })
    .order("id_mes", { ascending: true })
    .order("id_tipocontenido", { ascending: true });

  const { data, error } = await query;

  if (handleError(error)) return [];

  // Si por cualquier cosa se duplicara, mantenemos la lógica de único por periodo
  const uniqueByPeriod = new Map();

  (data ?? []).forEach((material) => {
    const key = [
      material?.id_pack || `cb-${material?.id_contenidobase || ""}`,
      material?.id_tipocontenido || "",
      material?.anio || "",
      material?.id_mes || "",
      material?.nombre || "",
    ].join("|");

    if (!uniqueByPeriod.has(key)) {
      uniqueByPeriod.set(key, material);
    }
  });

  return Array.from(uniqueByPeriod.values());
}

export async function insertarItemsEnVenta({ idVenta, items }) {
  if (!idVenta || !Array.isArray(items) || items.length === 0) return false;

  const payload = items.map((item) => ({
    id_venta: idVenta,
    cantidad: item?.cantidad ?? 1,
    precio_unitario: item?.precio_unitario ?? null,
    id_material_editorial: item?.id_material_editorial ?? null,
  }));

  console.info("[crudVentaItems] Insertando items en venta", { idVenta, items });

  const { error } = await supabase.from("venta_items").insert(payload);

  if (handleError(error)) return false;

  return true;
}

export async function obtenerVentaItemsDetalle({ idVenta }) {
  if (!idVenta) return [];

  const { data, error } = await supabase
    .from("venta_items")
    .select(
      `id, cantidad, precio_unitario, subtotal, id_material_editorial,
      material:materiales_editorial(
        id, nombre, precio, anio, id_mes,
        tipocontenidos:tipocontenidos(nombre),
        meses:meses(nombre)
      )`
    )
    .eq("id_venta", idVenta)
    .order("id", { ascending: true });

  if (handleError(error)) return [];

  return data ?? [];
}

export async function eliminarVentaItem({ id }) {
  if (!id) return false;

  console.info("[crudVentaItems] Eliminando venta_item", { id });

  const { error } = await supabase.from("venta_items").delete().eq("id", id);

  if (handleError(error)) return false;

  return true;
}

const normalizarCuotasPayload = (cuotas = []) =>
  (Array.isArray(cuotas) ? cuotas : [])
    .map((cuota, index) => {
      const nroCuota = Number(
        cuota?.nro_cuota ?? cuota?.id ?? cuota?.nro ?? index + 1
      );

      if (!Number.isFinite(nroCuota)) {
        return null;
      }

      const monto = Number(cuota?.monto_programado ?? cuota?.monto ?? 0) || 0;
      const fechaVencimiento =
        cuota?.fecha_vencimiento ||
        cuota?.fecha ||
        new Date().toISOString().split("T")[0];

      return {
        nro_cuota: nroCuota,
        fecha_vencimiento: fechaVencimiento,
        monto_programado: monto,
        saldo: monto,
      };
    })
    .filter(Boolean);

const sincronizarCuotas = async ({ idVenta, cuotas }) => {
  const cuotasNormalizadas = normalizarCuotasPayload(cuotas);

  const { data: existentes, error: cuotasError } = await supabase
    .from("cuotas")
    .select("id, nro_cuota")
    .eq("id_venta", idVenta);

  if (handleError(cuotasError, "sincronizarCuotas.obtenerCuotas")) {
    return false;
  }

  const nroSet = new Set(cuotasNormalizadas.map((cuota) => cuota.nro_cuota));

  const idsParaEliminar = (existentes ?? [])
    .filter((cuota) => !nroSet.has(Number(cuota.nro_cuota)))
    .map((cuota) => cuota.id)
    .filter(Boolean);

  if (idsParaEliminar.length > 0) {
    const { error: eliminarError } = await supabase
      .from("cuotas")
      .delete()
      .in("id", idsParaEliminar);

    if (handleError(eliminarError, "sincronizarCuotas.eliminarSobrantes")) {
      return false;
    }
  }

  if (cuotasNormalizadas.length === 0) {
    return true;
  }

  const mapaExistentes = new Map(
    (existentes ?? []).map((cuota) => [Number(cuota.nro_cuota), cuota.id])
  );

  const payload = cuotasNormalizadas.map((cuota) => ({
    id: mapaExistentes.get(Number(cuota.nro_cuota)) ?? undefined,
    id_venta: idVenta,
    ...cuota,
  }));

  const { error: upsertError } = await supabase
    .from("cuotas")
    .upsert(payload);

  if (handleError(upsertError, "sincronizarCuotas.upsert")) {
    return false;
  }

  return true;
};

export async function confirmarVentaItems({ idVenta, cuotas = [] }) {
  if (!idVenta) return false;

  console.info("[crudVentaItems] Confirmando venta", { idVenta });

  const { data: ventaActual, error: fetchError } = await supabase
    .from("ventas")
    .select("estado_registro")
    .eq("id", idVenta)
    .single();

  if (handleError(fetchError)) return false;

  if (Array.isArray(cuotas) && cuotas.length > 0) {
    const cuotasSincronizadas = await sincronizarCuotas({
      idVenta,
      cuotas,
    });

    if (!cuotasSincronizadas) {
      return false;
    }
  }

  const asegurado = await asegurarCuotaYPagos({ idVenta });

  if (!asegurado) return false;

  const alreadyUploaded = ventaActual?.estado_registro === "subido";

  if (alreadyUploaded) {
    return true;
  }

  const { error } = await supabase
    .from("ventas")
    .update({
      estado_registro: "subido",
    })
    .eq("id", idVenta);

  if (handleError(error)) return false;

  return true;
}

export const asegurarCuotaYPagos = async ({ idVenta }) => {
  if (!idVenta) return false;

  const { data: cuotaPrincipal, error: cuotasError } = await supabase
    .from("cuotas")
    .select("id")
    .eq("id_venta", idVenta)
    .eq("nro_cuota", 1)
    .maybeSingle();

  if (handleError(cuotasError, "asegurarCuotaYPagos")) {
    return false;
  }

  let cuotaId = cuotaPrincipal?.id ?? null;

  if (!cuotaId) {
    const { data: nuevaCuota, error: cuotaError } = await supabase
      .from("cuotas")
      .insert({
        id_venta: idVenta,
        nro_cuota: 1,
      })
      .select("id")
      .single();

    if (handleError(cuotaError, "asegurarCuotaYPagos.insertCuota")) return false;

    cuotaId = nuevaCuota?.id ?? null;
  }

  if (!cuotaId) return false;

  const { data: evidencias, error: evidenciasError } = await supabase
    .from("evidencias")
    .select("id")
    .eq("id_venta", idVenta);

  if (handleError(evidenciasError, "asegurarCuotaYPagos.obtenerEvidencias")) {
    return false;
  }

  if (!Array.isArray(evidencias) || evidencias.length === 0) {
    return true;
  }

  const evidenciaIds = evidencias.map((ev) => ev?.id).filter(Boolean);

  const { data: pagosActuales, error: pagosError } = await supabase
    .from("pagos")
    .select("id, id_evidencia")
    .eq("id_cuota", cuotaId);

  if (handleError(pagosError, "asegurarCuotaYPagos.obtenerPagos")) {
    return false;
  }

  const pagosExistentes = new Set(
    (pagosActuales ?? [])
      .map((pago) => pago?.id_evidencia)
      .filter((idEvidencia) => idEvidencia !== null && idEvidencia !== undefined)
  );

  const evidenciasDisponibles = evidenciaIds.filter(
    (idEvidencia) => idEvidencia && !pagosExistentes.has(idEvidencia)
  );

  const pagosSinEvidencia = (pagosActuales ?? []).filter(
    (pago) => !pago?.id_evidencia
  );

  const pagosParaActualizar = pagosSinEvidencia
    .slice(0, evidenciasDisponibles.length)
    .map((pago, idx) => ({
      id: pago.id,
      id_evidencia: evidenciasDisponibles[idx],
    }));

  const evidenciasRestantes = evidenciasDisponibles.slice(pagosParaActualizar.length);

  if (pagosParaActualizar.length > 0) {
    const { error: updatePagosError } = await supabase
      .from("pagos")
      .upsert(pagosParaActualizar);

    if (handleError(updatePagosError, "asegurarCuotaYPagos.updatePagos")) {
      return false;
    }
  }

  const pagosPorInsertar = evidenciasRestantes.map((idEvidencia) => ({
    id_cuota: cuotaId,
    id_evidencia: idEvidencia,
    monto: 0,
  }));

  if (pagosPorInsertar.length > 0) {
    const { error: insertPagosError } = await supabase
      .from("pagos")
      .insert(pagosPorInsertar);

    if (handleError(insertPagosError, "asegurarCuotaYPagos.insertPagos")) {
      return false;
    }
  }

  return true;
};