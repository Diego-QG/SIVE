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
    subtotal: item?.subtotal ?? null,
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

export async function confirmarVenta({ idVenta }) {
  if (!idVenta) return false;

  console.info("[crudVentaItems] Confirmando venta", { idVenta });

  const { error: ventaError } = await supabase
    .from("ventas")
    .update({
      estado_registro: "subido",
      fecha_venta: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", idVenta);

  if (handleError(ventaError, "confirmarVenta-update")) return false;

  const { data: ventaTotales, error: totalesError } = await supabase
    .from("ventas")
    .select("total_neto")
    .eq("id", idVenta)
    .maybeSingle();

  if (handleError(totalesError, "confirmarVenta-totales")) return false;

  const total = Number(ventaTotales?.total_neto ?? 0) || 0;

  console.debug("[crudVentaItems] Total neto confirmado para venta", {
    idVenta,
    total,
  });

  const { data: existingCuotas, error: cuotasError } = await supabase
    .from("cuotas")
    .select("id")
    .eq("id_venta", idVenta)
    .limit(1);

  if (handleError(cuotasError, "confirmarVenta-cuotas")) return false;

  if (!existingCuotas?.length) {
    console.info("[crudVentaItems] Insertando cuota inicial", { idVenta, total });

    const { error: insertError } = await supabase.from("cuotas").insert({
      id_venta: idVenta,
      nro_cuota: 1,
      monto_programado: total,
      saldo: total,
    });

    if (handleError(insertError, "confirmarVenta-insertCuota")) return false;
  }

  return true;
}