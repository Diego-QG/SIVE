import styled from "styled-components";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";

export function RegistrarVentas3({ state, onClose, onPrevious, onFinish }) {
  if (!state) {
    return null;
  }

  const resumen = [];
  const total = resumen.reduce((sum, item) => sum + item.precio, 0);

  return (
    <Overlay>
      <Modal>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Datos de venta</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
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
          <OutlineButton type="button" onClick={onPrevious}>
            <v.iconoflechaizquierda /> Regresar
          </OutlineButton>
          <OutlineButton type="button" onClick={onClose}>
            Cancelar
          </OutlineButton>
          <PrimaryButton
            type="button"
            onClick={() => {
              onFinish?.();
            }}
          >
            Registrar venta <v.iconocheck />
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
  width: min(720px, 100%);
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
  border-radius: 999px;
  padding: 12px 28px;
  border: none;
  background: linear-gradient(120deg, #17e0c0, #53b257);
  color: #031c17;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;