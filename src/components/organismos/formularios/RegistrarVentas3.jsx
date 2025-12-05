import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ClosingOverlay,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  Overlay,
  OutlineButton,
  PrimaryButton,
  Spinner,
  useEvidenciasStore,
  useUsuariosStore,
  useVentasStore,
  VoucherMultiUploadSection,
  obtenerVentaBorradorPorId,
  obtenerVouchersRecibidosPorVenta,
  useRegistrarVentasStore,
} from "../../../index";
import { VentaInput } from "../../../index";

export function RegistrarVentas3({
  state,
  isOpen,
  onClose,
  onPrevious,
  onFinish,
  ventaDraftId,
  onPersistDocente,
  ventaFlags = {},
}) {
  const {
    voucherspendientes: vouchers,
    agregarvoucherspendientes,
    removervoucherpendiente,
    setventaactual,
    subirvoucherspendientes,
    eliminarvoucherrecibido,
  } = useEvidenciasStore();
  const { datausuarios } = useUsuariosStore();
  const { refrescarVentas } = useVentasStore();
  const { confirmarventa } = useRegistrarVentasStore();

  const [isClosing, setIsClosing] = useState(false);
  const [focusedVoucher, setFocusedVoucher] = useState(null);
  const [persistedVouchers, setPersistedVouchers] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0);

  // Cuotas State
  const [cuotas, setCuotas] = useState([]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Load Total and Vouchers
  useEffect(() => {
    if (!state || !ventaDraftId) return;

    setventaactual(ventaDraftId);

    const loadData = async () => {
      const [ventaData, vouchersGuardados] = await Promise.all([
        obtenerVentaBorradorPorId({ _id_venta: ventaDraftId }),
        obtenerVouchersRecibidosPorVenta({ id_venta: ventaDraftId }),
      ]);

      if (ventaData) {
        const total = Number(ventaData.total_neto ?? 0);
        setTotalVenta(total);
        setCuotas((prev) =>
          prev.length === 0
            ? [
                {
                  id: 1,
                  monto: total,
                  fecha: todayStr,
                },
              ]
            : prev
        );
      }

      setPersistedVouchers(
        (vouchersGuardados ?? [])
          .filter((item) => item?.archivo)
          .map((item) => ({
            id: item.id,
            preview: item.archivo,
            isPersisted: true,
          }))
      );
    };

    loadData();
  }, [state, ventaDraftId, obtenerVentaBorradorPorId, obtenerVouchersRecibidosPorVenta, setventaactual, todayStr]);

  // Vouchers Logic
  const addVouchers = (incomingFiles) => {
    if (!incomingFiles?.length) return;
    const normalizedFiles = incomingFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `${file.name}-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
      }));
    if (!normalizedFiles.length) return;
    agregarvoucherspendientes(normalizedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    addVouchers(droppedFiles);
  };

  const handleRemoveVoucher = async (id) => {
    const persisted = persistedVouchers.find((voucher) => voucher.id === id);
    if (persisted) {
      await eliminarvoucherrecibido({ id });
      setPersistedVouchers((prev) => prev.filter((voucher) => voucher.id !== id));
      if (focusedVoucher?.id === id) setFocusedVoucher(null);
      return;
    }
    removervoucherpendiente(id);
    if (focusedVoucher?.id === id) setFocusedVoucher(null);
  };

  const displayedVouchers = useMemo(
    () => [...persistedVouchers, ...vouchers],
    [persistedVouchers, vouchers]
  );

  // Cuotas Logic
  const totalCuotas = useMemo(() => {
    return cuotas.reduce((sum, c) => sum + (Number(c.monto) || 0), 0);
  }, [cuotas]);

  const isValidTotal = Math.abs(totalCuotas - totalVenta) < 0.01;

  const handleAddCuota = () => {
    setCuotas((prev) => {
      const nextId = prev.length + 1;
      return [...prev, { id: nextId, monto: 0, fecha: "" }];
    });
  };

  const handleRemoveCuota = (id) => {
    setCuotas((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, id: i + 1 }));
    });
  };

  const updateCuota = (id, field, value) => {
    setCuotas((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // Confirm Logic
  const handleFinish = async () => {
    if (!ventaDraftId) {
      toast.error("Error: No hay venta activa.");
      return;
    }

    if (displayedVouchers.length === 0) {
      toast.warning("Debes subir al menos un voucher (evidencia de pago).");
      return;
    }

    if (!isValidTotal) {
      toast.warning(`La suma de las cuotas (S/${totalCuotas.toFixed(2)}) debe ser igual al total de la venta (S/${totalVenta.toFixed(2)}).`);
      return;
    }

    const canPersistDocente = await onPersistDocente?.();
    if (canPersistDocente === false) return;

    setIsClosing(true);

    if (vouchers.length > 0) {
      await subirvoucherspendientes({
        idVenta: ventaDraftId,
        idUsuario: datausuarios?.id ?? null,
      });
    }

    const payload = {
      idVenta: ventaDraftId,
      cuotas: cuotas.map((c) => ({
        nro_cuota: c.id,
        fecha_vencimiento: c.fecha || todayStr,
        monto_programado: Number(c.monto),
      })),
    };

    const confirmado = await confirmarventa(payload);

    if (confirmado) {
      await refrescarVentas();
      onFinish?.();
    } else {
      toast.error("No se pudo registrar la venta.");
      setIsClosing(false);
    }
  };

  const handleRequestClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      if (vouchers.length > 0) {
        await subirvoucherspendientes({
          idVenta: ventaDraftId,
          idUsuario: datausuarios?.id ?? null,
        });
      }
      onClose?.();
    } finally {
      setIsClosing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isClosing} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Pagos y Cuotas</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isClosing}>
            <v.iconocerrar />
          </button>
        </Header>

        <RegistroVentaStepper currentStep={3} />

        <Body>
          <SplitPanel>
            <LeftPanel>
                <SectionTitle>Comprobantes de Pago (Cuota 1)</SectionTitle>
                <VoucherMultiUploadSection
                    vouchers={displayedVouchers}
                    onFilesSelected={addVouchers}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onVoucherClick={setFocusedVoucher}
                    onRemoveVoucher={handleRemoveVoucher}
                    emptyMessage="Sube los vouchers o comprobantes aquí."
                />
            </LeftPanel>

            <RightPanel>
                <SectionTitle>Cronograma de Pagos</SectionTitle>
                <TotalDisplay>
                    <span>Total Venta:</span>
                    <strong>S/ {totalVenta.toFixed(2)}</strong>
                </TotalDisplay>

                <CuotasList>
                    {cuotas.map((cuota, index) => (
                        <CuotaItem key={cuota.id}>
                            <div className="header">
                                <span>Cuota {cuota.id}</span>
                                {index > 0 && (
                                    <button onClick={() => handleRemoveCuota(cuota.id)} className="remove-btn">
                                        <v.iconocerrar size="12px"/>
                                    </button>
                                )}
                            </div>
                            <div className="inputs">
                                <VentaInput
                                    label="Fecha"
                                    type="date"
                                    value={cuota.fecha}
                                    onChange={(e) => updateCuota(cuota.id, 'fecha', e.target.value)}
                                />
                                <VentaInput
                                    label="Monto"
                                    type="number"
                                    value={cuota.monto}
                                    onChange={(e) => updateCuota(cuota.id, 'monto', e.target.value)}
                                />
                            </div>
                        </CuotaItem>
                    ))}
                </CuotasList>

                <AddCuotaButton type="button" onClick={handleAddCuota}>
                    <v.iconoagregar /> Agregar Cuota
                </AddCuotaButton>

                <TotalCheck $isValid={isValidTotal}>
                    <span>Total Cuotas: S/ {totalCuotas.toFixed(2)}</span>
                    {!isValidTotal && <small>Difiere por S/ {(totalVenta - totalCuotas).toFixed(2)}</small>}
                </TotalCheck>

            </RightPanel>
          </SplitPanel>
        </Body>

        {focusedVoucher && (
          <LightboxOverlay onClick={() => setFocusedVoucher(null)}>
            <img src={focusedVoucher.preview} alt="Voucher" />
          </LightboxOverlay>
        )}

        <Footer>
          <OutlineButton type="button" onClick={onPrevious} disabled={isClosing}>
            <v.iconoflechaizquierda /> Atrás
          </OutlineButton>
          <PrimaryButton type="button" onClick={handleFinish} disabled={isClosing || !isValidTotal}>
            Finalizar Venta <v.iconocheck />
          </PrimaryButton>
        </Footer>

        {isClosing && (
          <ClosingOverlay>
            <Spinner />
            <strong>Registrando venta...</strong>
          </ClosingOverlay>
        )}
      </Modal>
    </Overlay>
  );
}

const Modal = styled(ModalContainer)`
    width: min(1000px, 95vw);
    max-width: 1000px;
`;
const Header = styled(ModalHeader)``;
const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const SplitPanel = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;
const PanelCard = styled.section`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: ${({ theme }) => theme.posPanelBg};
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;
const LeftPanel = styled(PanelCard)``;
const RightPanel = styled(PanelCard)`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.text};
`;
const TotalDisplay = styled.div`
    background: ${({ theme }) => theme.bg2};
    padding: 12px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    border: 1px solid ${({ theme }) => theme.borderColor};
`;
const CuotasList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
`;
const CuotaItem = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
    border-radius: 10px;
    padding: 10px;

    .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9rem;
    }
    .inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        @media (max-width: 760px) {
          grid-template-columns: 1fr;
        }
    }
    .remove-btn {
        background: none;
        border: none;
        color: ${({ theme }) => theme.text};
        cursor: pointer;
        opacity: 0.6;
        &:hover { opacity: 1; color: #ff4444; }
    }
`;
const AddCuotaButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: 1px dashed ${({ theme }) => theme.borderColor};
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    color: ${({ theme }) => theme.text};
    &:hover { background: ${({ theme }) => theme.bg2}; }
    align-self: flex-start;
    min-width: 0;
    @media (max-width: 760px) {
      width: 100%;
    }
`;
const TotalCheck = styled.div`
    text-align: right;
    font-weight: 600;
    color: ${({ $isValid }) => $isValid ? 'rgba(57, 125, 20, 0.7)' : 'rgba(255, 68, 68, 0.5)'};
    display: flex;
    flex-direction: column;
    small { font-weight: 400; }
`;
const Footer = styled(ModalFooter)``;
const LightboxOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000;
  display: flex; justify-content: center; align-items: center; padding: 16px;
  img { max-width: 95%; max-height: 90%; border-radius: 10px; }
`;
