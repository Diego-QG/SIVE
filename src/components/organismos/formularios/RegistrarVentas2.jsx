import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  useUbicacionesStore,
  useUsuariosStore,
  useVentasStore,
} from "../../../index";

const DEFAULT_PAIS_ID = 1;
const SELECTOR_BORDER_COLOR = "#CBD5E1";

export function RegistrarVentas2({
  state,
  onClose,
  onNext,
  onPrevious,
  ventaDraftId,
  ventaTieneDatos,
}) {
  const { datausuarios } = useUsuariosStore();
  const { eliminarborrador } = useVentasStore();
  const {
    paises,
    departamentos,
    provincias,
    distritos,
    paisSeleccionado,
    departamentoSeleccionado,
    provinciaSeleccionada,
    distritoSeleccionado,
    cargarpaises,
    seleccionarpais,
    seleccionardepartamento,
    seleccionarprovincia,
    seleccionardistrito,
  } = useUbicacionesStore();
  const [isClosing, setIsClosing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    if (state) {
      setIsClosing(false);
    }
  }, [state]);

  useEffect(() => {
    if (!state) {
      return;
    }

    cargarpaises();
  }, [state, cargarpaises]);

  useEffect(() => {
    if (!state || paisSeleccionado || !paises.length) {
      return;
    }

    const defaultPais =
      paises.find((pais) => Number(pais.id) === DEFAULT_PAIS_ID) ?? null;

    if (defaultPais) {
      seleccionarpais(defaultPais);
    }
  }, [state, paisSeleccionado, paises, seleccionarpais]);

  if (!state) {
    return null;
  }

  const handleRequestClose = async () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);

    try {
      if (ventaDraftId && !ventaTieneDatos && datausuarios?.id) {
        await eliminarborrador({ _id_venta: ventaDraftId, _id_usuario: datausuarios.id });
      }

      onClose?.();
    } catch (error) {
      console.error(error);
      setIsClosing(false);
    }
  };

  const closeDropdown = () => setOpenDropdown(null);
  const toggleDropdown = (key, guardMessage) => {
    if (guardMessage) {
      toast.info(guardMessage);
      return;
    }

    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <Overlay>
      <Modal aria-busy={isClosing}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Datos del docente</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isClosing}>
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
            <InputGroup>
              <label>Nombre de IE</label>
              <input type="text" placeholder="" disabled />
            </InputGroup>
            <CountrySelectorWrapper>
              <Selector
                state={openDropdown === "pais"}
                funcion={() => toggleDropdown("pais")}
                texto1="País"
                texto2={paisSeleccionado?.nombre ?? "Perú"}
                color={SELECTOR_BORDER_COLOR}
                isPlaceholder={false}
                width="100%"
              />
              <ListaDesplegable
                state={openDropdown === "pais"}
                data={paises}
                funcion={seleccionarpais}
                setState={closeDropdown}
                width="100%"
                top="3.5rem"
                placement="top"
                emptyLabel="No hay países disponibles"
              />
            </CountrySelectorWrapper>
          </DualGrid>

          <LocationSelectorsGrid>
            <LocationDropdownWrapper>
              <Selector
                state={openDropdown === "departamento"}
                funcion={() =>
                  toggleDropdown(
                    "departamento",
                    paisSeleccionado ? null : "Selecciona un país antes",
                  )
                }
                texto1="Departamento"
                texto2={
                  departamentoSeleccionado?.nombre ??
                  (paisSeleccionado
                    ? "Selecciona un departamento"
                    : "Selecciona un país primero")
                }
                color={SELECTOR_BORDER_COLOR}
                isPlaceholder={!departamentoSeleccionado}
                width="100%"
              />
              <ListaDesplegable
                state={openDropdown === "departamento"}
                data={departamentos}
                funcion={seleccionardepartamento}
                setState={closeDropdown}
                width="100%"
                top="3.5rem"
                placement="top"
                emptyLabel={
                  paisSeleccionado
                    ? "No hay departamentos disponibles"
                    : "Selecciona un país primero"
                }
              />
            </LocationDropdownWrapper>
            <LocationDropdownWrapper>
              <Selector
                state={openDropdown === "provincia"}
                funcion={() =>
                  toggleDropdown(
                    "provincia",
                    departamentoSeleccionado
                      ? null
                      : "Selecciona un departamento antes",
                  )
                }
                texto1="Provincia"
                texto2={
                  provinciaSeleccionada?.nombre ??
                  (departamentoSeleccionado
                    ? "Selecciona una provincia"
                    : "Selecciona un departamento primero")
                }
                color={SELECTOR_BORDER_COLOR}
                isPlaceholder={!provinciaSeleccionada}
                width="100%"
              />
              <ListaDesplegable
                state={openDropdown === "provincia"}
                data={provincias}
                funcion={seleccionarprovincia}
                setState={closeDropdown}
                width="100%"
                top="3.5rem"
                placement="top"
                emptyLabel={
                  departamentoSeleccionado
                    ? "No hay provincias disponibles"
                    : "Selecciona un departamento primero"
                }
              />
            </LocationDropdownWrapper>
            <LocationDropdownWrapper>
              <Selector
                state={openDropdown === "distrito"}
                funcion={() =>
                  toggleDropdown(
                    "distrito",
                    provinciaSeleccionada
                      ? null
                      : "Selecciona una provincia antes",
                  )
                }
                texto1="Distrito"
                texto2={
                  distritoSeleccionado?.nombre ??
                  (provinciaSeleccionada
                    ? "Selecciona un distrito"
                    : "Selecciona una provincia primero")
                }
                color={SELECTOR_BORDER_COLOR}
                isPlaceholder={!distritoSeleccionado}
                width="100%"
              />
              <ListaDesplegable
                state={openDropdown === "distrito"}
                data={distritos}
                funcion={seleccionardistrito}
                setState={closeDropdown}
                width="100%"
                top="3.5rem"
                placement="top"
                emptyLabel={
                  provinciaSeleccionada
                    ? "No hay distritos disponibles"
                    : "Selecciona una provincia primero"
                }
              />
            </LocationDropdownWrapper>
          </LocationSelectorsGrid>
        </Body>

        <Footer>
          <OutlineButton type="button" onClick={onPrevious} disabled={isClosing}>
            <v.iconoflechaizquierda /> Regresar
          </OutlineButton>
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
  position: relative;
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

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
  align-items: flex-end;
`;

const LocationSelectorsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const DropdownWrapper = styled(ContainerSelector)`
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
`;

const CountrySelectorWrapper = styled(DropdownWrapper)`
  width: min(220px, 100%);
  justify-self: end;
  align-self: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-self: stretch;
  }
`;

const LocationDropdownWrapper = styled(DropdownWrapper)`
  flex: 1 1 150px;
  max-width: 210px;

  @media (max-width: 600px) {
    max-width: 100%;
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
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const ClosingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(4, 18, 29, 0.78);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: inherit;
  color: #fff;
  text-align: center;
  z-index: 10;
  padding: 24px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: ${spin} 0.8s linear infinite;
`;