import styled from "styled-components";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";

export function RegistrarVentas2({ state, onClose, onNext, onPrevious }) {
  if (!state) {
    return null;
  }

  return (
    <Overlay>
      <Modal>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Datos del docente</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <v.iconocerrar />
          </button>
        </Header>

        <RegistroVentaStepper currentStep={2} />

        <Body>
          <InputGroup>
            <label>Número de teléfono</label>
            <input type="text" placeholder="Sin información" disabled />
          </InputGroup>

          <InputRow>
            <InputGroup>
              <label>DNI</label>
              <input type="text" placeholder="Sin información" disabled />
            </InputGroup>
            <GhostButton type="button">Consultar</GhostButton>
          </InputRow>

          <DualGrid>
            <InputGroup>
              <label>Nombres</label>
              <input type="text" placeholder="" disabled />
            </InputGroup>
            <InputGroup>
              <label>Apellido paterno</label>
              <input type="text" placeholder="" disabled />
            </InputGroup>
            <InputGroup>
              <label>Apellido materno</label>
              <input type="text" placeholder="" disabled />
            </InputGroup>
            <InputGroup>
              <label>Código de IE</label>
              <input type="text" placeholder="" disabled />
            </InputGroup>
          </DualGrid>

          <SelectorGrid>
            <SelectorColumn>
              <span>Departamento</span>
              <SelectorButton type="button">Departamentos</SelectorButton>
            </SelectorColumn>
            <SelectorColumn>
              <span>Provincia</span>
              <SelectorButton type="button">Provincias</SelectorButton>
            </SelectorColumn>
            <SelectorColumn>
              <span>Distrito</span>
              <SelectorButton type="button">Distritos</SelectorButton>
            </SelectorColumn>
          </SelectorGrid>
        </Body>

        <Footer>
          <OutlineButton type="button" onClick={onPrevious}>
            <v.iconoflechaizquierda /> Regresar
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
  gap: 18px;
`;

const InputGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;

  input {
    border-radius: 14px;
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
    padding: 12px 16px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const GhostButton = styled.button`
  border: none;
  border-radius: 14px;
  padding: 0 26px;
  background: rgba(23, 224, 192, 0.15);
  color: #0c554a;
  font-weight: 700;
  cursor: pointer;
`;

const DualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
`;

const SelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  background: linear-gradient(120deg, #ffee58, #17e0c0);
  color: #04121d;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;