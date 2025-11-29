import { useMemo } from "react";
import styled from "styled-components";
import { Overlay, ModalContainer } from "../formularios/RegistroVentaModalLayout";
import { v } from "../../../styles/variables";

export const obtenerPartesFecha = (valor) => {
  if (!valor) {
    return { fecha: "--/--/--", hora: "--:--" };
  }

  if (typeof valor === "string") {
    const [fechaParte, tiempoParte] = valor.trim().split(/\s+/);
    if (fechaParte && fechaParte.includes("/")) {
      return {
        fecha: fechaParte,
        hora: tiempoParte ? tiempoParte.slice(0, 5) : "--:--",
      };
    }

    const parsed = new Date(valor);
    if (!Number.isNaN(parsed.getTime())) {
      const dia = String(parsed.getDate()).padStart(2, "0");
      const mes = String(parsed.getMonth() + 1).padStart(2, "0");
      const anio = String(parsed.getFullYear()).slice(-2);
      const horas = String(parsed.getHours()).padStart(2, "0");
      const minutos = String(parsed.getMinutes()).padStart(2, "0");
      return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
    }
  }

  const parsed = new Date(valor);
  if (!Number.isNaN(parsed.getTime())) {
    const dia = String(parsed.getDate()).padStart(2, "0");
    const mes = String(parsed.getMonth() + 1).padStart(2, "0");
    const anio = String(parsed.getFullYear()).slice(-2);
    const horas = String(parsed.getHours()).padStart(2, "0");
    const minutos = String(parsed.getMinutes()).padStart(2, "0");
    return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
  }

  return { fecha: "--/--/--", hora: "--:--" };
};

export const mostrarConGuion = (valor) => {
  if (valor === null || valor === undefined || valor === "" || valor.trim() === "") {
    return "-";
  }
  return valor;
};

export function DetalleVenta({ open, onClose, detalle, loading, error, ventaBase }) {
  const resumenVenta = useMemo(() => {
    if (!detalle && !ventaBase) return [];

    const venta = detalle ?? {};
    const base = ventaBase ?? {};

    const statusLabel =
      venta?.estado_registro ?? base?.estado_registro ?? "Sin estado";

    return [
      {
        label: "Fecha de venta",
        value: obtenerPartesFecha(venta?.fecha_venta ?? base?.fecha_str).fecha,
      },
      { label: "Estado", value: statusLabel },
      { label: "Vendedor", value: venta?.nombre_vendedor ?? base?.usuario },
      { label: "Editorial", value: venta?.nombre_editorial ?? base?.editorial },
    ];
  }, [detalle, ventaBase]);

  const montosVenta = useMemo(() => {
    const venta = detalle ?? {};
    return [
      { label: "Total bruto", value: venta?.total_bruto },
      { label: "Descuento", value: venta?.total_descuento },
      { label: "Total neto", value: venta?.total_neto },
    ];
  }, [detalle]);

  const docenteData = detalle ?? {};

  const items = Array.isArray(detalle?.items) ? detalle.items : [];
  const descuentos = Array.isArray(detalle?.descuentos)
    ? detalle.descuentos
    : [];
  const cuotas = Array.isArray(detalle?.cuotas) ? detalle.cuotas : [];
  const ajustes = Array.isArray(detalle?.ajustes) ? detalle.ajustes : [];
  const incidentes = Array.isArray(detalle?.incidentes)
    ? detalle.incidentes
    : [];

  const supervisionActual = detalle?.supervision_actual ?? null;
  const contabilidadActual = detalle?.contabilidad_actual ?? null;
  const entregasActual = detalle?.entregas_actual ?? null;

  return (
    <Overlay $visible={open}>
      <Modal>
        <ModalHeader>
          <div>
            <h2>Detalles de venta</h2>
            <p>Visualiza la venta y sus hitos más relevantes.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar detalles">
            ✕
          </button>
        </ModalHeader>

        <ModalContent>
          {loading && (
            <LoadingState>
              <div className="spinner" />
              <span>Cargando información...</span>
            </LoadingState>
          )}

          {!loading && error && <EmptyState>{error}</EmptyState>}

          {!loading && !error && detalle && (
            <ScrollArea>
              <Section>
                <SectionTitle>Resumen</SectionTitle>
                <InfoGrid>
                  {resumenVenta.map((item) => (
                    <InfoCard key={item.label}>
                      <small>{item.label}</small>
                      <strong>{mostrarConGuion(item.value)}</strong>
                    </InfoCard>
                  ))}
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>Montos</SectionTitle>
                <InfoGrid>
                  {montosVenta.map((item) => (
                    <InfoCard key={item.label}>
                      <small>{item.label}</small>
                      <strong>{mostrarConGuion(item.value)}</strong>
                    </InfoCard>
                  ))}
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>Docente</SectionTitle>
                <InfoGrid $cols={2}>
                  <InfoCard>
                    <small>Docente</small>
                    <strong>{mostrarConGuion(docenteData?.docente_nombre_completo)}</strong>
                    <Muted>{mostrarConGuion(docenteData?.docente_nro_doc)}</Muted>
                  </InfoCard>
                  <InfoCard>
                    <small>Contacto</small>
                    <strong>{mostrarConGuion(docenteData?.docente_telefono)}</strong>
                    <Muted>{mostrarConGuion(docenteData?.docente_tipo_ingreso)}</Muted>
                  </InfoCard>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>Items vendidos</SectionTitle>
                {items.length === 0 ? (
                  <EmptyState>No hay items registrados.</EmptyState>
                ) : (
                  <ItemsList>
                    {items.map((item, index) => (
                      <ItemRow key={`${item.nombre_material}-${index}`}>
                        <div className="item-main">
                          <span className="pill">{mostrarConGuion(item.tipo_contenido)}</span>
                          <div className="item-texts">
                            <strong>{mostrarConGuion(item.nombre_material)}</strong>
                            <ItemMeta>
                              {[item.nivel, item.subnivel, item.curso, item.mes]
                                .filter(Boolean)
                                .join(" • ") || "Sin detalle"}
                            </ItemMeta>
                          </div>
                        </div>
                        <div className="item-values">
                          <ValueRow>
                            <Muted>Cantidad</Muted>
                            <strong>{item.cantidad ?? "-"}</strong>
                          </ValueRow>
                          <ValueRow>
                            <Muted>Precio unitario</Muted>
                            <strong>{mostrarConGuion(item.precio_unitario)}</strong>
                          </ValueRow>
                          <ValueRow>
                            <Muted>Subtotal</Muted>
                            <strong>{mostrarConGuion(item.subtotal)}</strong>
                          </ValueRow>
                        </div>
                      </ItemRow>
                    ))}
                  </ItemsList>
                )}
              </Section>

              <Section>
                <SectionTitle>Descuentos aplicados</SectionTitle>
                {descuentos.length === 0 ? (
                  <EmptyState>Sin descuentos aplicados.</EmptyState>
                ) : (
                  <Timeline>
                    {descuentos.map((dcto, index) => (
                      <TimelineItem key={`${dcto.codigo}-${index}`}>
                        <div className="dot" />
                        <div className="content">
                          <div className="title">
                            <strong>{mostrarConGuion(dcto.nombre)}</strong>
                            <span className="pill">{mostrarConGuion(dcto.codigo)}</span>
                          </div>
                          <Muted>{mostrarConGuion(dcto.fecha_aplicado)}</Muted>
                          <div className="detail-row">
                            <span>Aplicado por {mostrarConGuion(dcto.aplicado_por)}</span>
                            <strong>{mostrarConGuion(dcto.monto_descuento)}</strong>
                          </div>
                        </div>
                      </TimelineItem>
                    ))}
                  </Timeline>
                )}
              </Section>

              <Section>
                <SectionTitle>Cuotas y pagos</SectionTitle>
                {cuotas.length === 0 ? (
                  <EmptyState>Esta venta no tiene cuotas configuradas.</EmptyState>
                ) : (
                  <CardsGrid>
                    {cuotas.map((cuota, index) => (
                      <CuotaCard key={`cuota-${index}`}>
                        <div className="cuota-head">
                          <div>
                            <small>Cuota</small>
                            <strong>#{cuota.nro_cuota}</strong>
                          </div>
                          <div>
                            <small>Estado</small>
                            <span className="pill">{mostrarConGuion(cuota.estado)}</span>
                          </div>
                        </div>
                        <div className="cuota-body">
                          <div>
                            <small>Vencimiento</small>
                            <strong>{mostrarConGuion(cuota.fecha_vencimiento)}</strong>
                          </div>
                          <div>
                            <small>Programado</small>
                            <strong>{mostrarConGuion(cuota.monto_programado)}</strong>
                          </div>
                          <div>
                            <small>Saldo</small>
                            <strong>{mostrarConGuion(cuota.saldo)}</strong>
                          </div>
                        </div>
                        <div className="pagos">
                          <small>Pagos</small>
                          {Array.isArray(cuota.pagos) && cuota.pagos.length > 0 ? (
                            <div className="pagos-list">
                              {cuota.pagos.map((pago, pagoIdx) => (
                                <div className="pago" key={`pago-${pagoIdx}`}>
                                  <div className="pago-head">
                                    <Muted>{mostrarConGuion(pago.fecha_pago)}</Muted>
                                    <strong>{mostrarConGuion(pago.monto)}</strong>
                                  </div>
                                  <Muted>
                                    {[pago.cuenta_entidad, pago.cuenta_medio, pago.cuenta_etiqueta]
                                      .filter(Boolean)
                                      .join(" • ") || "-"}
                                  </Muted>
                                  {Array.isArray(pago.evidencias) && pago.evidencias.length > 0 && (
                                    <PagoEvidencias>
                                      {pago.evidencias.map((ev, evIdx) => {
                                        const label = mostrarConGuion(
                                          ev.nombre || ev.archivo || ev.notas || `Voucher ${evIdx + 1}`
                                        );
                                        const url = ev.archivo || ev.url || null;
                                        const isImage =
                                          typeof url === "string" && url.match(/\.(png|jpe?g|gif|webp)$/i);

                                        return (
                                          <EvidenceThumb
                                            key={`pago-${pagoIdx}-ev-${evIdx}`}
                                            as={url ? "a" : "div"}
                                            href={url || undefined}
                                            target={url ? "_blank" : undefined}
                                            rel={url ? "noreferrer" : undefined}
                                          >
                                            {isImage && url ? (
                                              <img src={url} alt={label} />
                                            ) : (
                                              <div className="evidence-placeholder" aria-hidden>
                                                📎
                                              </div>
                                            )}
                                            <span className="evidence-label">{label}</span>
                                            {ev.notas && <small>{mostrarConGuion(ev.notas)}</small>}
                                          </EvidenceThumb>
                                        );
                                      })}
                                    </PagoEvidencias>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Muted>Sin pagos registrados.</Muted>
                          )}
                        </div>
                      </CuotaCard>
                    ))}
                  </CardsGrid>
                )}
              </Section>

              <Section>
                <SectionTitle>Seguimiento</SectionTitle>
                <InfoGrid>
                  <InfoCard>
                    <small>Supervisión</small>
                    <strong>{mostrarConGuion(supervisionActual?.estado)}</strong>
                    <Muted>{mostrarConGuion(supervisionActual?.usuario)}</Muted>
                  </InfoCard>
                  <InfoCard>
                    <small>Contabilidad</small>
                    <strong>{mostrarConGuion(contabilidadActual?.estado)}</strong>
                    <Muted>{mostrarConGuion(contabilidadActual?.usuario)}</Muted>
                  </InfoCard>
                  <InfoCard>
                    <small>Entregas</small>
                    <strong>{mostrarConGuion(entregasActual?.estado)}</strong>
                    <Muted>{mostrarConGuion(entregasActual?.usuario)}</Muted>
                  </InfoCard>
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>Ajustes e incidentes</SectionTitle>
                <TwoColumn>
                  <StackedList>
                    <small>Ajustes</small>
                    {ajustes.length === 0 ? (
                      <Muted>Sin ajustes registrados.</Muted>
                    ) : (
                      ajustes.map((ajuste, index) => (
                        <ListRow key={`ajuste-${index}`}>
                          <div>
                            <strong>{mostrarConGuion(ajuste.concepto)}</strong>
                            <Muted>{mostrarConGuion(ajuste.tipo)}</Muted>
                            <Muted>{mostrarConGuion(ajuste.usuario)}</Muted>
                          </div>
                          <strong>{mostrarConGuion(ajuste.monto)}</strong>
                        </ListRow>
                      ))
                    )}
                  </StackedList>
                  <StackedList>
                    <small>Incidentes</small>
                    {incidentes.length === 0 ? (
                      <Muted>Sin incidentes.</Muted>
                    ) : (
                      incidentes.map((inc, index) => (
                        <ListRow key={`incidente-${index}`}>
                          <div>
                            <strong>{mostrarConGuion(inc.descripcion)}</strong>
                            <Muted>{[inc.area, inc.severidad, inc.estado].filter(Boolean).join(" • ")}</Muted>
                            <Muted>{[inc.usuario_reporta, inc.usuario_recibe].filter(Boolean).join(" → ")}</Muted>
                          </div>
                          <Muted>{mostrarConGuion(inc.fecha_reporte)}</Muted>
                        </ListRow>
                      ))
                    )}
                  </StackedList>
                </TwoColumn>
              </Section>
            </ScrollArea>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
}

const Modal = styled(ModalContainer)`
  width: min(1100px, 88vw);
  max-width: 1100px;
  height: min(900px, calc(100vh - 80px));
  max-height: min(900px, calc(100vh - 80px));
  padding: 26px 28px 30px;
  gap: 18px;
  background: ${({ theme }) => theme.bgtotal};
`;

const ModalContent = styled.div`
  flex: 1;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  border-radius: 20px;
  background: linear-gradient(
      180deg,
      rgba(${({ theme }) => theme.textRgba}, 0.04),
      rgba(${({ theme }) => theme.textRgba}, 0.02)
    ),
    ${({ theme }) => theme.bgtotal};
  padding: 16px;
  overflow: hidden;
`;

const ModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  p {
    margin: 0;
    font-size: 0.9rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.65);
  }

  h2 {
    margin: 6px 0 0;
    font-size: 1.4rem;
  }

  button {
    border: none;
    background: rgba(${({ theme }) => theme.textRgba}, 0.08);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.text};
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ScrollArea = styled.div`
  height: 100%;
  overflow: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(${({ theme }) => theme.textRgba}, 0.35);
    border-radius: 999px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.text};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols || 4}, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: ${v.bpbart}) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: ${v.bpbart}) and (max-width: ${v.bpmarge}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const InfoCard = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.65);
    font-weight: 600;
  }

  strong {
    color: ${({ theme }) => theme.text};
    font-size: 1.05rem;
  }
`;

const Muted = styled.span`
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  font-size: 0.9rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemRow = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.bgtotal};
  box-shadow: 0 8px 28px rgba(${({ theme }) => theme.textRgba}, 0.04);
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: ${v.bpbart}) {
    grid-template-columns: 1.2fr 1fr;
    align-items: center;
  }

  .item-main {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .item-texts {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      color: ${({ theme }) => theme.text};
    }
  }

  .item-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 6px 12px;
  }
`;

const ItemMeta = styled(Muted)`
  display: block;
`;

const ValueRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.12);

  &:last-child {
    border-bottom: none;
  }

  strong {
    font-size: 1rem;
  }
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(${({ theme }) => theme.textRgba}, 0.35);
    margin-top: 8px;
  }

  .content {
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
    border-radius: 14px;
    padding: 10px 12px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.03);
    display: flex;
    flex-direction: column;
    gap: 6px;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: space-between;
    }

    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
  }
`;

const CuotaCard = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .cuota-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cuota-body {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .pagos {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .pagos-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pago {
      border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
      border-radius: 12px;
      padding: 8px 10px;
      background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    }

    .pago-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
  }
`;

const PagoEvidencias = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 6px;
`;

const EvidenceThumb = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.05);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  color: ${({ theme }) => theme.text};
  text-decoration: none;

  img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
    background: ${({ theme }) => theme.bgtotal};
  }

  .evidence-placeholder {
    width: 100%;
    height: 110px;
    border-radius: 10px;
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.15);
    display: grid;
    place-items: center;
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
    background: ${({ theme }) => theme.bgtotal};
    font-size: 1.2rem;
  }

  .evidence-label {
    font-weight: 700;
  }

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.75);
  }
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
`;

const StackedList = styled.div`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  display: flex;
  flex-direction: column;
  gap: 8px;

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
    font-weight: 700;
  }
`;

const ListRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

const LoadingState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${({ theme }) => theme.text};

  .spinner {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid rgba(${({ theme }) => theme.textRgba}, 0.25);
    border-top-color: rgba(${({ theme }) => theme.textRgba}, 0.8);
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  padding: 18px;
  text-align: center;
  border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.25);
  border-radius: 14px;
  color: rgba(${({ theme }) => theme.textRgba}, 0.75);
`;