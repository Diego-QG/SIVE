import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { v } from "../../../styles/variables";
import { RegistroVentaStepper } from "../../moleculas/RegistroVentaStepper";
import {
  ContainerSelector,
  ListaDesplegable,
  Selector,
  Spinner,
  useEmpresaStore,
  useUsuariosStore,
  useVentasStore,
  buscarDocentePorTelefono,
  useDocentesStore,
  useInstitucionesStore,
  useUbicacionesStore,
  VentaInput,
} from "../../../index";
import {
  ClosingOverlay,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  Overlay,
  PrimaryButton,
} from "./RegistroVentaModalLayout";

const DEFAULT_PAIS_ID = 1;
const SELECTOR_BORDER_COLOR = "#CBD5E1";

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
  // Docente props passed from parent
  docenteForm,
  setDocenteForm,
  institucionForm,
  setInstitucionForm,
}) {
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { insertarborrador } = useVentasStore();

  // --- Docente State ---
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
  const [isLoadingDraftData, setIsLoadingDraftData] = useState(false);

  // Docente Local State
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hasHydratedDocente, setHasHydratedDocente] = useState(false);
  const [hasHydratedInstitucion, setHasHydratedInstitucion] = useState(false);
  const [isPhoneReady, setIsPhoneReady] = useState(false);
  const [isDniReady, setIsDniReady] = useState(false);
  const [phoneLookupState, setPhoneLookupState] = useState("idle");
  const [isDocenteLocked, setIsDocenteLocked] = useState(false);
  const lastSavedSnapshotRef = useRef(null);

  // Form values
  const {
    phoneNumber = "",
    dniValue = "",
    nombres = "",
    apellidoPaterno = "",
    apellidoMaterno = "",
  } = docenteForm ?? {};
  const { codigoIe = "", nombreIe = "" } = institucionForm ?? {};

  const isLoadingInitialData = isEditing && isLoadingDraftData;

  const empresaId = useMemo(
    () => dataempresa?.id ?? datausuarios?.id_empresa ?? null,
    [dataempresa?.id, datausuarios?.id_empresa]
  );

  const defaultPais = useMemo(
    () => paises.find((pais) => Number(pais.id) === Number(DEFAULT_PAIS_ID)) ?? null,
    [paises]
  );
  const phoneDigitsRequired = paisSeleccionado?.cant_numeros ?? defaultPais?.cant_numeros ?? null;
  const dniDigitsRequired = paisSeleccionado?.digitos_documento ?? defaultPais?.digitos_documento ?? null;
  const phoneCodeLabel = paisSeleccionado?.cod_llamada ?? defaultPais?.cod_llamada ?? "+51";

  // --- Docente Logic Helpers ---

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

  const normalizeTextInput = (value) => (value ?? "").toUpperCase().trimStart();
  const handleUppercaseChange = (setter) => (event) => {
    const rawValue = event?.target?.value ?? "";
    setter(normalizeTextInput(rawValue));
  };

  const hasDocenteIdentifyingData = useMemo(
    () =>
      Boolean(nombres.trim()) ||
      Boolean(apellidoPaterno.trim()) ||
      Boolean(apellidoMaterno.trim()) ||
      Boolean(dniValue.trim()),
    [apellidoMaterno, apellidoPaterno, dniValue, nombres]
  );

  const canEditDocenteFields =
    isPhoneReady && phoneLookupState !== "searching" && !isDocenteLocked;
  const canEditInstitutionFields =
    isPhoneReady && phoneLookupState !== "searching" && !isDocenteLocked;

  const phoneStatusMessage = useMemo(() => {
    if (isPhoneReady) return "Número listo para guardarse.";
    if (!phoneNumber) return phoneDigitsRequired ? `Se requieren ${phoneDigitsRequired} dígitos.` : "Ingresa un número de teléfono.";
    if (!phoneDigitsRequired) return `${phoneNumber.length} dígitos ingresados.`;
    return `${phoneNumber.length}/${phoneDigitsRequired} dígitos.`;
  }, [isPhoneReady, phoneDigitsRequired, phoneNumber]);

  const dniStatusMessage = useMemo(() => {
    if (isDniReady) return "DNI listo para consultar.";
    if (!dniValue) return dniDigitsRequired ? `Se requieren ${dniDigitsRequired} dígitos.` : "Ingresa el documento del docente.";
    if (!dniDigitsRequired) return `${dniValue.length} dígitos ingresados.`;
    return `${dniValue.length}/${dniDigitsRequired} dígitos.`;
  }, [dniDigitsRequired, dniValue, isDniReady]);

  const phoneLookupMessage = useMemo(() => {
    if (phoneLookupState === "found") return "Se encontraron registros. Datos cargados.";
    if (phoneLookupState === "not-found") return "No se encontraron registros. Estás registrando un nuevo docente.";
    if (phoneLookupState === "searching") return "Buscando docente por teléfono...";
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
    () => institutionGuardMessage ?? (departamentoSeleccionado ? null : "Selecciona un departamento antes"),
    [departamentoSeleccionado, institutionGuardMessage]
  );

  const distritoGuardMessage = useMemo(
    () => institutionGuardMessage ?? (provinciaSeleccionada ? null : "Selecciona una provincia antes"),
    [institutionGuardMessage, provinciaSeleccionada]
  );

  const closeDropdown = () => setOpenDropdown(null);
  const toggleDropdown = (key, guardMessage) => {
    if (guardMessage) {
      toast.info(guardMessage);
      return;
    }
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const shouldBlockLocationSelection = (guardMessage) => {
    if (guardMessage) {
      toast.info(guardMessage);
      return true;
    }
    return false;
  };

  const seleccionarDepartamentoSeguro = async (value) => {
    if (shouldBlockLocationSelection(departamentoGuardMessage)) return;
    await seleccionardepartamento(value);
    await seleccionarprovincia(null);
    seleccionardistrito(null);
    closeDropdown();
  };

  const seleccionarProvinciaSeguro = async (value) => {
    if (shouldBlockLocationSelection(provinciaGuardMessage)) return;
    await seleccionarprovincia(value);
    seleccionardistrito(null);
    closeDropdown();
  };

  const seleccionarDistritoSeguro = (value) => {
    if (shouldBlockLocationSelection(distritoGuardMessage)) return;
    seleccionardistrito(value);
    closeDropdown();
  };

  const buildTelefonoCompleto = useCallback(
    () =>
      phoneNumber
        ? `${phoneCodeLabel ? `${phoneCodeLabel} ` : ""}${phoneNumber}`.trim()
        : null,
    [phoneCodeLabel, phoneNumber]
  );

  const parseTelefonoConCodigo = useCallback(
    (telefonoRaw) => {
      const raw = `${telefonoRaw ?? ""}`.trim();
      if (!raw) return { digits: "", paisId: null };

      const paisCoincidente = paises.find(
        (pais) => pais.cod_llamada && raw.startsWith(pais.cod_llamada)
      );

      if (paisCoincidente) {
        const remaining = raw.slice(paisCoincidente.cod_llamada.length).replace(/\D/g, "");
        return { digits: remaining, paisId: paisCoincidente.id };
      }

      return { digits: raw.replace(/\D/g, ""), paisId: null };
    },
    [paises]
  );

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
    // updateInstitucionField
  ]);

  const handleResetForm = useCallback(() => {
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
    setPhoneLookupState("idle");
    setIsDocenteLocked(false);
    setHasHydratedDocente(false);
    setHasHydratedInstitucion(false);
    limpiardocentedraft();
    limpiarinstituciondraft();
    resetInstitutionForm();
  }, [
    limpiardocentedraft,
    limpiarinstituciondraft,
    resetInstitutionForm,
    // updateDocenteField,
    // updateInstitucionField,
  ]);

  // --- Persistencia y búsqueda Docente ---

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
      telefono: buildTelefonoCompleto(),
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
    apellidoMaterno, apellidoPaterno, dniValue, docentedraft, empresaId,
    guardardocenteborrador, hasDocenteIdentifyingData, institucionDraft,
    isPhoneReady, nombres, onVentaTieneDatosChange, paisSeleccionado,
    phoneLookupState, phoneNumber, ventaDraftId, buildTelefonoCompleto
  ]);

  const lookupDocenteByPhone = useCallback(async () => {
    if (!isPhoneReady || !empresaId || !ventaDraftId) return null;

    try {
      const telefonoCompleto = buildTelefonoCompleto();

      let existingDocente = await buscarDocentePorTelefono({
          telefono: telefonoCompleto ?? phoneNumber,
        _id_empresa: empresaId,
      });

      if (!existingDocente && telefonoCompleto && telefonoCompleto !== phoneNumber) {
        existingDocente = await buscarDocentePorTelefono({
          telefono: telefonoCompleto ?? phoneNumber,
          _id_empresa: empresaId,
        });
      }

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
          _id_pais: existingDocente.id_pais ?? paisSeleccionado?.id ?? docentedraft?.id_pais ?? DEFAULT_PAIS_ID,
          _id_institucion: existingDocente.id_institucion ?? institucionDraft?.id ?? docentedraft?.id_institucion ?? null,
          telefono: existingDocente.telefono ?? telefonoCompleto ?? phoneNumber,
          nro_doc: existingDocente.nro_doc ?? null,
          nombres: existingDocente.nombres ?? null,
          apellido_p: existingDocente.apellido_p ?? null,
          apellido_m: existingDocente.apellido_m ?? null,
          shouldPersist: true,
        });
        onVentaTieneDatosChange?.("docente", true);
        return existingDocente;
      }

      setPhoneLookupState("not-found");
      setIsDocenteLocked(false);
      if (hasDocenteIdentifyingData) {
        await persistDocenteDraft();
      }
      return null;
    } catch (error) {
      toast.error("No se pudo buscar el docente por teléfono.");
      setPhoneLookupState("idle");
      return null;
    }
  }, [
    empresaId, guardardocenteborrador, isPhoneReady, paisSeleccionado, persistDocenteDraft,
    hasDocenteIdentifyingData, phoneNumber, docentedraft, institucionDraft, ventaDraftId,
    buildTelefonoCompleto, onVentaTieneDatosChange
  ]);

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

  const handlePhoneCodeChange = async (event) => {
    if (isDocenteLocked) return;
    const paisId = event.target.value || defaultPais?.id || null;
    await seleccionarpais(paisId);
    setIsPhoneReady(false);
    setPhoneLookupState("idle");
  };

  const handlePhoneBlur = async () => {
    if (isDocenteLocked) return;
    if (!phoneNumber) {
      setIsPhoneReady(false);
      setPhoneLookupState("idle");
      return;
    }
    if (phoneDigitsRequired && phoneNumber.length !== phoneDigitsRequired) {
      toast.warning(`Se requieren ${phoneDigitsRequired} dígitos.`);
      setIsPhoneReady(false);
      setPhoneLookupState("idle");
      return;
    }
    setIsPhoneReady(true);
  };

  useEffect(() => {
    if (!state || !isPhoneReady || phoneLookupState !== "idle" || !empresaId || !ventaDraftId) return;
    const runLookup = async () => {
      setPhoneLookupState("searching");
      await lookupDocenteByPhone();
    };
    runLookup();
  }, [isPhoneReady, phoneLookupState, state, empresaId, ventaDraftId, lookupDocenteByPhone]);

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
      toast.warning(`Se requieren ${dniDigitsRequired} dígitos.`);
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

  // --- Auto Save Docente/Institucion ---

  const autoSaveDocenteEInstitucion = useCallback(async () => {
    if (!ventaDraftId) {
      limpiardocentedraft();
      limpiarinstituciondraft();
      return true;
    }

    const savedDocente = await persistDocenteDraft();

    if (!hasStartedInstitution()) {
      if (institucionDraft?.id) {
        await guardarinstitucionborrador({ _id_institucion: institucionDraft.id, shouldPersist: false });
        limpiarinstituciondraft();
      }
      return true;
    }

    if (!hasInstitutionRequiredFields()) {
      toast.error("La institución no pudo guardarse porque faltan datos obligatorios.");
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
          telefono: buildTelefonoCompleto(),
          nro_doc: dniValue || null,
          nombres: nombres || null,
          apellido_p: apellidoPaterno || null,
          apellido_m: apellidoMaterno || null,
          shouldPersist: true,
        });
      }

      toast.success("La institución fue guardada de manera exitosa");
      onVentaTieneDatosChange?.("docente", Boolean(savedDocente || docentedraft?.id));
      return true;
    } catch (error) {
      toast.error("Error al guardar datos.");
      return false;
    }
  }, [
    ventaDraftId, persistDocenteDraft, hasStartedInstitution, hasInstitutionRequiredFields,
    institucionDraft, resetInstitutionForm, limpiarinstituciondraft, codigoIe, nombreIe,
    paisSeleccionado, geoNivel1Id, geoNivel2Id, geoNivel3Id, guardarinstitucionborrador,
    docentedraft, guardardocenteborrador, empresaId, phoneNumber, dniValue, nombres,
    apellidoPaterno, apellidoMaterno, onVentaTieneDatosChange
  ]);

  useEffect(() => {
    onBeforeCloseChange?.("step1", autoSaveDocenteEInstitucion);
    return () => onBeforeCloseChange?.("step1", null);
  }, [autoSaveDocenteEInstitucion, onBeforeCloseChange]);

  // --- Initial Data Loading & Draft Management ---

  useEffect(() => {
    if (state) {
      setIsClosing(false);
      cargarpaises();
    }
  }, [state, cargarpaises]);

  // Create draft on open if needed
  useEffect(() => {
    let isCancelled = false;
    const crearBorrador = async () => {
      if (!state || ventaDraftId || !datausuarios?.id) return;

      onDraftCreationStateChange?.(true);
      const nuevoId = await insertarborrador({ _id_usuario: datausuarios.id });
      onDraftCreationStateChange?.(false);

      if (isCancelled || !nuevoId) return;

      onDraftCreated?.(nuevoId);
    };
    crearBorrador();
    return () => { isCancelled = true; };
  }, [state, ventaDraftId, datausuarios?.id, insertarborrador, onDraftCreated, onDraftCreationStateChange]);

  // Load existing draft data
  useEffect(() => {
    if (!state || !ventaDraftId || !isEditing) {
      setIsLoadingDraftData(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingDraftData(true);

    const cargarDatos = async () => {
      await cargardocenteporventa({ _id_venta: ventaDraftId });
      await cargarinstitucionporventa({ _id_venta: ventaDraftId });
      if (!isCancelled) setIsLoadingDraftData(false);
    };

    cargarDatos();
    return () => { isCancelled = true; };
  }, [state, ventaDraftId, isEditing, cargardocenteporventa, cargarinstitucionporventa]);

  // Restore Docente fields when data is loaded
  useEffect(() => {
    if (!state || hasHydratedDocente || !paises.length) return;
    if (docentedraft?.id_pais && (!paisSeleccionado || Number(paisSeleccionado.id) !== Number(docentedraft.id_pais))) return;

    const telefonoGuardado = `${docentedraft?.telefono ?? ""}`;
    const documentoGuardado = docentedraft?.nro_doc ? `${docentedraft.nro_doc}` : "";

    const { digits: telefonoDigits, paisId: telefonoPaisId } = parseTelefonoConCodigo(telefonoGuardado);

    if (
      telefonoPaisId &&
      (!paisSeleccionado || Number(paisSeleccionado.id) !== Number(telefonoPaisId))
    ) {
      seleccionarpais(telefonoPaisId);
      return;
    }

    updateDocenteField("phoneNumber", telefonoDigits);
    setIsPhoneReady(
      Boolean(telefonoDigits) && (!phoneDigitsRequired || telefonoDigits.length === phoneDigitsRequired)
    );

    updateDocenteField("dniValue", documentoGuardado);
    setIsDniReady(Boolean(documentoGuardado) && (!dniDigitsRequired || documentoGuardado.length === dniDigitsRequired));

    updateDocenteField("nombres", normalizeTextInput(docentedraft?.nombres));
    updateDocenteField("apellidoPaterno", normalizeTextInput(docentedraft?.apellido_p));
    updateDocenteField("apellidoMaterno", normalizeTextInput(docentedraft?.apellido_m));
    setHasHydratedDocente(true);
  }, [
    docentedraft,
    state,
    hasHydratedDocente,
    paisSeleccionado,
    phoneDigitsRequired,
    dniDigitsRequired,
    paises.length,
    parseTelefonoConCodigo,
    seleccionarpais,
  ]);

  // Restore Institucion fields
  useEffect(() => {
    if (!state || hasHydratedInstitucion) return;

    const codigoGuardado = institucionDraft?.cod_institucion ?? "";
    const nombreGuardado = institucionDraft?.nombre ?? "";

    updateInstitucionField("codigoIe", codigoGuardado ? normalizeTextInput(`${codigoGuardado}`) : "");
    updateInstitucionField("nombreIe", normalizeTextInput(nombreGuardado));

    if (institucionDraft) setHasHydratedInstitucion(true);
  }, [hasHydratedInstitucion, institucionDraft, state]);

  // Sync Locations
  useEffect(() => {
    if (!state || !institucionDraft) return;
    const sincronizarUbicaciones = async () => {
      const paisId = institucionDraft.id_pais ?? DEFAULT_PAIS_ID;
      if (paisId && (!paisSeleccionado || Number(paisSeleccionado.id) !== Number(paisId))) {
        await seleccionarpais(paisId);
      }
      if (institucionDraft.id_geo_nivel1) await seleccionardepartamento(institucionDraft.id_geo_nivel1);
      if (institucionDraft.id_geo_nivel2) await seleccionarprovincia(institucionDraft.id_geo_nivel2);
      if (institucionDraft.id_geo_nivel3) seleccionardistrito(institucionDraft.id_geo_nivel3);
    };
    sincronizarUbicaciones();
  }, [institucionDraft, paisSeleccionado, seleccionarpais, seleccionardepartamento, seleccionarprovincia, seleccionardistrito, state]);

  const handleRequestClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      await autoSaveDocenteEInstitucion();
      await onClose?.();
    } catch (error) {
      setIsClosing(false);
    }
  };

  const handleNext = async () => {
    await autoSaveDocenteEInstitucion("next");
    if (hasStartedInstitution() && !hasInstitutionRequiredFields()) {
        toast.info("No se puede registrar la institución porque faltan datos obligatorios.");
    }
    onNext?.();
  };

  if (!isOpen) return null;

  return (
    <Overlay $visible={state}>
      <Modal aria-busy={isClosing} $visible={state}>
        <Header>
          <div>
            <p>Registrar nueva venta</p>
            <h2>Docente</h2>
          </div>
          <button type="button" onClick={handleRequestClose} aria-label="Cerrar" disabled={isClosing}>
            <v.iconocerrar />
          </button>
        </Header>

        <RegistroVentaStepper currentStep={1} />

        <Body>
          <SectionTitle>Datos del Docente</SectionTitle>

          <ContentGrid>
            <Card>
              <CardHeader>
                <div>
                  <h3>Contacto y validación</h3>
                  <HelperText>Confirma el número para buscar docentes existentes o crear uno nuevo.</HelperText>
                </div>
              </CardHeader>

              <InputGroup>
                <label>Número de teléfono</label>
                <PhoneInputRow>
                  <PhoneFieldCluster>
                    <PhoneCodeSelect
                      value={paisSeleccionado?.id ?? defaultPais?.id ?? ""}
                      onChange={handlePhoneCodeChange}
                      disabled={isDocenteLocked}
                    >
                      {paises.length === 0 && <option value="">Códigos</option>}
                      {paises.map((pais) => (
                        <option key={pais.id} value={pais.id}>
                          {pais.cod_llamada}
                        </option>
                      ))}
                    </PhoneCodeSelect>
                    <PhoneNumberWrapper>
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
                      <ResetIconButton
                        type="button"
                        onClick={handleResetForm}
                        aria-label="Limpiar número"
                        disabled={!phoneNumber}
                      >
                        <v.iconocerrar />
                      </ResetIconButton>
                    </PhoneNumberWrapper>
                  </PhoneFieldCluster>
                  {phoneLookupMessage && (
                    <LookupStatus $status={phoneLookupState}>
                      {phoneLookupState === "searching" && <InlineSpinner />}
                      <span>{phoneLookupMessage}</span>
                    </LookupStatus>
                  )}
                </PhoneInputRow>
                <PhoneStatusRow>
                  <FieldStatus $status={isPhoneReady ? "success" : "idle"}>{phoneStatusMessage}</FieldStatus>
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
                  <FieldStatus $status={isDniReady ? "success" : "idle"}>{dniStatusMessage}</FieldStatus>
                </DniInputGroup>
              </InputRow>

              <NameFieldsRow>
                <VentaInput
                  label="Nombres"
                  placeholder="Nombre del docente"
                  value={nombres}
                  onChange={handleUppercaseChange((value) => updateDocenteField("nombres", value))}
                  disabled={!canEditDocenteFields}
                  autoCapitalize="characters"
                />
                <VentaInput
                  label="Apellido paterno"
                  placeholder="Apellido paterno"
                  value={apellidoPaterno}
                  onChange={handleUppercaseChange((value) => updateDocenteField("apellidoPaterno", value))}
                  disabled={!canEditDocenteFields}
                  autoCapitalize="characters"
                />
                <VentaInput
                  label="Apellido materno"
                  placeholder="Apellido materno"
                  value={apellidoMaterno}
                  onChange={handleUppercaseChange((value) => updateDocenteField("apellidoMaterno", value))}
                  disabled={!canEditDocenteFields}
                  autoCapitalize="characters"
                />
              </NameFieldsRow>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <h3>Institución</h3>
                  <HelperText>Completa la información de la institución educativa del docente.</HelperText>
                </div>
              </CardHeader>

              <CountrySelectorWrapper>
                <Label>País</Label>
                <Selector
                  state={openDropdown === "country"}
                  funcion={() => toggleDropdown("country", institutionGuardMessage)}
                  texto1=""
                  texto2={paisSeleccionado?.nombre ?? "País"}
                  color={SELECTOR_BORDER_COLOR}
                  isPlaceholder={!paisSeleccionado}
                />
                <ListaDesplegable
                  state={openDropdown === "country"}
                  data={paises}
                  funcion={seleccionarpais}
                  setState={closeDropdown}
                  width="240px"
                  placement="bottom"
                />
              </CountrySelectorWrapper>

              <DualGrid>
                <VentaInput
                  label="Código de IE (opcional)"
                  placeholder="Código modular"
                  value={codigoIe}
                  onChange={handleUppercaseChange((value) => updateInstitucionField("codigoIe", value))}
                  disabled={!canEditInstitutionFields}
                />
                <VentaInput
                  label="Nombre de la institución"
                  placeholder="Nombre de la IE"
                  value={nombreIe}
                  onChange={handleUppercaseChange((value) => updateInstitucionField("nombreIe", value))}
                  disabled={!canEditInstitutionFields}
                />
              </DualGrid>

              <LocationSelectorsRow>
                <LocationDropdownWrapper>
                  <Label>Departamento</Label>
                  <Selector
                    state={openDropdown === "departamento"}
                    funcion={() => toggleDropdown("departamento", departamentoGuardMessage)}
                    texto1=""
                    texto2={departamentoSeleccionado?.nombre ?? "Seleccionar"}
                    color={SELECTOR_BORDER_COLOR}
                    isPlaceholder={!departamentoSeleccionado}
                  />
                  <ListaDesplegable
                    state={openDropdown === "departamento"}
                    data={departamentos}
                    funcion={(value) => seleccionarDepartamentoSeguro(value)}
                    setState={closeDropdown}
                    width="100%"
                    top="3.4rem"
                    placement="bottom"
                  />
                </LocationDropdownWrapper>

                <LocationDropdownWrapper>
                  <Label>Provincia</Label>
                  <Selector
                    state={openDropdown === "provincia"}
                    funcion={() => toggleDropdown("provincia", provinciaGuardMessage)}
                    texto1=""
                    texto2={provinciaSeleccionada?.nombre ?? "Seleccionar"}
                    color={SELECTOR_BORDER_COLOR}
                    isPlaceholder={!provinciaSeleccionada}
                  />
                  <ListaDesplegable
                    state={openDropdown === "provincia"}
                    data={provincias}
                    funcion={(value) => seleccionarProvinciaSeguro(value)}
                    setState={closeDropdown}
                    width="100%"
                    top="3.4rem"
                    placement="bottom"
                  />
                </LocationDropdownWrapper>

                <LocationDropdownWrapper>
                  <Label>Distrito</Label>
                  <Selector
                    state={openDropdown === "distrito"}
                    funcion={() => toggleDropdown("distrito", distritoGuardMessage)}
                    texto1=""
                    texto2={distritoSeleccionado?.nombre ?? "Seleccionar"}
                    color={SELECTOR_BORDER_COLOR}
                    isPlaceholder={!distritoSeleccionado}
                  />
                  <ListaDesplegable
                    state={openDropdown === "distrito"}
                    data={distritos}
                    funcion={(value) => seleccionarDistritoSeguro(value)}
                    setState={closeDropdown}
                    width="100%"
                    top="3.4rem"
                    placement="bottom"
                  />
                </LocationDropdownWrapper>
              </LocationSelectorsRow>
            </Card>
          </ContentGrid>
        </Body>

        <Footer>
          <PrimaryButton type="button" onClick={handleNext} disabled={isClosing}>
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

// Styled Components
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
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(${({ theme }) => theme.textRgba}, 0.2); border-radius: 999px; }
`;
const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(14px, 2vw, 22px);
  align-items: start;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;
const Card = styled.section`
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  background: ${({ theme }) => theme.posPanelBg};
  border-radius: 18px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  box-shadow: 0 14px 50px rgba(0, 0, 0, 0.08);

  @media (min-width: 960px) {
    padding: 14px 18px;
  }
`;
const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 1rem;
  }
`;
const HelperText = styled.p`
  margin: 4px 0 0;
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  font-weight: 500;
`;
const Label = styled.p`
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
`;
const DropdownWrapper = styled(ContainerSelector)`
  width: 100%;
  max-width: 380px;
  position: relative;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  user-select: none;
`;
const Footer = styled(ModalFooter)``;

// Docente styles
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
`;
const InputRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  @media (max-width: 560px) { flex-direction: column; align-items: stretch; }
`;
const DniInputGroup = styled(InputGroup)`
  flex: 0 0 60%;
  max-width: 480px;
  @media (max-width: 560px) { flex: 1 1 auto; max-width: none; }
`;
const DualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  align-items: flex-end;
`;
const LocationSelectorsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  width: 100%;
  gap: 12px;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const NameFieldsRow = styled(LocationSelectorsRow)`
  align-items: flex-end;
`;
const CountrySelectorWrapper = styled(DropdownWrapper)`
  width: 100%;
  justify-self: flex-start;
  align-self: flex-start;
  margin-top: 8px;
  min-width: 0;
  max-width: 360px;

  @media (max-width: 640px) {
    max-width: none;
  }
`;
const LocationDropdownWrapper = styled(DropdownWrapper)`
  width: 100%;
  flex: 0 1 auto;
  min-width: 0;
`;
const PhoneInputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const PhoneFieldCluster = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PhoneCodeSelect = styled.select`
  min-width: 68px;
  max-width: 86px;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid ${SELECTOR_BORDER_COLOR};
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 0.95rem;
  outline: none;
  text-align: center;
  box-sizing: border-box;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const PhoneNumberWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const PhoneNumberField = styled.input`
  flex: 1 1 220px;
  min-width: 0;
  font-size: 1rem;
  padding: 12px 44px 12px 14px;
  line-height: 1.4;
  border-radius: 12px;
  border: 1px dashed rgba(${({ theme }) => theme.textRgba}, 0.2);
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  color: ${({ theme }) => theme.text};
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ResetIconButton = styled.button`
  position: absolute;
  inset: 50% 10px auto auto;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  color: #111827;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
  }
`;
const PhoneStatusRow = styled.div`
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
`;
const InputField = styled.input`
  width: 100%; max-width: 100%; box-sizing: border-box;
`;
const FieldStatus = styled.small`
  font-size: 0.78rem;
  color: ${({ theme, $status }) =>
    $status === "success"
      ? "rgba(12, 85, 74, 1)"
      : `rgba(${theme.textRgba}, 0.65)`};
  font-weight: ${({ $status }) => ($status === "success" ? 600 : 500)};
`;

const LookupStatus = styled(FieldStatus)`
  color: ${({ theme, $status }) => {
    if ($status === "found") return "rgba(15, 157, 88, 1)";
    if ($status === "not-found") return theme.text;
    return `rgba(${theme.textRgba}, 0.65)`;
  }};
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 220px;
  word-break: break-word;
`;
const InlineSpinner = styled(Spinner)`
  width: 16px; height: 16px; border-width: 2px; border-color: rgba(0,0,0,0.1); border-top-color: ${({ theme }) => `rgba(${theme.textRgba}, 0.9)`};
`;
