import { useState } from "react";
import styled from "styled-components";
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

          <UploadZone>
            <div className="icon">
              <v.iconoimagenvacia />
            </div>
            <div>
              <h3>Subir voucher de venta</h3>
              <p>Arrastra, suelta o haz clic para elegir archivos</p>
            </div>
            <small>No hay archivos seleccionados</small>
          </UploadZone>

          <VoucherPreview>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`voucher-${index}`} className="voucher-card">
                <span>Voucher {index + 1}</span>
                <small>Sin vista previa disponible</small>
              </div>
            ))}
          </VoucherPreview>
        </Body>

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
  align-items: flex-end;
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

const UploadZone = styled.div`
  border-radius: 22px;
  padding: 32px 24px;
  border: 2px dashed rgba(255, 224, 130, 0.6);
  background: rgba(255, 224, 130, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  .icon {
    font-size: 48px;
    color: #f7c744;
  }

  h3 {
    margin: 0;
  }

  p {
    margin: 0;
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  }

  small {
    color: rgba(${({ theme }) => theme.textRgba}, 0.55);
  }
`;

const VoucherPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;

  .voucher-card {
    padding: 14px;
    border-radius: 18px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-weight: 600;
    }

    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
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