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

  const { data, error } = await supabase.rpc("fn_get_venta_detalle", {
    _id_venta: ventaId,
  });

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
