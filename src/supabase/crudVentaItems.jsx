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

export async function obtenerContenidosPorNivel({ idNivel, idSubnivel }) {
  if (!idNivel || !idSubnivel) return { contenidos: [], packs: [] };

  const [{ data: contenidos, error: contenidoError }, { data: packs, error: packError }] =
    await Promise.all([
      supabase
        .from("contenidobase")
        .select(
          `id, nombre, espaquete, id_curso, id_subnivel,
          cursos(id, nombre, id_nivel),
          subniveles(id, nombre, id_nivel)`
        )
        .eq("id_subnivel", idSubnivel)
        .order("nombre", { ascending: true }),
      supabase
        .from("pack")
        .select("id, nombre, id_nivel, descripcion")
        .eq("id_nivel", idNivel)
        .order("nombre", { ascending: true }),
    ]);

  if (handleError(contenidoError) || handleError(packError)) {
    return { contenidos: [], packs: [] };
  }

  return { contenidos: contenidos ?? [], packs: packs ?? [] };
}

export async function obtenerMaterialesParaVenta({
  editorialId,
  nivelId,
  subnivelId,
  contenidoSeleccionado,
}) {
  if (!editorialId) return [];

  const { data, error } = await supabase
    .from("materiales_editorial")
    .select(
      `id, nombre, precio, anio, id_mes, id_tipocontenido, id_contenidobase, id_pack,
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
    .order("anio", { ascending: false })
    .order("id_mes", { ascending: false })
    .order("id_tipocontenido", { ascending: true });

  if (handleError(error)) return [];

  const isPackSelection = contenidoSeleccionado?.tipo === "pack";
  const contenidoId = contenidoSeleccionado?.id ? Number(contenidoSeleccionado.id) : null;

  return (data ?? []).filter((material) => {
    const materialNivel = material?.contenidobase?.subniveles?.id_nivel ?? material?.pack?.id_nivel;
    const materialSubnivel = material?.contenidobase?.id_subnivel ?? null;

    if (nivelId && materialNivel && Number(materialNivel) !== Number(nivelId)) return false;
    if (!isPackSelection && subnivelId && materialSubnivel && Number(materialSubnivel) !== Number(subnivelId)) {
      return false;
    }

    if (isPackSelection) {
      return contenidoId ? Number(material?.id_pack) === contenidoId : Boolean(material?.id_pack);
    }

    return contenidoId
      ? Number(material?.id_contenidobase) === contenidoId
      : Boolean(material?.id_contenidobase);
  });
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