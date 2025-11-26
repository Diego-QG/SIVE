import Swal from "sweetalert2";
import { supabase } from "../index";

const handleError = (error) => {
  if (!error) return false;

  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: error.message,
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

  const { error } = await supabase.from("venta_items").delete().eq("id", id);

  if (handleError(error)) return false;

  return true;
}

export async function recalcularTotalesVenta({ idVenta }) {
  if (!idVenta) return 0;

  const { data, error } = await supabase
    .from("venta_items")
    .select("cantidad, precio_unitario, subtotal")
    .eq("id_venta", idVenta);

  if (handleError(error)) return 0;

  const total = (data ?? []).reduce((sum, item) => {
    const cantidad = Number(item?.cantidad ?? 1) || 1;
    const precio = Number(item?.precio_unitario ?? 0) || 0;
    const subtotal = item?.subtotal !== null && item?.subtotal !== undefined
      ? Number(item.subtotal) || 0
      : cantidad * precio;
    return sum + subtotal;
  }, 0);

  const { error: updateError } = await supabase
    .from("ventas")
    .update({
      total_bruto: total,
      total_neto: total,
      total_descuento: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idVenta);

  handleError(updateError);

  return total;
}

export async function confirmarVenta({ idVenta }) {
  if (!idVenta) return false;

  const total = await recalcularTotalesVenta({ idVenta });

  const { error: ventaError } = await supabase
    .from("ventas")
    .update({
      estado_registro: "subido",
      fecha_venta: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", idVenta);

  if (handleError(ventaError)) return false;

  const { data: existingCuotas, error: cuotasError } = await supabase
    .from("cuotas")
    .select("id")
    .eq("id_venta", idVenta)
    .limit(1);

  if (handleError(cuotasError)) return false;

  if (!existingCuotas?.length) {
    const { error: insertError } = await supabase.from("cuotas").insert({
      id_venta: idVenta,
      nro_cuota: 1,
      monto_programado: total,
      saldo: total,
    });

    if (handleError(insertError)) return false;
  }

  return true;
}