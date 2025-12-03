import Swal from "sweetalert2";
import { supabase } from "../index";
const STORAGE_BUCKET_IMAGENES = "imagenes";
const STORAGE_FOLDER_VOUCHERS = "vouchers_recibidos";
const TABLA_EVIDENCIAS = "evidencias";
const TABLA_VENTAS = "ventas";
const TABLA_DOCENTES = "docentes";
const TABLA_INSTITUCIONES = "instituciones";
const TABLA_CUOTAS = "cuotas";

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

    const ventas = data ?? [];

    const ventasIds = Array.from(
        new Set(
            ventas
                .map((venta) => {
                    const ventaId = Number(
                        venta?.id_venta ?? venta?.id ?? venta?.venta_id ?? null
                    );
                    return Number.isFinite(ventaId) ? ventaId : null;
                })
                .filter(Boolean)
        )
    );

    let contabilidadCuota1Map = new Map();

    if (ventasIds.length > 0) {
        const { data: cuotasData, error: cuotasError } = await supabase
            .from(TABLA_CUOTAS)
            .select("id_venta, estado_contabilidad")
            .in("id_venta", ventasIds)
            .eq("nro_cuota", 1);

        if (cuotasError) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: cuotasError.message,
            });
        } else {
            contabilidadCuota1Map = new Map(
                (cuotasData ?? [])
                    .map(({ id_venta, estado_contabilidad }) => {
                        const ventaId = Number(id_venta);
                        return Number.isFinite(ventaId)
                            ? [ventaId, estado_contabilidad]
                            : null;
                    })
                    .filter(Boolean)
            );
        }
    }

    return ventas.map((venta) => {
        const ventaId = Number(venta?.id_venta ?? venta?.id ?? venta?.venta_id);
        const contabilidadEstado =
            (Number.isFinite(ventaId) && contabilidadCuota1Map.get(ventaId)) ||
            venta?.contabilidad_cuota1_estado ||
            venta?.estado_contabilidad;

        return {
            ...venta,
            contabilidad_cuota1_estado: contabilidadEstado,
        };
    });
}

export async function eliminarBorrador(p) {
    const ventaId = p?._id_venta ?? null;

    if (!ventaId) {
        return false;
    }

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
    
    const { data: venta, error: ventaError } = await supabase
        .from(TABLA_VENTAS)
        .select("id_docente")
        .eq("id", ventaId)
        .maybeSingle();

    if (ventaError) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: ventaError.message,
        });
        return false;
    }

    let institucionId = null;

    if (venta?.id_docente) {
        const { data: docenteData, error: docenteError } = await supabase
            .from(TABLA_DOCENTES)
            .select("id_institucion")
            .eq("id", venta.id_docente)
            .maybeSingle();

        if (docenteError) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: docenteError.message,
            });
            return false;
        }

        institucionId = docenteData?.id_institucion ?? null;
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

    if (venta?.id_docente) {
        const { error: docenteError } = await supabase
            .from(TABLA_DOCENTES)
            .delete()
            .eq("id", venta.id_docente);

        if (docenteError) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: docenteError.message,
            });
            return false;
        }

        if (institucionId) {
            const { error: institucionError } = await supabase
                .from(TABLA_INSTITUCIONES)
                .delete()
                .eq("id", institucionId);

            if (institucionError) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: institucionError.message,
                });
                return false;
            }
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

export async function obtenerVentaDetalle(p = {}) {
  const ventaId = p?._id_venta ?? null;

  if (!ventaId) {
    return null;
  }

  const [ventaResponse, itemsResponse, cuotasResponse, evidenciasResponse] =
    await Promise.all([
      supabase
        .from(TABLA_VENTAS)
        .select(
          `id, fecha_venta, total_bruto, total_descuento, total_neto, observaciones, estado_registro, id_editorial, id_usuario,
          editoriales(nombre),
          usuarios(nombres),
          docentes(apellido_p, apellido_m, nombres),
          venta_supervision:venta_supervision(estado, comentario, updated_at),
          venta_contabilidad:venta_contabilidad(estado, comentario, updated_at),
          venta_entregas:venta_entregas(estado, comentario, updated_at)
        `
        )
        .eq("id", ventaId)
        .maybeSingle(),
      supabase
        .from("venta_items")
        .select(
          `id, cantidad, precio_unitario, subtotal,
          material:materiales_editorial(
            id, nombre, precio,
            tipocontenidos:tipocontenidos(nombre)
          )`
        )
        .eq("id_venta", ventaId),
      supabase
        .from(TABLA_CUOTAS)
        .select(
          `id, nro_cuota, fecha_vencimiento, monto_programado, saldo,
          pagos(id, monto, fecha_pago, id_evidencia)`
        )
        .eq("id_venta", ventaId)
        .order("nro_cuota", { ascending: true }),
      supabase
        .from(TABLA_EVIDENCIAS)
        .select("id, archivo, notas, id_venta")
        .eq("id_venta", ventaId),
    ]);

  const errorActual =
    ventaResponse.error ||
    itemsResponse.error ||
    cuotasResponse.error ||
    evidenciasResponse.error;

  if (errorActual) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: errorActual.message,
    });
    return null;
  }

  const ventaData = ventaResponse.data ?? {};
  const itemsData = itemsResponse.data ?? [];
  const cuotasData = cuotasResponse.data ?? [];
  const evidenciasData = evidenciasResponse.data ?? [];

  const evidenciaMap = new Map(
    evidenciasData.map((ev) => [ev?.id, { ...ev, id_pago: ev?.id_pago ?? null }])
  );

  const cuotas = cuotasData.map((cuota) => {
    const pagos = (cuota?.pagos ?? []).map((pago) => ({
      id: pago?.id,
      monto: Number(pago?.monto ?? 0) || 0,
      fecha_pago: pago?.fecha_pago ?? null,
      id_evidencia: pago?.id_evidencia ?? null,
      id_cuota: cuota?.id ?? null,
    }));

    const evidenciasCuota = pagos
      .map((pago) => {
        if (!pago?.id_evidencia) return null;
        const evidencia = evidenciaMap.get(pago.id_evidencia);
        return evidencia ? { ...evidencia, id_pago: pago.id } : null;
      })
      .filter(Boolean);

    return {
      id: cuota?.id ?? null,
      nro_cuota: cuota?.nro_cuota ?? null,
      fecha_vencimiento: cuota?.fecha_vencimiento ?? null,
      monto_programado: cuota?.monto_programado ?? null,
      saldo: cuota?.saldo ?? null,
      pagos,
      evidencias: evidenciasCuota,
    };
  });

  const pagosPlanos = cuotas.flatMap((cuota) =>
    (cuota?.pagos ?? []).map((pago) => ({
      ...pago,
      nro_cuota: cuota?.nro_cuota ?? null,
    }))
  );

  const evidenciasPlanas =
    cuotas.length > 0
      ? cuotas.flatMap((cuota) => cuota?.evidencias ?? [])
      : evidenciasData;

  const items = itemsData.map((item) => ({
    id: item?.id ?? null,
    nombre_material: item?.material?.nombre ?? "-",
    cantidad: item?.cantidad ?? 0,
    precio_unitario: item?.precio_unitario ?? item?.material?.precio ?? 0,
    subtotal: item?.subtotal ?? 0,
    tipo_contenido: item?.material?.tipocontenidos?.nombre ?? "-",
  }));

  const nombreDocente = [
    ventaData?.docentes?.nombres,
    ventaData?.docentes?.apellido_p,
    ventaData?.docentes?.apellido_m,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ...ventaData,
    nombre_vendedor: ventaData?.usuarios?.nombres ?? null,
    nombre_editorial: ventaData?.editoriales?.nombre ?? null,
    nombre_docente: nombreDocente || null,
    items,
    cuotas,
    pagos: pagosPlanos,
    evidencias: evidenciasPlanas,
    descuentos: [],
    ajustes: [],
    incidentes: [],
    supervision_actual: ventaData?.venta_supervision?.[0] ?? null,
    contabilidad_actual: ventaData?.venta_contabilidad?.[0] ?? null,
    entregas_actual: ventaData?.venta_entregas?.[0] ?? null,
  };
}

export async function obtenerVentaBorradorPorId(p = {}) {
  const idVenta = p?._id_venta ?? null;
  if (!idVenta) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .select("id, id_editorial, total_neto, total_bruto, total_descuento")
    .eq("id", idVenta)
    .maybeSingle();

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

export async function confirmarVenta(p) {
    // p = { idVenta, cuotas: [{ nro_cuota, fecha_vencimiento, monto_programado }] }

    const idVenta = p?.idVenta ?? null;
    const cuotas = p?.cuotas ?? [];

    if (!idVenta) return false;

    // 1. Insert Cuotas
    if (cuotas.length > 0) {
        const cuotasPayload = cuotas.map(c => ({
            id_venta: idVenta,
            nro_cuota: c.nro_cuota,
            fecha_vencimiento: c.fecha_vencimiento,
            monto_programado: c.monto_programado,
            saldo: c.monto_programado, // Inicialmente saldo = monto
            estado: 'pendiente'
        }));

        // Delete existing cuotas first? (Usually borrador shouldn't have cuotas yet, but safer)
        await supabase.from(TABLA_CUOTAS).delete().eq('id_venta', idVenta);

        const { error: errorCuotas } = await supabase
            .from(TABLA_CUOTAS)
            .insert(cuotasPayload);

        if (errorCuotas) {
             Swal.fire({
                icon: "error",
                title: "Error al registrar cuotas",
                text: errorCuotas.message,
            });
            return false;
        }
    }

    // 2. Call RPC to confirm sale state
    const { error, data } = await supabase.rpc("fn_confirmar_venta", {
        _id_venta: idVenta
    });

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
