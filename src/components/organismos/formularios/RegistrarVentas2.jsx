import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  buscarDocentePorTelefono,
  useDocentesStore,
  useEmpresaStore,
  useInstitucionesStore,
  useUbicacionesStore,
  useUsuariosStore,
  VentaInput,
} from "../../../index";
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
  onPersistChange,
  docenteForm,
  setDocenteForm,
  institucionForm,
  setInstitucionForm,
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
    institucionDraft,
    guardarinstitucionborrador,
    cargarinstitucionporventa,
    limpiarinstituciondraft,
  } = useInstitucionesStore();
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
  const [hasHydratedDocente, setHasHydratedDocente] = useState(false);
  const [hasHydratedInstitucion, setHasHydratedInstitucion] = useState(false);
  const [isPhoneReady, setIsPhoneReady] = useState(false);
  const [isDniReady, setIsDniReady] = useState(false);
  const [phoneLookupState, setPhoneLookupState] = useState("idle");
  const [isDocenteLocked, setIsDocenteLocked] = useState(false);
  const lastSavedSnapshotRef = useRef(null);

  const hasDocenteIdentifyingData = useMemo(
    () =>
      Boolean(nombres.trim()) ||
      Boolean(apellidoPaterno.trim()) ||
      Boolean(apellidoMaterno.trim()) ||
      Boolean(dniValue.trim()),
    [apellidoMaterno, apellidoPaterno, dniValue, nombres]
  );

  const phoneDigitsRequired = paisSeleccionado?.cant_numeros ?? null;
  const dniDigitsRequired = paisSeleccionado?.digitos_documento ?? null;
  const phoneCodeLabel = paisSeleccionado?.cod_llamada ?? "+51";
  const {
    phoneNumber = "",
    dniValue = "",
    nombres = "",
    apellidoPaterno = "",
    apellidoMaterno = "",
  } = docenteForm ?? {};
  const { codigoIe = "", nombreIe = "" } = institucionForm ?? {};

  const empresaId = useMemo(
    () => dataempresa?.id ?? datausuarios?.id_empresa ?? null,
    [dataempresa?.id, datausuarios?.id_empresa]
  );

  const updateDocenteField = (field, value) => {
    if (typeof setDocenteForm === "function") {
      setDocenteForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const updateInstitucionField = (field, value) => {
    if (typeof setInstitucionForm === "function") {
      setInstitucionForm((prev) => ({ ...prev, [field]: value }));
    }
  };

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

  const canEditDocenteFields =
    isPhoneReady && phoneLookupState !== "searching" && !isDocenteLocked;
  const canEditInstitutionFields =
    isPhoneReady && phoneLookupState !== "searching" && !isDocenteLocked;

  const phoneLookupMessage = useMemo(() => {
    if (phoneLookupState === "found") {
      return "Se encontraron registros. Datos cargados.";
    }

    if (phoneLookupState === "not-found") {
      return "No se encontraron registros. Estás registrando un nuevo docente.";
    }

    if (phoneLookupState === "searching") {
      return "Buscando docente por teléfono...";
    }

    return null;
  }, [phoneLookupState]);

  const institutionGuardMessage = useMemo(
    () => (!canEditInstitutionFields ? "Primero confirma el número de teléfono." : null),
    [canEditInstitutionFields]
  );

  const departamentoGuardMessage = useMemo(
    () => institutionGuardMessage ?? (paisSeleccionado ? null : "Selecciona un país antes"),
    [institutionGuardMessage, paisSeleccionado]
  );

  const provinciaGuardMessage = useMemo(
    () =>
      institutionGuardMessage ??
      (departamentoSeleccionado ? null : "Selecciona un departamento antes"),
    [departamentoSeleccionado, institutionGuardMessage]
  );

  const distritoGuardMessage = useMemo(
    () => institutionGuardMessage ?? (provinciaSeleccionada ? null : "Selecciona una provincia antes"),
    [institutionGuardMessage, provinciaSeleccionada]
  );

  const normalizeTextInput = (value) => (value ?? "").toUpperCase().trimStart();
  const handleUppercaseChange = (setter) => (event) => {
    const rawValue = event?.target?.value ?? "";
    setter(normalizeTextInput(rawValue));
  };

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

    updateDocenteField("phoneNumber", telefonoGuardado);
    setIsPhoneReady(
      Boolean(telefonoGuardado) &&
        (!phoneDigitsRequired || telefonoGuardado.length === phoneDigitsRequired)
    );

    updateDocenteField("dniValue", documentoGuardado);
    setIsDniReady(
      Boolean(documentoGuardado) &&
        (!dniDigitsRequired || documentoGuardado.length === dniDigitsRequired)
    );

    updateDocenteField("nombres", normalizeTextInput(docentedraft?.nombres));
    updateDocenteField("apellidoPaterno", normalizeTextInput(docentedraft?.apellido_p));
    updateDocenteField("apellidoMaterno", normalizeTextInput(docentedraft?.apellido_m));
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

    if (!ventaDraftId) {
      limpiarinstituciondraft();
      updateInstitucionField("codigoIe", "");
      updateInstitucionField("nombreIe", "");
      setHasHydratedInstitucion(false);
      return;
    }

    cargarinstitucionporventa({ _id_venta: ventaDraftId });
  }, [
    cargarinstitucionporventa,
    limpiarinstituciondraft,
    state,
    ventaDraftId,
  ]);

  useEffect(() => {
    if (!state || hasHydratedInstitucion) {
      return;
    }

    const codigoGuardado = institucionDraft?.cod_institucion ?? "";
    const nombreGuardado = institucionDraft?.nombre ?? "";

    updateInstitucionField(
      "codigoIe",
      codigoGuardado ? normalizeTextInput(`${codigoGuardado}`) : ""
    );
    updateInstitucionField("nombreIe", normalizeTextInput(nombreGuardado));

    if (institucionDraft) {
      setHasHydratedInstitucion(true);
    }
  }, [hasHydratedInstitucion, institucionDraft, state]);

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

    if (!isOpen) {
      setHasHydratedDocente(false);
      setHasHydratedInstitucion(false);
      lastSavedSnapshotRef.current = null;
    }
  }, [isOpen, state]);

  useEffect(() => {
    if (state || isOpen) {
      return;
    }

    setOpenDropdown(null);
    updateDocenteField("phoneNumber", "");
    updateDocenteField("dniValue", "");
    updateDocenteField("nombres", "");
    updateDocenteField("apellidoPaterno", "");
    updateDocenteField("apellidoMaterno", "");
    updateInstitucionField("codigoIe", "");
    updateInstitucionField("nombreIe", "");
    setIsPhoneReady(false);
    setIsDniReady(false);
    setHasHydratedDocente(false);
    setHasHydratedInstitucion(false);
    setPhoneLookupState("idle");
    setIsDocenteLocked(false);
  }, [isOpen, state]);

  useEffect(() => {
    if (!phoneNumber) {
      setPhoneLookupState("idle");
      setIsDocenteLocked(false);
    }
  }, [phoneNumber]);

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

    updateDocenteField("phoneNumber", phoneNumber.slice(0, phoneDigitsRequired));
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

    updateDocenteField("dniValue", dniValue.slice(0, dniDigitsRequired));
  }, [dniDigitsRequired, dniValue.length]);

  useEffect(() => {
    if (!state) {
      return;
    }

    cargarpaises();
  }, [state, cargarpaises]);

  useEffect(() => {
    if (!state || !institucionDraft) {
      return;
    }

    const sincronizarUbicaciones = async () => {
      const paisId = institucionDraft.id_pais ?? DEFAULT_PAIS_ID;

      if (
        paisId &&
        (!paisSeleccionado || Number(paisSeleccionado.id) !== Number(paisId))
      ) {
        await seleccionarpais(paisId);
      }

      if (institucionDraft.id_geo_nivel1) {
        await seleccionardepartamento(institucionDraft.id_geo_nivel1);
      }

      if (institucionDraft.id_geo_nivel2) {
        await seleccionarprovincia(institucionDraft.id_geo_nivel2);
      }

      if (institucionDraft.id_geo_nivel3) {
        seleccionardistrito(institucionDraft.id_geo_nivel3);
      }
    };

    sincronizarUbicaciones();
  }, [
    institucionDraft,
    paisSeleccionado,
    seleccionarpais,
    seleccionardepartamento,
    seleccionarprovincia,
    seleccionardistrito,
    state,
  ]);

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

  const resetInstitutionForm = useCallback(async () => {
    updateInstitucionField("codigoIe", "");
    updateInstitucionField("nombreIe", "");
    await seleccionardepartamento(null);
    await seleccionarprovincia(null);
    seleccionardistrito(null);
  }, [
    seleccionarprovincia,
    seleccionardepartamento,
    seleccionardistrito,
    updateInstitucionField,
  ]);

  const persistDocenteDraft = useCallback(async () => {
    if (!ventaDraftId || !empresaId || !isPhoneReady) {
      return false;
    }

    const isNewDocente = !docentedraft?.id && phoneLookupState === "not-found";

    if (isNewDocente && !hasDocenteIdentifyingData) {
      return false;
    }

    const payload = {
      _id_venta: ventaDraftId,
      _id_docente: docentedraft?.id ?? null,
      _id_empresa: empresaId,
      _id_pais: paisSeleccionado?.id ?? docentedraft?.id_pais ?? DEFAULT_PAIS_ID,
      _id_institucion: docentedraft?.id_institucion ?? institucionDraft?.id ?? null,
      telefono: phoneNumber || null,
      nro_doc: dniValue || null,
      nombres: nombres || null,
      apellido_p: apellidoPaterno || null,
      apellido_m: apellidoMaterno || null,
      shouldPersist: true,
    };

    const saved = await guardardocenteborrador(payload);

    if (saved) {
      onVentaTieneDatosChange?.("docente", true);
      return saved;
    }

    return null;
  }, [
    apellidoMaterno,
    apellidoPaterno,
    dniValue,
    docentedraft?.id,
    docentedraft?.id_institucion,
    docentedraft?.id_pais,
    empresaId,
    guardardocenteborrador,
    hasDocenteIdentifyingData,
    institucionDraft?.id,
    isPhoneReady,
    nombres,
    onVentaTieneDatosChange,
    paisSeleccionado?.id,
    phoneLookupState,
    phoneNumber,
    ventaDraftId,
  ]);

  const lookupDocenteByPhone = useCallback(async () => {
    if (!isPhoneReady || !empresaId || !ventaDraftId) {
      return null;
    }

    try {
      const existingDocente = await buscarDocentePorTelefono({
        telefono: phoneNumber,
        _id_empresa: empresaId,
      });

      if (existingDocente) {
        updateDocenteField("dniValue", existingDocente.nro_doc ? `${existingDocente.nro_doc}` : "");
        updateDocenteField("nombres", normalizeTextInput(existingDocente.nombres));
        updateDocenteField("apellidoPaterno", normalizeTextInput(existingDocente.apellido_p));
        updateDocenteField("apellidoMaterno", normalizeTextInput(existingDocente.apellido_m));
        setIsDniReady(Boolean(existingDocente.nro_doc));
        setIsDocenteLocked(true);
        setPhoneLookupState("found");

        await guardardocenteborrador({
          _id_venta: ventaDraftId,
          _id_docente: existingDocente.id,
          _id_empresa: empresaId,
          _id_pais:
            existingDocente.id_pais ?? paisSeleccionado?.id ?? docentedraft?.id_pais ?? DEFAULT_PAIS_ID,
          _id_institucion:
            existingDocente.id_institucion ?? institucionDraft?.id ?? docentedraft?.id_institucion ?? null,
          telefono: existingDocente.telefono ?? phoneNumber,
          nro_doc: existingDocente.nro_doc ?? null,
          nombres: existingDocente.nombres ?? null,
          apellido_p: existingDocente.apellido_p ?? null,
          apellido_m: existingDocente.apellido_m ?? null,
          shouldPersist: true,
        });

        return existingDocente;
      }

      setPhoneLookupState("not-found");
      setIsDocenteLocked(false);
      if (hasDocenteIdentifyingData) {
        await persistDocenteDraft();
      }
      return null;
    } catch (error) {
      console.error("[RegistrarVentas2] Error buscando docente", error);
      toast.error("No se pudo buscar el docente por teléfono.");
      setPhoneLookupState("idle");
      return null;
    }
  }, [
    empresaId,
    guardardocenteborrador,
    institucionDraft?.id,
    isPhoneReady,
    paisSeleccionado?.id,
    persistDocenteDraft,
    hasDocenteIdentifyingData,
    phoneNumber,
    docentedraft?.id_institucion,
    docentedraft?.id_pais,
    updateDocenteField,
    ventaDraftId,
  ]);

  const handleRequestClose = async () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);

    try {
      await autoSaveDocenteEInstitucion("modal-close");
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
    if (isDocenteLocked || docentedraft?.id) {
      limpiardocentedraft();
      updateDocenteField("dniValue", "");
      updateDocenteField("nombres", "");
      updateDocenteField("apellidoPaterno", "");
      updateDocenteField("apellidoMaterno", "");
      resetInstitutionForm();
      setIsDocenteLocked(false);
      setIsDniReady(false);
    }

    const rawValue = event.target.value ?? "";
    const digitsOnly = rawValue.replace(/\D/g, "");
    const maxDigits = phoneDigitsRequired ?? 15;
    updateDocenteField("phoneNumber", digitsOnly.slice(0, maxDigits));
    setIsPhoneReady(false);
    setPhoneLookupState("idle");
  };

  const handlePhoneBlur = async () => {
    if (isDocenteLocked) {
      return;
    }

    if (!phoneNumber) {
      setIsPhoneReady(false);
      setPhoneLookupState("idle");
      return;
    }

    if (phoneDigitsRequired && phoneNumber.length !== phoneDigitsRequired) {
      toast.warning(
        `La cantidad de dígitos del teléfono es inválida. Se requieren ${phoneDigitsRequired}.`
      );
      setIsPhoneReady(false);
      setPhoneLookupState("idle");
      return;
    }

    setIsPhoneReady(true);
  };

  useEffect(() => {
    if (!state || !isPhoneReady || phoneLookupState !== "idle") {
      return;
    }

    if (!empresaId || !ventaDraftId) {
      return;
    }

    const runLookup = async () => {
      setPhoneLookupState("searching");
      await lookupDocenteByPhone();
    };

    runLookup();
  }, [
    empresaId,
    isPhoneReady,
    lookupDocenteByPhone,
    phoneLookupState,
    state,
    ventaDraftId,
  ]);

  const handleDniChange = (event) => {
    const rawValue = event.target.value ?? "";
    const digitsOnly = rawValue.replace(/\D/g, "");
    const maxDigits = dniDigitsRequired ?? 12;
    updateDocenteField("dniValue", digitsOnly.slice(0, maxDigits));
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
    updateDocenteField("nombres", "");
    updateDocenteField("apellidoPaterno", "");
    updateDocenteField("apellidoMaterno", "");
    if (!isDocenteLocked) {
      persistDocenteDraft();
    }
  };
  const geoNivel1Id = departamentoSeleccionado?.id ?? null;
  const geoNivel2Id = provinciaSeleccionada?.id ?? null;
  const geoNivel3Id = distritoSeleccionado?.id ?? null;

  const hasInstitutionRequiredFields = useCallback(
    () =>
      Boolean(nombreIe.trim()) &&
      Boolean(geoNivel1Id) &&
      Boolean(geoNivel2Id) &&
      Boolean(geoNivel3Id),
    [geoNivel1Id, geoNivel2Id, geoNivel3Id, nombreIe]
  );

  const hasStartedInstitution = useCallback(
    () =>
      Boolean(codigoIe.trim()) ||
      Boolean(nombreIe.trim()) ||
      Boolean(geoNivel1Id) ||
      Boolean(geoNivel2Id) ||
      Boolean(geoNivel3Id),
    [codigoIe, geoNivel1Id, geoNivel2Id, geoNivel3Id, nombreIe]
  );

  const buildSnapshot = useCallback(() => {
    const telefonoGuardable =
      isPhoneReady && phoneNumber ? `${phoneNumber}` : null;
    const dniGuardable = isDniReady && dniValue ? `${dniValue}` : null;
    const nombresTrim = nombres.trim();
    const apellidoPTrim = apellidoPaterno.trim();
    const apellidoMTrim = apellidoMaterno.trim();
    const codigoIeTrim = codigoIe.trim();
    const nombreIeTrim = nombreIe.trim();
    const codigoGuardable =
      codigoIeTrim && /^\d+$/.test(codigoIeTrim)
        ? Number(codigoIeTrim)
        : null;

    const docenteSnapshot =
      telefonoGuardable ||
      dniGuardable ||
      nombresTrim ||
      apellidoPTrim ||
      apellidoMTrim
        ? {
            id_docente: docentedraft?.id ?? null,
            telefono: telefonoGuardable,
            nro_doc: dniGuardable,
            nombres: nombresTrim || null,
            apellido_p: apellidoPTrim || null,
            apellido_m: apellidoMTrim || null,
            id_pais:
              paisSeleccionado?.id ??
              docentedraft?.id_pais ??
              institucionDraft?.id_pais ??
              DEFAULT_PAIS_ID,
            id_institucion:
              docentedraft?.id_institucion ?? institucionDraft?.id ?? null,
          }
        : null;

    const institucionSnapshot = hasInstitutionRequiredFields()
      ? {
          id: institucionDraft?.id ?? null,
          cod_institucion: codigoGuardable,
          nombre: nombreIeTrim || null,
          id_pais:
            paisSeleccionado?.id ??
            institucionDraft?.id_pais ??
            docentedraft?.id_pais ??
            DEFAULT_PAIS_ID,
          id_geo_nivel1: geoNivel1Id,
          id_geo_nivel2: geoNivel2Id,
          id_geo_nivel3: geoNivel3Id,
        }
      : null;

    return { docente: docenteSnapshot, institucion: institucionSnapshot };
  }, [
    apellidoMaterno,
    apellidoPaterno,
    codigoIe,
    dniValue,
    docentedraft?.id,
    docentedraft?.id_institucion,
    docentedraft?.id_pais,
    geoNivel1Id,
    geoNivel2Id,
    geoNivel3Id,
    hasInstitutionRequiredFields,
    institucionDraft?.id,
    institucionDraft?.id_pais,
    isDniReady,
    isPhoneReady,
    nombreIe,
    nombres,
    paisSeleccionado?.id,
    phoneNumber,
  ]);

  useEffect(() => {
    if (!state) {
      return;
    }

    lastSavedSnapshotRef.current = buildSnapshot();
  }, [buildSnapshot, docentedraft, institucionDraft, state]);

  // Persistimos docente/IE automáticamente al cambiar de paso o cerrar el modal.
  const autoSaveDocenteEInstitucion = useCallback(
    async (reason = "auto") => {
      if (!ventaDraftId) {
        limpiardocentedraft();
        limpiarinstituciondraft();
        return true;
      }

      const shouldPersistInstitution = [
        "next",
        "previous",
        "modal-close",
        "on-finish",
      ].includes(reason ?? "");

      const savedDocente = await persistDocenteDraft();

      if (!shouldPersistInstitution) {
        return true;
      }

      if (!hasStartedInstitution()) {
        if (institucionDraft?.id) {
          await guardarinstitucionborrador({
            _id_institucion: institucionDraft.id,
            shouldPersist: false,
          });
          limpiarinstituciondraft();
        }

        return true;
      }

      if (!hasInstitutionRequiredFields()) {
        toast.error(
          "La institución no pudo guardarse porque faltan datos obligatorios (nombre, departamento, provincia y distrito)."
        );
        await resetInstitutionForm();
        limpiarinstituciondraft();
        return true;
      }

      try {
        const institutionPayload = {
          _id_institucion: institucionDraft?.id ?? null,
          cod_institucion: codigoIe.trim() || null,
          nombre: nombreIe.trim() || null,
          id_pais: paisSeleccionado?.id ?? DEFAULT_PAIS_ID,
          id_geo_nivel1: geoNivel1Id,
          id_geo_nivel2: geoNivel2Id,
          id_geo_nivel3: geoNivel3Id,
          shouldPersist: true,
        };

        const savedInstitution = await guardarinstitucionborrador(institutionPayload);

        if (!savedInstitution) {
          toast.error("La institución no pudo guardarse.");
          return false;
        }

        if (docentedraft?.id) {
          await guardardocenteborrador({
            _id_venta: ventaDraftId,
            _id_docente: docentedraft.id,
            _id_empresa: empresaId,
            _id_pais: paisSeleccionado?.id ?? docentedraft?.id_pais ?? DEFAULT_PAIS_ID,
            _id_institucion: savedInstitution.id,
            telefono: phoneNumber || null,
            nro_doc: dniValue || null,
            nombres: nombres || null,
            apellido_p: apellidoPaterno || null,
            apellido_m: apellidoMaterno || null,
            shouldPersist: true,
          });
        }

        lastSavedSnapshotRef.current = buildSnapshot();
        toast.success("La institución fue guardada de manera exitosa");
        onVentaTieneDatosChange?.("docente", Boolean(savedDocente || docentedraft?.id));
        return true;
      } catch (error) {
        console.error("[RegistrarVentas2] Auto guardado falló", { reason, error });
        toast.error("No se pudieron guardar los datos del docente automáticamente.");
        return false;
      }
    }, [
      apellidoMaterno,
      apellidoPaterno,
      buildSnapshot,
      codigoIe,
      departamentoSeleccionado,
      distritoSeleccionado,
      docentedraft?.id,
      guardarinstitucionborrador,
      guardardocenteborrador,
      hasStartedInstitution,
      hasInstitutionRequiredFields,
      institucionDraft?.id,
      limpiardocentedraft,
      limpiarinstituciondraft,
      dniValue,
      empresaId,
      geoNivel1Id,
      geoNivel2Id,
      geoNivel3Id,
      nombreIe,
      nombres,
      onVentaTieneDatosChange,
      paisSeleccionado?.id,
      persistDocenteDraft,
      phoneNumber,
      provinciaSeleccionada,
      resetInstitutionForm,
      ventaDraftId,
    ]);

  useEffect(() => {
    onBeforeCloseChange?.("step2", autoSaveDocenteEInstitucion);
    onPersistChange?.(autoSaveDocenteEInstitucion);
    return () => {
      onBeforeCloseChange?.("step2", null);
      onPersistChange?.(null);
    };
  }, [autoSaveDocenteEInstitucion, onBeforeCloseChange, onPersistChange]);

  const handleNavigate = useCallback(
    async (direction) => {
      await autoSaveDocenteEInstitucion(direction);

      if (direction === "next") {
        if (hasStartedInstitution() && !hasInstitutionRequiredFields()) {
          toast.info(
            "No se puede registrar la institución porque faltan datos obligatorios (nombre, departamento, provincia y distrito)."
          );
        }
        onNext?.();
        return;
      }

      if (direction === "previous") {
        onPrevious?.();
      }
    },
    [
      autoSaveDocenteEInstitucion,
      hasInstitutionRequiredFields,
      hasStartedInstitution,
      onNext,
      onPrevious,
    ]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Overlay $visible={state}>
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
                  funcion={() =>
                    toggleDropdown(
                      "phoneCode",
                      isDocenteLocked
                        ? "No se puede cambiar el teléfono de un docente existente."
                        : null
                    )
                  }
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
                placeholder="Número de teléfono"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                maxLength={phoneDigitsRequired ?? 15}
                inputMode="numeric"
                autoComplete="tel"
                disabled={isDocenteLocked}
              />
              {phoneLookupMessage && (
                <LookupStatus $status={phoneLookupState}>
                  {phoneLookupState === "searching" && <InlineSpinner />}
                  <span>{phoneLookupMessage}</span>
                </LookupStatus>
              )}
            </PhoneInputRow>
            <PhoneStatusRow>
              <FieldStatus $status={isPhoneReady ? "success" : "idle"}>
                {phoneStatusMessage}
              </FieldStatus>
            </PhoneStatusRow>
          </InputGroup>

          <InputRow>
            <DniInputGroup>
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
              disabled={!canEditDocenteFields}
            />
            <FieldStatus $status={isDniReady ? "success" : "idle"}>
              {dniStatusMessage}
            </FieldStatus>
          </DniInputGroup>
          <GhostButton type="button" disabled={!isDniReady || !canEditDocenteFields}>
            Consultar
          </GhostButton>
        </InputRow>

          <NameFieldsRow>
            <VentaInput
              label="Nombres"
              placeholder="Nombres completos"
              value={nombres}
              onChange={handleUppercaseChange((value) =>
                updateDocenteField("nombres", value)
              )}
              onBlur={persistDocenteDraft}
              disabled={isDniReady || !canEditDocenteFields}
            />
            <VentaInput
              label="Apellido paterno"
              placeholder="Apellido paterno"
              value={apellidoPaterno}
              onChange={handleUppercaseChange((value) =>
                updateDocenteField("apellidoPaterno", value)
              )}
              onBlur={persistDocenteDraft}
              disabled={isDniReady || !canEditDocenteFields}
            />
            <VentaInput
              label="Apellido materno"
              placeholder="Apellido materno"
              value={apellidoMaterno}
              onChange={handleUppercaseChange((value) =>
                updateDocenteField("apellidoMaterno", value)
              )}
              onBlur={persistDocenteDraft}
              disabled={isDniReady || !canEditDocenteFields}
            />
          </NameFieldsRow>

          <DualGrid>
            <VentaInput
              label="Código de IE"
              placeholder="Código de institución"
              value={codigoIe}
              onChange={handleUppercaseChange((value) =>
                updateInstitucionField("codigoIe", value)
              )}
              type="text"
              variant="solid"
              disabled={!canEditInstitutionFields}
            />
            <VentaInput
              label="Nombre de IE"
              placeholder="Nombre de institución"
              value={nombreIe}
              onChange={handleUppercaseChange((value) =>
                updateInstitucionField("nombreIe", value)
              )}
              type="text"
              variant="solid"
              disabled={!canEditInstitutionFields}
            />
            <CountrySelectorWrapper>
              <Selector
                state={openDropdown === "pais"}
                funcion={() => toggleDropdown("pais", institutionGuardMessage)}
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
                  toggleDropdown("departamento", departamentoGuardMessage)
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
                minWidth="180px"
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
                  toggleDropdown("provincia", provinciaGuardMessage)
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
                minWidth="180px"
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
                  toggleDropdown("distrito", distritoGuardMessage)
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
                minWidth="180px"
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
          <OutlineButton
            type="button"
            onClick={() => handleNavigate("previous")}
            disabled={isClosing}
          >
            <v.iconoflechaizquierda /> Regresar
          </OutlineButton>
          <PrimaryButton
            type="button"
            onClick={() => handleNavigate("next")}
            disabled={isClosing}
          >
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
  overflow-x: hidden;
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
  align-items: center;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const DniInputGroup = styled(InputGroup)`
  flex: 0 0 45%;
  max-width: 360px;

  @media (max-width: 560px) {
    flex: 1 1 auto;
    max-width: none;
  }
`;

const GhostButton = styled.button`
  border: none;
  border-radius: 14px;
  padding: 0 22px;
  background: rgba(23, 224, 192, 0.15);
  color: #0c554a;
  font-weight: 700;
  cursor: pointer;
  height: 26px;
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  width: 100%;
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
`;

const NameFieldsRow = styled(LocationSelectorsRow)`
  align-items: flex-end;
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
  flex: 0 1 220px;
  max-width: 240px;
  min-width: 180px;
  font-size: 1rem;
  padding: 12px 14px;
  line-height: 1.4;
`;

const PhoneStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const InputField = styled.input`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const FieldStatus = styled.small`
  font-size: 0.78rem;
  color: ${({ theme, $status }) =>
    $status === "success" ? "#0c554a" : `rgba(${theme.textRgba}, 0.65)`};
  opacity: ${({ $status }) => ($status === "success" ? 1 : 0.85)};
  font-weight: ${({ $status }) => ($status === "success" ? 600 : 500)};
`;

const LookupStatus = styled(FieldStatus)`
  color: ${({ $status }) =>
    $status === "found"
      ? "#0f9d58"
      : $status === "not-found"
        ? "#d93025"
        : "rgba(0, 0, 0, 0.55)"};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const InlineSpinner = styled(Spinner)`
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0.1);
  border-top-color: ${({ theme }) => `rgba(${theme.textRgba}, 0.9)`};
`;

const Footer = styled(ModalFooter)``;