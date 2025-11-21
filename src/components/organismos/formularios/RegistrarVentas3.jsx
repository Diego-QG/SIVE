import { useEffect, useState } from "react";
import styled from "styled-components";
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
} from "./RegistroVentaModalLayout";

export function RegistrarVentas3({
  state,
  isOpen,
  onClose,
  onPrevious,
  onFinish,
  ventaDraftId,
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (state) {
      setIsClosing(false);
    }
  }, [state]);

  if (!isOpen) {
    return null;
  }

  const handleRequestClose = async () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);

    try {
      await onClose?.();
    } catch (error) {
      console.error(error);
      setIsClosing(false);
    }
  };

  const resumen = [];
  const total = resumen.reduce((sum, item) => sum + item.precio, 0);

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isClosing} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Datos de venta</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isClosing}>
            <v.iconocerrar />
          </button>
        </Header>

        <RegistroVentaStepper currentStep={3} />

        <Body>
          <SelectorGrid>
            <SelectorColumn>
              <span>Seleccionar nivel</span>
              <SelectorButton type="button">Niveles disponibles</SelectorButton>
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar subnivel</span>
              <SelectorButton type="button">Subniveles disponibles</SelectorButton>
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar curso</span>
              <SelectorButton type="button">Cursos disponibles</SelectorButton>
            </SelectorColumn>
            <SelectorColumn>
              <span>Seleccionar items</span>
              <SelectorButton type="button">Items disponibles</SelectorButton>
            </SelectorColumn>
          </SelectorGrid>

          <PromoRow>
            <div>
              <label>Código promocional</label>
              <Input type="text" placeholder="--" disabled />
            </div>
            <GhostButton type="button">Usar</GhostButton>
          </PromoRow>

          <ResumenCard>
            <header>
              <div>
                <h4>Resumen de venta</h4>
                <p>Los montos se actualizarán al agregar items.</p>
              </div>
              <button type="button">
                <v.iconoagregar /> Agregar
              </button>
            </header>
            <ul>
              {resumen.length === 0 ? (
                <li className="empty">
                  <span>No hay materiales agregados todavía.</span>
                </li>
              ) : (
                resumen.map((item, index) => (
                  <li key={`resumen-${index}`}>
                    <div>
                      <strong>{item.nivel}</strong>
                      <span>{item.material}</span>
                    </div>
                    <b>S/{item.precio.toFixed(2)}</b>
                  </li>
                ))
              )}
            </ul>
            <footer>
              <div>
                <span>Total</span>
                <small>Sin descuentos aplicados</small>
              </div>
              <strong>S/{total.toFixed(2)}</strong>
            </footer>
          </ResumenCard>
        </Body>

        <Footer>
          <OutlineButton type="button" onClick={onPrevious} disabled={isClosing}>
            <v.iconoflechaizquierda /> Regresar
          </OutlineButton>
          <SuccessButton
            type="button"
            onClick={() => {
              onFinish?.();
            }}
            disabled={isClosing}
          >
            Registrar venta <v.iconocheck />
          </SuccessButton>
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
  gap: 20px;
`;

const SelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const SelectorColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
`;

const SelectorButton = styled.button`
  border-radius: 16px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.2);
  padding: 12px 18px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  color: ${({ theme }) => theme.text};
  text-align: left;
  cursor: pointer;
`;

const PromoRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;

  label {
    font-weight: 600;
    margin-bottom: 6px;
  }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  border-radius: 14px;
  border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
  padding: 12px 16px;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
`;

const GhostButton = styled.button`
  border-radius: 14px;
  border: none;
  padding: 12px 26px;
  background: rgba(249, 215, 11, 0.2);
  color: #735b00;
  font-weight: 700;
  cursor: pointer;
`;

const ResumenCard = styled.section`
  border-radius: 24px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;

    p {
      margin: 4px 0 0;
      color: rgba(${({ theme }) => theme.textRgba}, 0.65);
    }

    button {
      border-radius: 999px;
      border: none;
      padding: 10px 20px;
      background: rgba(23, 224, 192, 0.2);
      color: #06463b;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.15);

      strong {
        font-size: 1rem;
      }

      span {
        color: rgba(${({ theme }) => theme.textRgba}, 0.65);
      }
    }

    .empty {
      justify-content: center;
      border-bottom: none;
      padding: 20px;
      color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    }
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    small {
      color: rgba(${({ theme }) => theme.textRgba}, 0.65);
    }

    strong {
      font-size: 1.4rem;
    }
  }
`;

const Footer = styled(ModalFooter)`

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const SuccessButton = styled(PrimaryButton)`
  background: linear-gradient(120deg, #17e0c0, #53b257);
  color: #031c17;
`;