import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  Spinner,
  useDocentesStore,
  useEmpresaStore,
  useEditorialesStore,
  useEvidenciasStore,
  useUsuariosStore,
  useVentasStore,
  VoucherMultiUploadSection,
  obtenerVentaBorradorPorId,
  obtenerVouchersRecibidosPorVenta,
} from "../../../index";
import {
  ClosingOverlay,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  Overlay,
  PrimaryButton,
} from "./RegistroVentaModalLayout";

export function RegistrarVentas1({
  state,
  isOpen,
  onClose,
  onNext,
  ventaDraftId,
  onDraftCreated,
  onVentaTieneDatosChange,
  onDraftCreationStateChange,
  onBeforeCloseChange,
  isEditing = false,
}) {
  const { dataempresa } = useEmpresaStore();
  const { creardocenteborrador } = useDocentesStore();
  const [stateEditorialesLista, setStateEditorialesLista] = useState(false);
  const {
    voucherspendientes: vouchers,
    agregarvoucherspendientes,
    removervoucherpendiente,
    setventaactual,
    limpiarvoucherspendientes,
    subirvoucherspendientes,
    eliminarvoucherrecibido,
  } = useEvidenciasStore();
  const [focusedVoucher, setFocusedVoucher] = useState(null);
  const { dataeditoriales, editorialesitemselect, selecteditorial } =
    useEditorialesStore();
  const { datausuarios } = useUsuariosStore();
  const { insertarborrador, insertareditorialenventa } = useVentasStore();
  const [isSavingEditorial, setIsSavingEditorial] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [persistedVouchers, setPersistedVouchers] = useState([]);
  const [draftEditorialId, setDraftEditorialId] = useState(null);
  const [isLoadingDraftData, setIsLoadingDraftData] = useState(false);
  const hasEditoriales = (dataeditoriales ?? []).length > 0;
  const hasSelectedEditorial = Boolean(editorialesitemselect?.nombre?.trim());
  const isLoadingInitialData = isEditing && isLoadingDraftData;

  const selectorText = isLoadingInitialData
    ? "Cargando datos..."
    : hasSelectedEditorial
    ? editorialesitemselect?.nombre
    : hasEditoriales
    ? "Editoriales disponibles"
    : "Sin editoriales disponibles";

  const clearEditorialSelection = () => {
    selecteditorial(null);
    onVentaTieneDatosChange?.("editorial", false);
    setDraftEditorialId(null);
  };

  const handleEditorialSelection = async (editorial) => {
    if (isLoadingInitialData) {
      return;
    }
    
    if (!editorial?.id || !ventaDraftId) {
      clearEditorialSelection();
      return;
    }

    setIsSavingEditorial(true);
    const isSaved = await insertareditorialenventa({
      _id_venta: ventaDraftId,
      _id_editorial: editorial.id,
    });
    setIsSavingEditorial(false);

    if (isSaved) {
      selecteditorial(editorial);
      onVentaTieneDatosChange?.("editorial", true);
    }
  };

  const toggleEditoriales = () => {
    if (!hasEditoriales || isLoadingInitialData) return;
    setStateEditorialesLista((prev) => !prev);
  };

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

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  
  const handleRemoveVoucher = async (id) => {
    const persisted = persistedVouchers.find((voucher) => voucher.id === id);
    if (persisted) {
      await eliminarvoucherrecibido({ id });
      setPersistedVouchers((prev) => prev.filter((voucher) => voucher.id !== id));
      if (focusedVoucher?.id === id) {
        setFocusedVoucher(null);
      }
      return;
    }

    removervoucherpendiente(id);
    if (focusedVoucher?.id === id) {
      setFocusedVoucher(null);
    }
  };

  const handleFocusVoucher = (voucher) => {
    setFocusedVoucher(voucher);
  };

  const closeFocusedVoucher = () => setFocusedVoucher(null);

  const handleBeforeClose = useCallback(async () => {
    const shouldCreateDraft = !ventaDraftId && vouchers.length > 0;
    const currentDraftId =
      ventaDraftId ||
      (shouldCreateDraft && datausuarios?.id
        ? await insertarborrador({ _id_usuario: datausuarios.id })
        : null);

    if (!currentDraftId) {
      limpiarvoucherspendientes();
      return;
    }

    if (!ventaDraftId && shouldCreateDraft) {
      onDraftCreated?.(currentDraftId);
      onVentaTieneDatosChange?.("editorial", false);
      onVentaTieneDatosChange?.("vouchers", false);
      setventaactual(currentDraftId);
    }

    const seSubioAlguno = await subirvoucherspendientes({
      idVenta: currentDraftId,
      idUsuario: datausuarios?.id ?? null,
    });

    if (seSubioAlguno) {
      const vouchersGuardados = await obtenerVouchersRecibidosPorVenta({
        id_venta: currentDraftId,
      });

      const vouchersPersistidos = (vouchersGuardados ?? [])
        .filter((item) => item?.archivo)
        .map((item) => ({
          id: item.id,
          preview: item.archivo,
          isPersisted: true,
        }));

      setPersistedVouchers(vouchersPersistidos);
      onVentaTieneDatosChange?.("vouchers", vouchersPersistidos.length > 0);
    }
  }, [
    ventaDraftId,
    vouchers.length,
    insertarborrador,
    datausuarios?.id,
    subirvoucherspendientes,
    limpiarvoucherspendientes,
    onVentaTieneDatosChange,
    onDraftCreated,
    setventaactual,
  ]);

  useEffect(() => {
    onBeforeCloseChange?.("step1", handleBeforeClose);
    return () => onBeforeCloseChange?.("step1", null);
  }, [handleBeforeClose, onBeforeCloseChange]);
  useEffect(() => {
    if (state) {
      setIsClosing(false);
    }
  }, [state]);

  useEffect(() => {
    if (!state || !ventaDraftId || !isEditing) {
      setPersistedVouchers([]);
      setDraftEditorialId(null);
      setIsLoadingDraftData(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingDraftData(true);

    const cargarDatos = async () => {
      const [ventaData, vouchersGuardados] = await Promise.all([
        obtenerVentaBorradorPorId({ id_venta: ventaDraftId }),
        obtenerVouchersRecibidosPorVenta({ id_venta: ventaDraftId }),
      ]);

      if (isCancelled) {
        return;
      }

      setDraftEditorialId(ventaData?.id_editorial ?? null);
      setPersistedVouchers(
        (vouchersGuardados ?? [])
          .filter((item) => item?.archivo)
          .map((item) => ({
            id: item.id,
            preview: item.archivo,
            isPersisted: true,
          }))
      );

      if (ventaData?.id_editorial) {
        onVentaTieneDatosChange?.("editorial", true);
      }

      setIsLoadingDraftData(false);
    };

    cargarDatos().catch(() => {
      if (!isCancelled) {
        setIsLoadingDraftData(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [state, ventaDraftId, isEditing, onVentaTieneDatosChange]);

  useEffect(() => {
    if (!draftEditorialId || !Array.isArray(dataeditoriales)) {
      return;
    }

    const editorialActual = dataeditoriales.find(
      (item) => `${item?.id ?? ""}` === `${draftEditorialId}`
    );

    if (editorialActual) {
      selecteditorial(editorialActual);
    }
  }, [draftEditorialId, dataeditoriales, selecteditorial]);

  useEffect(() => {
    if (!state || !ventaDraftId) {
      return;
    }

    setventaactual(ventaDraftId);
  }, [state, setventaactual, ventaDraftId]);

  useEffect(() => {
    let isCancelled = false;

    const crearBorrador = async () => {
      if (!state || ventaDraftId || !datausuarios?.id) {
        return;
      }

      onDraftCreationStateChange?.(true);
      const nuevoId = await insertarborrador({ _id_usuario: datausuarios.id });
      onDraftCreationStateChange?.(false);

      if (isCancelled || !nuevoId) {
        return;
      }

      onDraftCreated?.(nuevoId);
      onVentaTieneDatosChange?.("editorial", false);
      onVentaTieneDatosChange?.("vouchers", false);
      selecteditorial(null);

      const empresaId = dataempresa?.id ?? datausuarios?.id_empresa ?? null;

      if (empresaId) {
        await creardocenteborrador({
          _id_venta: nuevoId,
          _id_empresa: empresaId,
          _id_pais: 1,
        });
      }
    };

    crearBorrador();

    return () => {
      isCancelled = true;
    };
  }, [
    state,
    ventaDraftId,
    datausuarios?.id,
    dataempresa?.id,
    datausuarios?.id_empresa,
    insertarborrador,
    onDraftCreated,
    onDraftCreationStateChange,
    onVentaTieneDatosChange,
    selecteditorial,
    creardocenteborrador,
  ]);

  const displayedVouchers = useMemo(
    () => [...persistedVouchers, ...vouchers],
    [persistedVouchers, vouchers]
  );

  useEffect(() => {
    if (!state) {
      return;
    }

    onVentaTieneDatosChange?.("vouchers", (displayedVouchers ?? []).length > 0);
  }, [displayedVouchers, onVentaTieneDatosChange, state]);

  if (!isOpen) {
    return null;
  }

  const handleRequestClose = async () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);

    try {
      clearEditorialSelection();
      await onClose?.();
    } catch (error) {
      console.error(error);
      setIsClosing(false);
    }
  };

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isClosing} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Comprobantes</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isClosing}>
            <v.iconocerrar />
          </button>
        </Header>

        <RegistroVentaStepper currentStep={1} />

        <Body>
          <section>
            <EditorialSelectorRow>
              <Label>Seleccionar editorial</Label>
              <DropdownWrapper>
                <Selector
                  state={stateEditorialesLista}
                  funcion={toggleEditoriales}
                  texto1=""
                  texto2={isSavingEditorial ? "Guardando..." : selectorText}
                  color="#F9D70B"
                  isPlaceholder={!hasSelectedEditorial || isSavingEditorial}
                  onClear={hasSelectedEditorial ? clearEditorialSelection : undefined}
                />
                <ListaDesplegable
                  state={stateEditorialesLista}
                  data={dataeditoriales}
                  funcion={handleEditorialSelection}
                  top="3.5rem"
                  setState={() => setStateEditorialesLista((prev) => !prev)}
                  onClear={hasSelectedEditorial ? clearEditorialSelection : undefined}
                  clearLabel="Limpiar selección"
                />
              </DropdownWrapper>
            </EditorialSelectorRow>
          </section>

          <VoucherMultiUploadSection
            vouchers={displayedVouchers}
            onFilesSelected={addVouchers}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onVoucherClick={handleFocusVoucher}
            onRemoveVoucher={handleRemoveVoucher}
            emptyMessage={
              isLoadingInitialData
                ? "Cargando vouchers guardados..."
                : "Aún no se han cargado vouchers"
            }
          />
        </Body>

        {focusedVoucher && (
          <VoucherLightboxOverlay onClick={closeFocusedVoucher}>
            <VoucherLightboxContent onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="close"
                onClick={closeFocusedVoucher}
                aria-label="Cerrar vista ampliada"
              >
                ×
              </button>
              <img
                src={focusedVoucher.preview}
                alt={`Vista ampliada del voucher ${focusedVoucher.id}`}
              />
            </VoucherLightboxContent>
          </VoucherLightboxOverlay>
        )}

        <Footer>
          <PrimaryButton type="button" onClick={onNext} disabled={isClosing}>
            Siguiente <v.icononext />
          </PrimaryButton>
        </Footer>
        {isClosing && (
          <ClosingOverlay>
            <Spinner />
            <strong>Guardando cambios...</strong>
            <small>Por favor espera un momento.</small>
          </ClosingOverlay>
        )}
      </Modal>
    </Overlay>
  );
}

const Modal = styled(ModalContainer)``;

const Header = styled(ModalHeader)``;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(${({ theme }) => theme.textRgba}, 0.2);
    border-radius: 999px;
  }
`;

const EditorialSelectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Label = styled.p`
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
`;

const DropdownWrapper = styled(ContainerSelector)`
  width: min(320px, 100%);
  position: relative;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
`;

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
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);

  img {
    width: 100%;
    height: auto;
    max-height: calc(90vh - 160px);
    object-fit: contain;
    border-radius: 18px;
    background: rgba(4, 18, 29, 0.75);
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


const Footer = styled(ModalFooter)``;