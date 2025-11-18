import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  useEditorialesStore,
  useEvidenciasStore,
  useUsuariosStore,
  useVentasStore,
  VoucherMultiUploadSection,
} from "../../../index";

export function RegistrarVentas1({
  state,
  onClose,
  onNext,
  ventaDraftId,
  onDraftCreated,
  ventaTieneDatos,
  onVentaTieneDatosChange,
  onDraftCreationStateChange,
  onBeforeCloseChange,
}) {

  const [stateEditorialesLista, setStateEditorialesLista] = useState(false);
  const {
    voucherspendientes: vouchers,
    agregarvoucherspendientes,
    removervoucherpendiente,
    setventaactual,
    limpiarvoucherspendientes,
    subirvoucherspendientes,
  } = useEvidenciasStore();
  const [focusedVoucher, setFocusedVoucher] = useState(null);
  const { dataeditoriales, editorialesitemselect, selecteditorial } =
    useEditorialesStore();
  const { datausuarios } = useUsuariosStore();
  const { insertarborrador, eliminarborrador, insertareditorialenventa } = useVentasStore();
  const [isSavingEditorial, setIsSavingEditorial] = useState(false);
  const hasEditoriales = (dataeditoriales ?? []).length > 0;
  const hasSelectedEditorial = Boolean(editorialesitemselect?.nombre?.trim());

  const selectorText = hasSelectedEditorial
    ? editorialesitemselect?.nombre
    : hasEditoriales
    ? "Editoriales disponibles"
    : "Sin editoriales disponibles";

  const clearEditorialSelection = () => {
    selecteditorial(null);
    onVentaTieneDatosChange?.(false);
  };

  const handleEditorialSelection = async (editorial) => {
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
      onVentaTieneDatosChange?.(true);
    }
  };

  const toggleEditoriales = () => {
    if (!hasEditoriales) return;
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
  
  const handleRemoveVoucher = (id) => {
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
    if (ventaDraftId) {
      await subirvoucherspendientes({
        idVenta: ventaDraftId,
        idUsuario: datausuarios?.id ?? null,
      });
      return;
    }

    limpiarvoucherspendientes();
  }, [ventaDraftId, datausuarios?.id, subirvoucherspendientes, limpiarvoucherspendientes]);

  useEffect(() => {
    onBeforeCloseChange?.(handleBeforeClose);
    return () => onBeforeCloseChange?.(null);
  }, [handleBeforeClose, onBeforeCloseChange]);

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
      onVentaTieneDatosChange?.(false);
      selecteditorial(null);
    };

    crearBorrador();

    return () => {
      isCancelled = true;
    };
  }, [state, ventaDraftId, datausuarios?.id, insertarborrador, onDraftCreated, onDraftCreationStateChange, onVentaTieneDatosChange, selecteditorial]);

  if (!state) {
    return null;
  }

  const handleRequestClose = async () => {
    await handleBeforeClose();

    if (ventaDraftId && !ventaTieneDatos && datausuarios?.id) {
      await eliminarborrador({ _id_venta: ventaDraftId, _id_usuario: datausuarios.id });
    }

    clearEditorialSelection();
    onClose?.({ skipBeforeClose: true });
  };

  return (
    <Overlay>
      <Modal>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Comprobantes</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar">
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
            vouchers={vouchers}
            onFilesSelected={addVouchers}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onVoucherClick={handleFocusVoucher}
            onRemoveVoucher={handleRemoveVoucher}
            emptyMessage="Aún no se han cargado vouchers"
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
          <OutlineButton type="button" onClick={handleRequestClose}>
            Cancelar
          </OutlineButton>
          <PrimaryButton type="button" onClick={onNext}>
            Siguiente <v.icononext />
          </PrimaryButton>
        </Footer>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(7, 20, 36, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
`;

const Modal = styled.div`
  width: min(680px, 100%);
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 28px;
  padding: 28px 32px 32px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: ${({ theme }) => theme.text};
  height: min(720px, calc(100vh - 100px));
  max-height: min(720px, calc(100vh - 100px));
  overflow: hidden;
`;

const Header = styled.header`
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
`;

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


const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const OutlineButton = styled.button`
  border-radius: 999px;
  padding: 12px 24px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.35);
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  border-radius: 999px;
  padding: 12px 28px;
  border: none;
  background: linear-gradient(120deg, #ffee58, #17e0c0);
  color: #04121d;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;