import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  Overlay,
  ModalContainer,
} from "../formularios/RegistroVentaModalLayout";
import { v } from "../../../styles/variables";
import {
  BsCalendarCheck,
  BsPerson,
  BsShop,
  BsBook,
  BsWallet2,
  BsTag,
} from "react-icons/bs";

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
  if (valor === null || valor === undefined) {
    return "-";
  }

  if (valor instanceof Date) {
    const dia = String(valor.getDate()).padStart(2, "0");
    const mes = String(valor.getMonth() + 1).padStart(2, "0");
    const anio = String(valor.getFullYear()).slice(-2);
    return `${dia}/${mes}/${anio}`;
  }

  if (typeof valor === "string") {
    const trimmed = valor.trim();
    return trimmed === "" ? "-" : trimmed;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : "-";
  }

  return valor ?? "-";
};

export function DetalleVenta({
  open,
  onClose,
  detalle,
  loading,
  error,
  ventaBase,
}) {
  const [focusedVoucher, setFocusedVoucher] = useState(null);

  const resumenVenta = useMemo(() => {
    if (!detalle && !ventaBase) return [];

    const venta = detalle ?? {};
    const base = ventaBase ?? {};

    const statusLabel =
      venta?.estado_registro ?? base?.estado_registro ?? "Sin estado";

    return [
      {
        icon: <BsCalendarCheck />,
        label: "Fecha",
        value: obtenerPartesFecha(venta?.fecha_venta ?? base?.fecha_str).fecha,
      },
      {
        icon: <BsTag />,
        label: "Estado",
        value: statusLabel,
      },
      {
        icon: <BsPerson />,
        label: "Vendedor",
        value: venta?.nombre_vendedor ?? base?.usuario,
      },
      {
        icon: <BsBook />,
        label: "Editorial",
        value: venta?.nombre_editorial ?? base?.editorial,
      },
    ];
  }, [detalle, ventaBase]);

  const montosVenta = useMemo(() => {
    const venta = detalle ?? {};
    return [
      { label: "Total bruto", value: venta?.total_bruto, highlight: false },
      { label: "Descuento", value: venta?.total_descuento, highlight: false },
      { label: "Total neto", value: venta?.total_neto, highlight: true },
    ];
  }, [detalle]);

  const docenteData = useMemo(() => {
    const data = detalle ?? {};

    return {
      nombre:
        data.docente_nombre_completo ??
        data.nombre_docente ??
        data.docente?.nombre ??
        data.docente?.docente_nombre_completo,
      nro_doc: data.docente_nro_doc ?? data.docente?.nro_doc,
      telefono: data.docente_telefono ?? data.docente?.telefono,
      tipo_ingreso: data.docente_tipo_ingreso ?? data.docente?.tipo_ingreso,
    };
  }, [detalle]);

  const items = Array.isArray(detalle?.items)
    ? detalle.items
    : Array.isArray(detalle?.materiales)
      ? detalle.materiales
      : [];
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
          <div className="header-content">
            <h2>Detalles de venta</h2>
            <p>Visualiza la información completa de la transacción</p>
          </div>
          <CloseButton
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar detalles"
          >
            ✕
          </CloseButton>
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
              <TopSummary>
                {resumenVenta.map((item, index) => (
                  <SummaryItem key={index}>
                    <div className="icon-box">{item.icon}</div>
                    <div className="info-box">
                      <small>{item.label}</small>
                      <strong>{mostrarConGuion(item.value)}</strong>
                    </div>
                  </SummaryItem>
                ))}
              </TopSummary>

              <MainGrid>
                <LeftColumn>
                  <Section>
                    <SectionHeader>
                      <SectionTitle>Items vendidos</SectionTitle>
                      <Badge>{items.length}</Badge>
                    </SectionHeader>
                    {items.length === 0 ? (
                      <EmptySection>No hay items registrados.</EmptySection>
                    ) : (
                      <ItemsTable>
                        <thead>
                          <tr>
                            <th>Descripción</th>
                            <th className="text-right">Cant.</th>
                            <th className="text-right">Unitario</th>
                            <th className="text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={`${item.nombre_material}-${index}`}>
                              <td>
                                <div className="item-desc">
                                  <strong>
                                    {mostrarConGuion(item.nombre_material)}
                                  </strong>
                                  <small>
                                    {[
                                      item.tipo_contenido,
                                      item.nivel,
                                      item.subnivel,
                                      item.curso,
                                      item.mes,
                                    ]
                                      .filter(Boolean)
                                      .join(" • ") || "-"}
                                  </small>
                                </div>
                              </td>
                              <td className="text-right">
                                {item.cantidad ?? "-"}
                              </td>
                              <td className="text-right">
                                {mostrarConGuion(item.precio_unitario)}
                              </td>
                              <td className="text-right font-bold">
                                {mostrarConGuion(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </ItemsTable>
                    )}
                  </Section>

                  <Section>
                    <SectionHeader>
                      <SectionTitle>Plan de pagos</SectionTitle>
                      <Badge>{cuotas.length}</Badge>
                    </SectionHeader>
                    {cuotas.length === 0 ? (
                      <EmptySection>
                        Esta venta no tiene cuotas configuradas.
                      </EmptySection>
                    ) : (
                      <CuotasContainer>
                        {cuotas.map((cuota, index) => (
                          <CuotaRow key={`cuota-${index}`}>
                            <div className="cuota-header">
                              <div className="cuota-title">
                                <span className="cuota-number">
                                  {cuota.nro_cuota}
                                </span>
                                <div className="cuota-info">
                                  <strong>
                                    Vence:{" "}
                                    {mostrarConGuion(cuota.fecha_vencimiento)}
                                  </strong>
                                  <small>{mostrarConGuion(cuota.estado)}</small>
                                </div>
                              </div>
                              <div className="cuota-amount">
                                <small>
                                  Saldo: {mostrarConGuion(cuota.saldo)}
                                </small>
                                <strong>
                                  {mostrarConGuion(cuota.monto_programado)}
                                </strong>
                              </div>
                            </div>

                            {Array.isArray(cuota.pagos) &&
                              cuota.pagos.length > 0 && (
                                <PagosList>
                                  {cuota.pagos.map((pago, pagoIdx) => {
                                    const cuenta = pago?.cuenta ?? {};
                                    const cuotaNumero =
                                      cuota.nro_cuota ?? pago.nro_cuota ?? pagoIdx + 1;
                                    const cuentaInfo =
                                      [
                                        cuenta.entidad,
                                        cuenta.medio,
                                        cuenta.etiqueta,
                                        cuenta.numero,
                                      ]
                                        .filter(Boolean)
                                        .join(" - ");
                                    const voucherArchivo =
                                      pago?.archivo_voucher ??
                                      pago?.voucher ??
                                      pago?.evidencia?.archivo ??
                                      pago?.evidencias?.[0]?.archivo ??
                                      null;

                                    return (
                                      <div
                                        className="pago-wrapper"
                                        key={`pago-${pagoIdx}`}
                                      >
                                        <div className="pago-item">
                                          <div className="pago-info">
                                            <strong>
                                              {mostrarConGuion(pago.fecha_pago)}
                                            </strong>
                                            <small>
                                              {cuentaInfo || `Cuota #${cuotaNumero}`}
                                            </small>
                                          </div>
                                          <div className="pago-amount">
                                            {mostrarConGuion(pago.monto)}
                                          </div>
                                        </div>

                                        {voucherArchivo && (
                                          <PagoEvidencias>
                                            <EvidenceThumb
                                              role="button"
                                              tabIndex={0}
                                              onClick={() =>
                                                setFocusedVoucher({
                                                  preview: voucherArchivo,
                                                  id: `voucher-${index}-${pagoIdx}`,
                                                })
                                              }
                                              onKeyDown={(e) => {
                                                if (
                                                  e.key === "Enter" ||
                                                  e.key === " "
                                                ) {
                                                  setFocusedVoucher({
                                                    preview: voucherArchivo,
                                                    id: `voucher-${index}-${pagoIdx}`,
                                                  });
                                                }
                                              }}
                                            >
                                              <img
                                                src={voucherArchivo}
                                                alt={`Voucher cuota ${cuotaNumero}`}
                                              />
                                              <span className="evidence-label">
                                                Voucher cuota {cuotaNumero}
                                              </span>
                                            </EvidenceThumb>
                                          </PagoEvidencias>
                                        )}
                                      </div>
                                    );
                                  })}
                                </PagosList>
                              )}
                          </CuotaRow>
                        ))}
                      </CuotasContainer>
                    )}
                  </Section>
                </LeftColumn>

                <RightColumn>
                  <SideCard>
                    <SideHeader>Resumen Financiero</SideHeader>
                    <FinancialList>
                      {montosVenta.map((monto, i) => (
                        <div
                          key={i}
                          className={`financial-row ${monto.highlight ? "highlight" : ""
                            }`}
                        >
                          <span>{monto.label}</span>
                          <strong>{mostrarConGuion(monto.value)}</strong>
                        </div>
                      ))}
                    </FinancialList>
                  </SideCard>

                  {descuentos.length > 0 && (
                    <SideCard>
                      <SideHeader>Descuentos Aplicados</SideHeader>
                      <AlertsList>
                        {descuentos.map((dcto, index) => (
                          <AlertItem
                            key={`${dcto.codigo}-${index}`}
                            type="descuento"
                          >
                            <div className="flex-between">
                              <strong>{mostrarConGuion(dcto.nombre)}</strong>
                              <span className="pill">
                                {mostrarConGuion(dcto.codigo)}
                              </span>
                            </div>
                            <small>
                              {mostrarConGuion(dcto.fecha_aplicado)}
                            </small>
                            <small>
                              Aplicado por: {mostrarConGuion(dcto.aplicado_por)}
                            </small>
                            <strong className="monto-dcto">
                              -{mostrarConGuion(dcto.monto_descuento)}
                            </strong>
                          </AlertItem>
                        ))}
                      </AlertsList>
                    </SideCard>
                  )}

                  <SideCard>
                    <SideHeader>Información del Docente</SideHeader>
                    <DocenteInfo>
                      <div className="docente-avatar">
                        <BsPerson />
                      </div>
                      <div className="docente-details">
                        <strong>
                          {mostrarConGuion(docenteData?.nombre)}
                        </strong>
                        <small>
                          {mostrarConGuion(docenteData?.nro_doc)}
                        </small>
                      </div>
                      <ContactInfo>
                        <div className="contact-row">
                          <span>Tel:</span>
                          <strong>
                            {mostrarConGuion(docenteData?.telefono)}
                          </strong>
                        </div>
                        <div className="contact-row">
                          <span>Tipo:</span>
                          <strong>
                            {mostrarConGuion(docenteData?.tipo_ingreso)}
                          </strong>
                        </div>
                      </ContactInfo>
                    </DocenteInfo>
                  </SideCard>

                  {(ajustes.length > 0 || incidentes.length > 0) && (
                    <SideCard>
                      <SideHeader>Incidentes y Ajustes</SideHeader>
                      <AlertsList>
                        {ajustes.map((aj, i) => (
                          <AlertItem key={i} type="ajuste">
                            <strong>Ajuste: {mostrarConGuion(aj.monto)}</strong>
                            <small>{mostrarConGuion(aj.concepto)}</small>
                          </AlertItem>
                        ))}
                        {incidentes.map((inc, i) => (
                          <AlertItem key={i} type="incidente">
                            <strong>{mostrarConGuion(inc.descripcion)}</strong>
                            <small>{mostrarConGuion(inc.fecha_reporte)}</small>
                          </AlertItem>
                        ))}
                      </AlertsList>
                    </SideCard>
                  )}

                  <SideCard>
                    <SideHeader>Seguimiento</SideHeader>
                    <StatusSteps>
                      <Step status={supervisionActual?.estado}>
                        <div className="step-dot" />
                        <div className="step-content">
                          <small>Supervisión</small>
                          <strong>
                            {mostrarConGuion(supervisionActual?.estado)}
                          </strong>
                        </div>
                      </Step>
                      <Step status={contabilidadActual?.estado}>
                        <div className="step-dot" />
                        <div className="step-content">
                          <small>Contabilidad</small>
                          <strong>
                            {mostrarConGuion(contabilidadActual?.estado)}
                          </strong>
                        </div>
                      </Step>
                      <Step status={entregasActual?.estado}>
                        <div className="step-dot" />
                        <div className="step-content">
                          <small>Entregas</small>
                          <strong>
                            {mostrarConGuion(entregasActual?.estado)}
                          </strong>
                        </div>
                      </Step>
                    </StatusSteps>
                  </SideCard>
                </RightColumn>
              </MainGrid>
            </ScrollArea>
          )}

          {focusedVoucher && (
            <VoucherLightboxOverlay onClick={() => setFocusedVoucher(null)}>
              <VoucherLightboxContent
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="close"
                  onClick={() => setFocusedVoucher(null)}
                  aria-label="Cerrar vista ampliada"
                >
                  ×
                </button>
                <img
                  src={focusedVoucher.preview}
                  alt={`Vista ampliada`}
                />
              </VoucherLightboxContent>
            </VoucherLightboxOverlay>
          )}
        </ModalContent>
      </Modal>
    </Overlay>
  );
}

// Styled Components
const VoucherLightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  padding: 16px;
`;

const VoucherLightboxContent = styled.div`
  position: relative;
  width: min(640px, calc(100% - 64px));
  max-height: min(90vh, 820px);
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 24px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);

  img {
    width: 100%;
    height: auto;
    max-width: 95%;
    max-height: calc(90vh - 120px);
    object-fit: contain;
    border-radius: 10px;
    background: rgba(4, 18, 29, 0.65);
    padding: 8px;
  }

  .close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 1.3rem;
    cursor: pointer;
    line-height: 1;
  }
`;

const Modal = styled(ModalContainer)`
  width: min(1200px, 95vw);
  max-width: 1200px;
  height: min(900px, calc(100vh - 40px));
  max-height: min(900px, calc(100vh - 40px));
  padding: 0;
  gap: 0;
  background: ${({ theme }) => theme.bgtotal};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.header`
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  background: ${({ theme }) => theme.bgtotal};

  .header-content {
    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: ${({ theme }) => theme.text};
      font-weight: 700;
    }
    p {
      margin: 4px 0 0;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      font-size: 0.9rem;
    }
  }
`;

const CloseButton = styled.button`
  border: none;
  background: rgba(${({ theme }) => theme.textRgba}, 0.05);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(${({ theme }) => theme.textRgba}, 0.1);
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow: hidden;
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  display: flex;
  flex-direction: column;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 640px) {
    padding: 16px;
    gap: 18px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(${({ theme }) => theme.textRgba}, 0.2);
    border-radius: 4px;
  }
`;

const TopSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.05);
    display: grid;
    place-items: center;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.text};
  }

  .info-box {
    display: flex;
    flex-direction: column;

    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      font-size: 0.8rem;
    }

    strong {
      color: ${({ theme }) => theme.text};
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 320px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const Badge = styled.span`
  background: rgba(${({ theme }) => theme.textRgba}, 0.1);
  color: ${({ theme }) => theme.text};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const EmptySection = styled.div`
  padding: 32px;
  text-align: center;
  color: rgba(${({ theme }) => theme.textRgba}, 0.5);
  font-size: 0.95rem;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: rgba(${({ theme }) => theme.textRgba}, 0.02);
    th {
      padding: 12px 20px;
      text-align: left;
      font-size: 0.85rem;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      font-weight: 600;
      border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
    }
    th.text-right {
      text-align: right;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.05);
      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 14px 20px;
      vertical-align: middle;
      color: ${({ theme }) => theme.text};
      font-size: 0.95rem;
    }
    td.text-right {
      text-align: right;
    }
    td.font-bold {
      font-weight: 600;
    }
  }

  .item-desc {
    display: flex;
    flex-direction: column;
    gap: 4px;
    strong {
      font-weight: 600;
    }
    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      font-size: 0.8rem;
    }
  }
`;

const CuotasContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CuotaRow = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  &:last-child {
    border-bottom: none;
  }

  .cuota-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .cuota-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cuota-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colorPrincipal};
    color: #000;
    font-weight: 700;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
  }

  .cuota-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    strong {
      font-size: 0.9rem;
    }
    small {
      font-size: 0.8rem;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
  }

  .cuota-amount {
    text-align: right;
    display: flex;
    flex-direction: column;
    small {
      font-size: 0.8rem;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
    strong {
      font-size: 1rem;
      color: ${({ theme }) => theme.text};
    }
  }
`;

const PagosList = styled.div`
  margin-left: 44px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 720px) {
    margin-left: 0;
    padding: 10px 8px;
  }

  .pago-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    background: ${({ theme }) => theme.bgtotal};
    border-radius: 6px;
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.05);
  }

  .pago-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    .pago-info {
      display: flex;
      flex-direction: column;
      strong {
        font-size: 0.85rem;
      }
      small {
        font-size: 0.75rem;
        color: rgba(${({ theme }) => theme.textRgba}, 0.6);
      }
    }

    .pago-amount {
      font-weight: 600;
      font-size: 0.9rem;
    }
  }
`;

const PagoEvidencias = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 4px;
`;

const EvidenceThumb = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgba(${({ theme }) => theme.textRgba}, 0.06);
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    max-width: 120px;
    height: 100px;
    object-fit: contain;
    margin: 0 auto;
    border-radius: 10px;
    background: rgba(4, 18, 29, 0.3);
    padding: 4px;
  }

  .evidence-placeholder {
    width: 100%;
    height: 80px;
    border-radius: 6px;
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.15);
    display: grid;
    place-items: center;
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    background: ${({ theme }) => theme.bgtotal};
    font-size: 1.2rem;
  }

  .evidence-label {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SideCard = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
`;

const SideHeader = styled.h4`
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: rgba(${({ theme }) => theme.textRgba}, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
`;

const FinancialList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .financial-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.8);

    &.highlight {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
      font-weight: 700;
      color: ${({ theme }) => theme.text};
      font-size: 1.1rem;
    }
  }
`;

const DocenteInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  .docente-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(${({ theme }) => theme.textRgba}, 0.05);
    display: grid;
    place-items: center;
    font-size: 1.8rem;
    color: ${({ theme }) => theme.text};
  }

  .docente-details {
    strong {
      display: block;
      font-size: 1.1rem;
    }
    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
  }
`;

const ContactInfo = styled.div`
  width: 100%;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;

  .contact-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    span {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
    strong {
      color: ${({ theme }) => theme.text};
    }
  }
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AlertItem = styled.div`
  padding: 10px;
  border-radius: 8px;
  background: ${(props) =>
    props.type === "incidente"
      ? "rgba(245, 78, 65, 0.1)"
      : props.type === "descuento"
        ? "rgba(83, 178, 87, 0.1)"
        : "rgba(243, 210, 12, 0.1)"};
  border: 1px solid
    ${(props) =>
    props.type === "incidente"
      ? "rgba(245, 78, 65, 0.2)"
      : props.type === "descuento"
        ? "rgba(83, 178, 87, 0.2)"
        : "rgba(243, 210, 12, 0.2)"};
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 0.9rem;
  }
  small {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pill {
    background: ${({ theme }) => theme.bgtotal};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  }

  .monto-dcto {
    align-self: flex-end;
    margin-top: 4px;
    font-size: 1rem;
    color: ${({ theme }) => theme.text};
  }
`;

const StatusSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    left: 7px;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.1);
  }
`;

const Step = styled.div`
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;

  &:last-child {
    padding-bottom: 0;
  }

  .step-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${(props) =>
    props.status ? props.theme.verde : `rgba(${props.theme.textRgba}, 0.2)`};
    border: 2px solid ${({ theme }) => theme.bgtotal};
    z-index: 1;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    margin-top: -2px;
    small {
      font-size: 0.8rem;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
    strong {
      font-size: 0.95rem;
    }
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
  padding: 48px;
  text-align: center;
  color: rgba(${({ theme }) => theme.textRgba}, 0.5);
  font-size: 1.1rem;
`;
