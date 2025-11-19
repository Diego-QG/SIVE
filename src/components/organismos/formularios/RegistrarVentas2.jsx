import { useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  useDocentesStore,
  useEmpresaStore,
  useUbicacionesStore,
  useUsuariosStore,
} from "../../../index";

const DEFAULT_PAIS_ID = 1;
const SELECTOR_BORDER_COLOR = "#CBD5E1";

export function RegistrarVentas2({
  state,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  ventaDraftId,
  onVentaTieneDatosChange,
  onBeforeCloseChange,
}) {
  const { datausuarios } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();
  const {
    docentedraft,
    guardardocenteborrador,
    cargardocenteporventa,
    limpiardocentedraft,
  } = useDocentesStore();
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dniValue, setDniValue] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [isPhoneReady, setIsPhoneReady] = useState(false);
  const [isDniReady, setIsDniReady] = useState(false);
  const [hasHydratedDocente, setHasHydratedDocente] = useState(false);

  const phoneDigitsRequired = paisSeleccionado?.cant_numeros ?? null;
  const dniDigitsRequired = paisSeleccionado?.digitos_documento ?? null;
  const phoneCodeLabel = paisSeleccionado?.cod_llamada ?? "+51";

  const phoneStatusMessage = useMemo(() => {
    if (isPhoneReady) {
      return "Número listo para guardarse.";
    }

    if (!phoneNumber) {
      return phoneDigitsRequired
        ? `Se requieren ${phoneDigitsRequired} dígitos.`
        : "Ingresa un número de teléfono.";
    }

    if (!phoneDigitsRequired) {
      return `${phoneNumber.length} dígitos ingresados.`;
    }

    return `${phoneNumber.length}/${phoneDigitsRequired} dígitos.`;
  }, [isPhoneReady, phoneDigitsRequired, phoneNumber]);

  const dniStatusMessage = useMemo(() => {
    if (isDniReady) {
      return "DNI listo para consultar.";
    }

    if (!dniValue) {
      return dniDigitsRequired
        ? `Se requieren ${dniDigitsRequired} dígitos.`
        : "Ingresa el documento del docente.";
    }

    if (!dniDigitsRequired) {
      return `${dniValue.length} dígitos ingresados.`;
    }

    return `${dniValue.length}/${dniDigitsRequired} dígitos.`;
  }, [dniDigitsRequired, dniValue, isDniReady]);

  useEffect(() => {
    if (!state || hasHydratedDocente) {
      return;
    }

    if (
      docentedraft?.id_pais &&
      (!paisSeleccionado ||
        Number(paisSeleccionado.id) !== Number(docentedraft.id_pais))
    ) {
      return;
    }

    const telefonoGuardado = `${docentedraft?.telefono ?? ""}`;
    const documentoGuardado = docentedraft?.nro_doc
      ? `${docentedraft.nro_doc}`
      : "";

    setPhoneNumber(telefonoGuardado);
    setIsPhoneReady(
      Boolean(telefonoGuardado) &&
        (!phoneDigitsRequired || telefonoGuardado.length === phoneDigitsRequired)
    );

    setDniValue(documentoGuardado);
    setIsDniReady(
      Boolean(documentoGuardado) &&
        (!dniDigitsRequired || documentoGuardado.length === dniDigitsRequired)
    );

    setNombres(docentedraft?.nombres ?? "");
    setApellidoPaterno(docentedraft?.apellido_p ?? "");
    setApellidoMaterno(docentedraft?.apellido_m ?? "");
    setHasHydratedDocente(true);
  }, [
    docentedraft,
    dniDigitsRequired,
    hasHydratedDocente,
    paisSeleccionado,
    phoneDigitsRequired,
    state,
  ]);

  useEffect(() => {
    if (!state) {
      return;
    }

    const persistedHasInfo = Boolean(
      docentedraft?.telefono ||
        docentedraft?.nro_doc ||
        docentedraft?.nombres ||
        docentedraft?.apellido_p ||
        docentedraft?.apellido_m
    );

    onVentaTieneDatosChange?.("docente", persistedHasInfo);
  }, [docentedraft, onVentaTieneDatosChange, state]);

  useEffect(() => {
    if (state) {
      setIsClosing(false);
      return;
    }

    setHasHydratedDocente(false);
  }, [state]);

  useEffect(() => {
    if (state) {
      return;
    }

    setOpenDropdown(null);
    setPhoneNumber("");
    setDniValue("");
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setIsPhoneReady(false);
    setIsDniReady(false);
    setHasHydratedDocente(false);
  }, [state]);

  useEffect(() => {
    if (!phoneNumber) {
      setIsPhoneReady(false);
      return;
    }

    if (phoneDigitsRequired && phoneNumber.length !== phoneDigitsRequired) {
      setIsPhoneReady(false);
    }
  }, [phoneDigitsRequired, phoneNumber]);

  useEffect(() => {
    if (!phoneDigitsRequired || phoneNumber.length <= phoneDigitsRequired) {
      return;
    }

    setPhoneNumber((prev) => prev.slice(0, phoneDigitsRequired));
  }, [phoneDigitsRequired, phoneNumber.length]);

  useEffect(() => {
    if (!dniValue) {
      setIsDniReady(false);
      return;
    }

    if (dniDigitsRequired && dniValue.length !== dniDigitsRequired) {
      setIsDniReady(false);
    }
  }, [dniDigitsRequired, dniValue]);

  useEffect(() => {
    if (!dniDigitsRequired || dniValue.length <= dniDigitsRequired) {
      return;
    }

    setDniValue((prev) => prev.slice(0, dniDigitsRequired));
  }, [dniDigitsRequired, dniValue.length]);

  useEffect(() => {
    if (!state) {
      return;
    }

    cargarpaises();
  }, [state, cargarpaises]);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (!ventaDraftId) {
      limpiardocentedraft();
      setHasHydratedDocente(false);
      return;
    }

    setHasHydratedDocente(false);
    cargardocenteporventa({ _id_venta: ventaDraftId });
  }, [state, ventaDraftId, cargardocenteporventa, limpiardocentedraft]);

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

  useEffect(() => {
    if (
      !state ||
      hasHydratedDocente ||
      !docentedraft?.id_pais ||
      !Array.isArray(paises) ||
      !paises.length
    ) {
      return;
    }

    if (
      paisSeleccionado &&
      Number(paisSeleccionado.id) === Number(docentedraft.id_pais)
    ) {
      return;
    }

    const matchedPais = paises.find(
      (pais) => Number(pais.id) === Number(docentedraft.id_pais)
    );

    if (matchedPais) {
      seleccionarpais(matchedPais);
    }
  }, [
    docentedraft?.id_pais,
    hasHydratedDocente,
    paisSeleccionado,
    paises,
    seleccionarpais,
    state,
  ]);

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

  const closeDropdown = () => setOpenDropdown(null);
  const toggleDropdown = (key, guardMessage) => {
    if (guardMessage) {
      toast.info(guardMessage);
      return;
    }

    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handlePhoneChange = (event) => {
    const rawValue = event.target.value ?? "";
    const digitsOnly = rawValue.replace(/\D/g, "");
    const maxDigits = phoneDigitsRequired ?? 15;
    setPhoneNumber(digitsOnly.slice(0, maxDigits));
    setIsPhoneReady(false);
  };

  const handlePhoneBlur = () => {
    if (!phoneNumber) {
      setIsPhoneReady(false);
      return;
    }

    if (phoneDigitsRequired && phoneNumber.length !== phoneDigitsRequired) {
      toast.warning(
        `La cantidad de dígitos del teléfono es inválida. Se requieren ${phoneDigitsRequired}.`
      );
      setIsPhoneReady(false);
      return;
    }

    setIsPhoneReady(true);
  };

  const handleDniChange = (event) => {
    const rawValue = event.target.value ?? "";
    const digitsOnly = rawValue.replace(/\D/g, "");
    const maxDigits = dniDigitsRequired ?? 12;
    setDniValue(digitsOnly.slice(0, maxDigits));
    setIsDniReady(false);
  };

  const handleDniBlur = () => {
    if (!dniValue) {
      setIsDniReady(false);
      return;
    }

    if (dniDigitsRequired && dniValue.length !== dniDigitsRequired) {
      toast.warning(
        `La cantidad de dígitos del documento es inválida. Se requieren ${dniDigitsRequired}.`
      );
      setIsDniReady(false);
      return;
    }

    setIsDniReady(true);
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
  };

  const handleBeforeClose = useCallback(async () => {
    if (!ventaDraftId) {
      limpiardocentedraft();
      return;
    }

    const telefonoGuardable = isPhoneReady && phoneNumber ? phoneNumber : null;
    const dniGuardable = isDniReady && dniValue ? dniValue : null;
    const nombresTrim = nombres.trim();
    const apellidoPTrim = apellidoPaterno.trim();
    const apellidoMTrim = apellidoMaterno.trim();

    const shouldPersist =
      Boolean(telefonoGuardable) ||
      Boolean(dniGuardable) ||
      Boolean(nombresTrim) ||
      Boolean(apellidoPTrim) ||
      Boolean(apellidoMTrim);

    if (!shouldPersist) {
      await guardardocenteborrador({
        _id_venta: ventaDraftId,
        _id_docente: docentedraft?.id ?? null,
        shouldPersist: false,
      });
      onVentaTieneDatosChange?.("docente", false);
      limpiardocentedraft();
      return;
    }

    const empresaId = dataempresa?.id ?? datausuarios?.id_empresa ?? null;

    if (!empresaId) {
      toast.error("No se pudo determinar la empresa del docente.");
      return;
    }

    const savedDocente = await guardardocenteborrador({
      _id_venta: ventaDraftId,
      _id_docente: docentedraft?.id ?? null,
      _id_empresa: empresaId,
      _id_pais: paisSeleccionado?.id ?? docentedraft?.id_pais ?? DEFAULT_PAIS_ID,
      telefono: telefonoGuardable,
      nro_doc: dniGuardable,
      nombres: nombresTrim || null,
      apellido_p: apellidoPTrim || null,
      apellido_m: apellidoMTrim || null,
      shouldPersist: true,
    });

    if (savedDocente) {
      onVentaTieneDatosChange?.("docente", true);
    }
  }, [
    apellidoMaterno,
    apellidoPaterno,
    dataempresa?.id,
    datausuarios?.id_empresa,
    docentedraft?.id,
    docentedraft?.id_pais,
    dniValue,
    guardardocenteborrador,
    isDniReady,
    isPhoneReady,
    limpiardocentedraft,
    nombres,
    onVentaTieneDatosChange,
    paisSeleccionado?.id,
    phoneNumber,
    ventaDraftId,
  ]);

  useEffect(() => {
    if (!state) {
      onBeforeCloseChange?.("step2", null);
      return;
    }

    onBeforeCloseChange?.("step2", handleBeforeClose);
    return () => onBeforeCloseChange?.("step2", null);
  }, [handleBeforeClose, onBeforeCloseChange, state]);

  if (!isOpen) {
    return null;
  }

  return (
    <Overlay $visible={state} inert={!state}>
      <Modal aria-busy={isClosing} $visible={state}>
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
            <PhoneInputRow>
              <PhoneCodeSelectorSlot>
                <Selector
                  state={openDropdown === "phoneCode"}
                  funcion={() => toggleDropdown("phoneCode")}
                  texto1=""
                  texto2={phoneCodeLabel}
                  color={SELECTOR_BORDER_COLOR}
                  isPlaceholder={false}
                  width="auto"
                  minWidth="88px"
                />
                <ListaDesplegable
                  state={openDropdown === "phoneCode"}
                  data={paises}
                  funcion={seleccionarpais}
                  setState={closeDropdown}
                  width="260px"
                  top="3.3rem"
                  placement="bottom"
                  emptyLabel="No hay códigos disponibles"
                />
              </PhoneCodeSelectorSlot>
              <PhoneNumberField
                type="tel"
                placeholder="Número sin código"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                maxLength={phoneDigitsRequired ?? 15}
                inputMode="numeric"
                autoComplete="tel"
              />
            </PhoneInputRow>
            <FieldStatus $status={isPhoneReady ? "success" : "idle"}>
              {phoneStatusMessage}
            </FieldStatus>
          </InputGroup>

          <InputRow>
            <InputGroup>
              <label>DNI</label>
              <InputField
                type="text"
                placeholder="Número de documento"
                value={dniValue}
                onChange={handleDniChange}
                onBlur={handleDniBlur}
                maxLength={dniDigitsRequired ?? 12}
                inputMode="numeric"
                autoComplete="off"
              />
              <FieldStatus $status={isDniReady ? "success" : "idle"}>
                {dniStatusMessage}
              </FieldStatus>
            </InputGroup>
            <GhostButton type="button" disabled={!isDniReady}>
              Consultar
            </GhostButton>
          </InputRow>

          <DualGrid>
            <InputGroup>
              <label>Nombres</label>
              <InputField
                type="text"
                placeholder="Nombres completos"
                value={nombres}
                onChange={(event) => setNombres(event.target.value)}
                disabled={isDniReady}
                autoComplete="off"
              />
            </InputGroup>
            <InputGroup>
              <label>Apellido paterno</label>
              <InputField
                type="text"
                placeholder="Apellido paterno"
                value={apellidoPaterno}
                onChange={(event) => setApellidoPaterno(event.target.value)}
                disabled={isDniReady}
                autoComplete="off"
              />
            </InputGroup>
            <InputGroup>
              <label>Apellido materno</label>
              <InputField
                type="text"
                placeholder="Apellido materno"
                value={apellidoMaterno}
                onChange={(event) => setApellidoMaterno(event.target.value)}
                disabled={isDniReady}
                autoComplete="off"
              />
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
                width="auto"
                minWidth="120px"
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

          <LocationSelectorsRow>
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
                width="auto"
                minWidth="200px"
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
                width="auto"
                minWidth="200px"
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
                width="auto"
                minWidth="200px"
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
          </LocationSelectorsRow>
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
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
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
  flex: 1 1 0;
  min-width: 0;

  input {
    border-radius: 14px;
    border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
    padding: 12px 16px;
    background: rgba(${({ theme }) => theme.textRgba}, 0.04);
    color: ${({ theme }) => theme.text};
    font-weight: 500;
  }

  input::placeholder {
    color: rgba(${({ theme }) => theme.textRgba}, 0.55);
  }

  input:disabled {
    opacity: 0.65;
    cursor: not-allowed;
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
  min-height: 44px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
  align-items: flex-end;
  justify-items: stretch;
`;

const LocationSelectorsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  gap: 15px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
`;

const DropdownWrapper = styled(ContainerSelector)`
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  user-select: none;
`;

const CountrySelectorWrapper = styled(DropdownWrapper)`
  width: auto;
  justify-self: end;
  align-self: flex-end;
  margin-left: auto;
  margin-top: 8px;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-self: stretch;
    margin-left: 0;
    margin-top: 0;
  }
`;

const LocationDropdownWrapper = styled(DropdownWrapper)`
  width: 100%;
  flex: 0 1 auto;
  min-width: 0;

  @media (max-width: 720px) {
    width: 100%;
    flex: 1 1 100%;
  }
`;

const PhoneInputRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-wrap: wrap;
`;

const PhoneCodeSelectorSlot = styled(ContainerSelector)`
  width: auto;
  min-width: 88px;
  flex: 0 0 auto;
`;

const PhoneNumberField = styled.input`
  flex: 1 1 200px;
  max-width: 280px;
`;

const InputField = styled.input`
  width: 100%;
`;

const FieldStatus = styled.small`
  font-size: 0.78rem;
  color: ${({ theme, $status }) =>
    $status === "success" ? "#0c554a" : `rgba(${theme.textRgba}, 0.65)`};
  opacity: ${({ $status }) => ($status === "success" ? 1 : 0.85)};
  font-weight: ${({ $status }) => ($status === "success" ? 600 : 500)};
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