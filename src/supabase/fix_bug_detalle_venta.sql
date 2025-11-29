-- FIX PARA EL BUG DE DETALLE DE VENTA
-- El problema original era que la vista 'vw_venta_detalle' no exponía el ID de la venta,
-- y la función 'fn_get_venta_detalle' intentaba unir la vista con la tabla ventas sin una condición de unión válida entre ellas.

-- NOTA: Se usa CREATE OR REPLACE VIEW. En PostgreSQL, si la vista ya existe, solo se pueden agregar columnas AL FINAL.
-- Por eso agregamos 'id_venta' al final de la lista de selección.

create or replace view public.vw_venta_detalle as
select
  -- ===========================
  -- CABECERA VENTA
  -- ===========================
  v.created_at               as fecha_creacion,
  v.fecha_venta              as fecha_venta,
  v.updated_at               as fecha_ultima_actualizacion,
  v.estado_registro,

  -- Montos ya concatenados con código de moneda, ej: "360 PEN"
  (v.total_bruto::text || ' ' || tm.codigo)      as total_bruto,
  (v.total_descuento::text || ' ' || tm.codigo)  as total_descuento,
  (v.total_neto::text || ' ' || tm.codigo)       as total_neto,

  tm.codigo                   as tipomoneda_codigo,

  v.observaciones,

  -- ===========================
  -- VENDEDOR (solo lo relevante)
  -- ===========================
  u.nombres                  as nombre_vendedor,

  -- ===========================
  -- EDITORIAL (solo nombre)
  -- ===========================
  e.nombre                   as nombre_editorial,

  -- ===========================
  -- DOCENTE / INSTITUCIÓN / UBICACIÓN
  -- ===========================
  (d.nombres || ' ' || d.apellido_p || ' ' || d.apellido_m) as docente_nombre_completo,
  d.nro_doc                  as docente_nro_doc,
  d.telefono                 as docente_telefono,
  d.tipo_ingreso             as docente_tipo_ingreso,

  i.nombre                   as nombre_institucion,
  i.cod_institucion,
  gn1.nombre                 as geo_nivel1_nombre,
  gn2.nombre                 as geo_nivel2_nombre,
  gn3.nombre                 as geo_nivel3_nombre,
  pins.nombre                as pais_institucion,

  -- ===========================
  -- ITEMS VENDIDOS (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'nombre_material',    me.nombre,
          'nivel',              n.nombre,
          'subnivel',           sn.nombre,
          'curso',              c.nombre,
          'mes',                ms.nombre,
          'tipo_contenido',     tc.nombre,
          'familia_contenido',  fc.nombre,
          'pack',               pk.nombre,
          'cantidad',           vi.cantidad,
          'precio_unitario',    (vi.precio_unitario::text || ' ' || tm.codigo),
          'subtotal',           (vi.subtotal::text        || ' ' || tm.codigo)
        )
        order by vi.id
      ),
      '[]'::jsonb
    )
    from venta_items vi
    join materiales_editorial me on me.id = vi.id_material_editorial
    left join contenidobase cb        on cb.id = me.id_contenidobase
    left join subniveles sn           on sn.id = cb.id_subnivel
    left join niveles n               on n.id = sn.id_nivel
    left join cursos c                on c.id = cb.id_curso
    left join meses ms                on ms.id = me.id_mes
    left join tipocontenidos tc       on tc.id = me.id_tipocontenido
    left join familiacontenidos fc    on fc.id = tc.id_familiacontenido
    left join pack pk                 on pk.id = me.id_pack
    where vi.id_venta = v.id
  ) as items,

  -- ===========================
  -- DESCUENTOS APLICADOS (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'codigo',              dsc.codigo,
          'nombre',              dsc.nombre,
          'monto_descuento',     (da.monto_descuento::text || ' ' || tm.codigo),
          'fecha_aplicado',      da.fecha_aplicado,
          'aplicado_por',        uact.nombres
        )
        order by da.fecha_aplicado
      ),
      '[]'::jsonb
    )
    from descuento_aplicaciones da
    join descuentos dsc      on dsc.id = da.id_descuento
    left join usuarios uact  on uact.id = da.actor_usuario
    where da.id_venta = v.id
  ) as descuentos,

  -- ===========================
  -- CUOTAS + PAGOS (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'nro_cuota',         c.nro_cuota,
          'fecha_vencimiento', c.fecha_vencimiento,
          'monto_programado',  (c.monto_programado::text || ' ' || tm.codigo),
          'estado',            c.estado,
          'saldo',             (c.saldo::text           || ' ' || tm.codigo),
          'pagos', (
            select coalesce(
              jsonb_agg(
                jsonb_build_object(
                  'fecha_pago',       p.fecha_pago,
                  'monto',            (p.monto::text || ' ' || tm.codigo),
                  'cuenta_entidad',   cc.entidad,
                  'cuenta_medio',     cc.medio,
                  'cuenta_etiqueta',  cc.etiqueta,
                  'archivo_voucher',  ev.archivo
                )
                order by p.fecha_pago
              ),
              '[]'::jsonb
            )
            from pagos p
            left join cuentas_cobro cc on cc.id = p.id_cuenta
            left join evidencias ev   on ev.id = p.id_evidencia
            where p.id_cuota = c.id
          )
        )
        order by c.nro_cuota
      ),
      '[]'::jsonb
    )
    from cuotas c
    where c.id_venta = v.id
  ) as cuotas,

  -- ===========================
  -- EVIDENCIAS GENERALES (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'area',            ev.area,
          'tipo',            ev.tipo,
          'archivo',         ev.archivo,
          'notas',           ev.notas,
          'usuario_nombre',  uev.nombres,
          'fecha',           ev.fecha
        )
        order by ev.fecha
      ),
      '[]'::jsonb
    )
    from evidencias ev
    left join usuarios uev on uev.id = ev.id_usuario
    where ev.id_venta = v.id
  ) as evidencias,

  -- ===========================
  -- ESTADO ACTUAL SUPERVISIÓN
  -- ===========================
  (
    select to_jsonb(s)
    from (
      select
        vs.estado,
        vs.comentario,
        vs.created_at  as fecha_creacion,
        vs.updated_at  as fecha_ultima_modificacion,
        uvs.nombres    as usuario
      from venta_supervision vs
      left join usuarios uvs on uvs.id = vs.actor_usuario
      where vs.id_venta = v.id
      order by vs.created_at desc
      limit 1
    ) s
  ) as supervision_actual,

  -- ===========================
  -- ESTADO ACTUAL CONTABILIDAD
  -- ===========================
  (
    select to_jsonb(s)
    from (
      select
        vc.estado,
        vc.comentario,
        vc.created_at  as fecha_creacion,
        vc.updated_at  as fecha_ultima_modificacion,
        uvc.nombres    as usuario
      from venta_contabilidad vc
      left join usuarios uvc on uvc.id = vc.actor_usuario
      where vc.id_venta = v.id
      order by vc.created_at desc
      limit 1
    ) s
  ) as contabilidad_actual,

  -- ===========================
  -- ESTADO ACTUAL ENTREGAS
  -- ===========================
  (
    select to_jsonb(s)
    from (
      select
        ve.estado,
        ve.comentario,
        ve.created_at  as fecha_creacion,
        ve.updated_at  as fecha_ultima_modificacion,
        uve.nombres    as usuario
      from venta_entregas ve
      left join usuarios uve on uve.id = ve.actor_usuario
      where ve.id_venta = v.id
      order by ve.created_at desc
      limit 1
    ) s
  ) as entregas_actual,

  -- ===========================
  -- HISTORIAL DE EVENTOS (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'area',               vev.area,
          'evento',             vev.evento,
          'detalle',            vev.detalle,
          'estado_supervision', vev.estado_supervision,
          'estado_contabilidad',vev.estado_contabilidad,
          'estado_entregas',    vev.estado_entregas,
          'usuario',            uev2.nombres,
          'fecha',              vev.fecha
        )
        order by vev.fecha
      ),
      '[]'::jsonb
    )
    from venta_eventos vev
    left join usuarios uev2 on uev2.id = vev.actor_usuario
    where vev.id_venta = v.id
  ) as eventos,

  -- ===========================
  -- AJUSTES (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'tipo',          va.tipo,
          'concepto',      va.concepto,
          'monto',         (va.monto::text || ' ' || tm.codigo),
          'usuario',       uaj.nombres,
          'creado_en',     va.creado_en
        )
        order by va.creado_en
      ),
      '[]'::jsonb
    )
    from venta_ajustes va
    left join usuarios uaj on uaj.id = va.actor_usuario
    where va.id_venta = v.id
  ) as ajustes,

  -- ===========================
  -- INCIDENTES (ARRAY JSONB)
  -- ===========================
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'area',                  inc.area,
          'severidad',             inc.severidad,
          'estado',                inc.estado,
          'descripcion',           inc.descripcion,
          'usuario_reporta',       ur.nombres,
          'usuario_recibe',        urc.nombres,
          'fecha_reporte',         inc.fecha_reporte,
          'fecha_actualiza',       inc.fecha_actualiza
        )
        order by inc.fecha_reporte
      ),
      '[]'::jsonb
    )
    from incidentes inc
    left join usuarios ur  on ur.id  = inc.usuario_reporta
    left join usuarios urc on urc.id = inc.usuario_recibe
    where inc.id_venta = v.id
  ) as incidentes,

  v.id as id_venta -- <--- AGREGADO AL FINAL PARA COMPATIBILIDAD CON CREATE OR REPLACE VIEW

from ventas v
left join usuarios    u    on u.id    = v.id_usuario
left join editoriales e    on e.id    = v.id_editorial
left join tipomoneda  tm   on tm.id   = v.id_tipomoneda
left join docentes    d    on d.id    = v.id_docente
left join instituciones i  on i.id    = d.id_institucion
left join geo_nivel1  gn1  on gn1.id  = i.id_geo_nivel1
left join geo_nivel2  gn2  on gn2.id  = i.id_geo_nivel2
left join geo_nivel3  gn3  on gn3.id  = i.id_geo_nivel3
left join paises      pins on pins.id = i.id_pais;


-- 2. Actualizamos la función para filtrar correctamente usando el ID de la venta en la vista
create or replace function public.fn_get_venta_detalle(
  _id_venta bigint
)
returns jsonb
language sql
as $$
  select to_jsonb(vw)
  from public.vw_venta_detalle vw
  where vw.id_venta = _id_venta;
$$;
