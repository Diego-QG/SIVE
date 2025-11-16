import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  useEditorialesStore,
} from "../../../index";

export function RegistrarVentas1({ state, onClose, onNext }) {
  if (!state) {
    return null;
  }

  const [stateEditorialesLista, setStateEditorialesLista] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const fileInputRef = useRef(null);
  const vouchersRef = useRef([]);
  const [focusedVoucher, setFocusedVoucher] = useState(null);
  const { dataeditoriales, editorialesitemselect, selecteditorial } =
    useEditorialesStore();
  const hasEditoriales = (dataeditoriales ?? []).length > 0;
  const hasSelectedEditorial = Boolean(editorialesitemselect?.nombre?.trim());

  const selectorText = hasSelectedEditorial
    ? editorialesitemselect?.nombre
    : hasEditoriales
    ? "Editoriales disponibles"
    : "Sin editoriales disponibles";

  const clearEditorialSelection = () => {
    selecteditorial(null);
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

    setVouchers((prev) => [...prev, ...normalizedFiles]);
  };

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    addVouchers(selectedFiles);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
    addVouchers(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveVoucher = (id) => {
    setVouchers((prev) => {
      const voucherToRemove = prev.find((voucher) => voucher.id === id);
      if (voucherToRemove) {
        URL.revokeObjectURL(voucherToRemove.preview);
      }
      return prev.filter((voucher) => voucher.id !== id);
    });
    if (focusedVoucher?.id === id) {
      setFocusedVoucher(null);
    }
  };

  const handleFocusVoucher = (voucher) => {
    setFocusedVoucher(voucher);
  };

  const closeFocusedVoucher = () => setFocusedVoucher(null);

  useEffect(() => {
    vouchersRef.current = vouchers;
  }, [vouchers]);

  useEffect(() => {
    return () => {
      vouchersRef.current.forEach((voucher) =>
        URL.revokeObjectURL(voucher.preview)
      );
    };
  }, []);

  return (
    <Overlay>
      <Modal>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Comprobantes</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
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
                  texto2={selectorText}
                  color="#F9D70B"
                  isPlaceholder={!hasSelectedEditorial}
                  onClear={hasSelectedEditorial ? clearEditorialSelection : undefined}
                />
                <ListaDesplegable
                  state={stateEditorialesLista}
                  data={dataeditoriales}
                  funcion={selecteditorial}
                  top="3.5rem"
                  setState={() => setStateEditorialesLista((prev) => !prev)}
                  onClear={hasSelectedEditorial ? clearEditorialSelection : undefined}
                  clearLabel="Limpiar selección"
                />
              </DropdownWrapper>
            </EditorialSelectorRow>
          </section>

          <VoucherSection>
            <section>
              <div>
                <h3>Subir voucher de venta</h3>
                <p>Arrastra, suelta o haz clic para elegir archivos</p>
              </div>

              <div className="voucher-section__cta">
                <small>
                  {vouchers.length
                    ? `${vouchers.length} archivo${
                        vouchers.length > 1 ? "s" : ""
                      } seleccionado${vouchers.length > 1 ? "s" : ""}`
                    : "Puedes adjuntar varios vouchers"}
                </small>
                <UploadButton type="button" onClick={handleUploadZoneClick}>
                  <div className="icon">
                    <v.iconoimagenvacia />
                  </div>
                  <span>Seleccionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileSelection}
                  />
                </UploadButton>
              </div>
            </section>

            <VoucherPreview
              $isEmpty={!vouchers.length}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {vouchers.length === 0 ? (
                <p className="empty">Aún no se han cargado vouchers</p>
              ) : (
                vouchers.map((voucher, index) => (
                  <div
                    key={voucher.id}
                    className="voucher-card"
                    onClick={() => handleFocusVoucher(voucher)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        handleFocusVoucher(voucher);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="voucher-card__remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveVoucher(voucher.id);
                      }}
                      aria-label={`Eliminar voucher ${index + 1}`}
                    >
                      ×
                    </button>
                    <img src={voucher.preview} alt={`Voucher ${index + 1}`} />
                    <span>Voucher {index + 1}</span>
                  </div>
                ))
              )}
            </VoucherPreview>
          </VoucherSection>
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
          <OutlineButton type="button" onClick={onClose}>
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

const VoucherSection = styled.div`
  border-radius: 24px;
  padding: 18px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;

  section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
  }
  

  h3 {
    margin: 0 0 4px;
  }

  p {
    margin: 0;
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  }

  .voucher-section__cta {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    min-width: 220px;
    width: min(260px, 100%);
    text-align: left;
    justify-content: center;
  }

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
  }
`;

const UploadButton = styled.button`
  border-radius: 18px;
  border: 1.5px dashed rgba(247, 199, 68, 0.95);
  background: rgba(247, 199, 68, 0.2);
  padding: 14px 20px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  width: 100%;
  justify-content: center;
  min-height: 58px;

  input {
    display: none;
  }

  .icon {
    font-size: 22px;
    color: #f7c744;
    display: flex;
  }
`;

const VoucherPreview = styled.div`
  flex: 1;
  min-height: 244px;
  max-height: 244px;
  border-radius: 20px;
  border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  padding: 12px;

  ${({ $isEmpty }) =>
    $isEmpty
      ? css`
          display: grid;
          place-items: center;
          overflow: hidden;

          .empty {
            margin: 0;
            color: rgba(${({ theme }) => theme.textRgba}, 0.6);
            text-align: center;
          }
        `
      : css`
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          align-content: flex-start;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 999px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(${({ theme }) => theme.textRgba}, 0.15);
            border-radius: 999px;
          }
        `}

  .voucher-card {
    position: relative;
    border-radius: 16px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    flex: 0 0 214px;

    img {
      width: 100%;
      height: 170px;
      object-fit: contain;
      border-radius: 12px;
      background: rgba(4, 18, 29, 0.3);
      padding: 4px;
    }

    span {
      font-size: 0.85rem;
      font-weight: 600;
    }

    &__remove {
      position: absolute;
      top: 8px;
      right: 8px;
      border: none;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      line-height: 1;
      font-size: 1rem;
    }
  }
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