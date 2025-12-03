import styled from "styled-components";
import {
  BuscadorPOS,
  RegistrarVentas1,
  RegistrarVentas2,
  RegistrarVentas3,
  TablaPOS,
  Title,
  useVentasStore,
} from "../../index";
import { v } from "../../styles/variables";
import ConfettiExplosion from "react-confetti-explosion";
import { useCallback, useMemo, useRef, useState } from "react";
import { Toaster } from "sonner";

export function POSTemplate({ datausuarios } = {}) {
  const { dataventas, buscador, setBuscador, eliminarborrador } = useVentasStore();
  const [openRegistro, setOpenRegistro] = useState(false);
  const [registroStep, setRegistroStep] = useState(1);
  const [accion, setAccion] = useState("Nuevo");
  const [dataSelect, setDataSelect] = useState(null);
  const [isExploding, setIsExploding] = useState(false);
  const [ventaDraftId, setVentaDraftId] = useState(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  // Estado compartido para que los datos del docente/IE sobrevivan al cambiar de paso.
  const [docenteForm, setDocenteForm] = useState({
    phoneNumber: "",
    dniValue: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
  });
  const [institucionForm, setInstitucionForm] = useState({
    codigoIe: "",
    nombreIe: "",
  });
  const beforeCloseHandlersRef = useRef(new Map());
  const persistDocenteHandlerRef = useRef(null);
  const [ventaDraftFlags, setVentaDraftFlags] = useState({
    editorial: false,
    vouchers: false,
    docente: false,
  });
  const ventaDraftFlagsRef = useRef(ventaDraftFlags);

  const handleVentaTieneDatosChange = useCallback((flag, value) => {
    if (!flag) {
      return;
    }

    setVentaDraftFlags((prev) => {
      const nextValue = Boolean(value);

      if (prev[flag] === nextValue) {
        return prev;
      }

      const next = { ...prev, [flag]: nextValue };
      ventaDraftFlagsRef.current = next;
      return next;
    });
  }, []);

  const resetVentaDraftFlags = useCallback(() => {
    const emptyFlags = { editorial: false, vouchers: false, docente: false };
    ventaDraftFlagsRef.current = emptyFlags;
    setVentaDraftFlags(emptyFlags);
  }, []);

  const handleBeforeCloseChange = useCallback((key, handler) => {
    if (!key) {
      return;
    }

    if (typeof handler === "function") {
      beforeCloseHandlersRef.current.set(key, handler);
      return;
    }

    beforeCloseHandlersRef.current.delete(key);
  }, []);

  const runBeforeCloseHandlers = useCallback(async () => {
    const handlers = Array.from(beforeCloseHandlersRef.current.values());

    for (const handler of handlers) {
      if (typeof handler === "function") {
        const result = await handler();
        if (result === false) {
          return false;
        }
      }
    }
    return true;
  }, []);

  const filteredVentas = useMemo(() => {
    if (!buscador) {
      return dataventas;
    }

    const searchValue = buscador.toLowerCase();
    return (dataventas ?? []).filter((venta) => {
      const fieldsToSearch = [
        venta?.fecha_str,
        venta?.editorial,
        venta?.nombre_docente,
        venta?.material_resumen,
      ];

      return fieldsToSearch.some((field) =>
        `${field ?? ""}`.toLowerCase().includes(searchValue)
      );
    });
  }, [buscador, dataventas]);

  const handleNuevaVenta = () => {
    if (openRegistro || isCreatingDraft) {
      return;
    }
    setOpenRegistro(true);
    setRegistroStep(1);
    setAccion("Nuevo");
    setDataSelect(null);
    setIsExploding(false);
    setVentaDraftId(null);
    setDocenteForm({
      phoneNumber: "",
      dniValue: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
    });
    setInstitucionForm({ codigoIe: "", nombreIe: "" });
    resetVentaDraftFlags();
  };

  const handleEditarVenta = useCallback(
    (venta) => {
      const ventaId = venta?.id ?? venta?.id_venta ?? null;
      if (!ventaId) {
        return;
      }

      setOpenRegistro(true);
      setRegistroStep(1);
      setAccion("Editar");
      setDataSelect(venta ?? null);
      setIsExploding(false);
      setVentaDraftId(ventaId);
      setIsCreatingDraft(false);
      setDocenteForm({
        phoneNumber: "",
        dniValue: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
      });
      setInstitucionForm({ codigoIe: "", nombreIe: "" });
    },
    []
  );

  const handleCloseRegistro = async (options = {}) => {
    try {
      if (!options?.skipBeforeClose) {
        const canClose = await runBeforeCloseHandlers();
        if (canClose === false) {
          return;
        }
      }

      const shouldKeepDraft = Object.values(ventaDraftFlagsRef.current).some(Boolean);

      if (ventaDraftId && !shouldKeepDraft && datausuarios?.id) {
        await eliminarborrador({
          _id_venta: ventaDraftId,
          _id_usuario: datausuarios.id,
        });
      }
    } finally {
      setOpenRegistro(false);
      setRegistroStep(1);
      setVentaDraftId(null);
      setIsCreatingDraft(false);
      setAccion("Nuevo");
      setDataSelect(null);
      setDocenteForm({
        phoneNumber: "",
        dniValue: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
      });
      setInstitucionForm({ codigoIe: "", nombreIe: "" });
      resetVentaDraftFlags();
      beforeCloseHandlersRef.current.clear();
      persistDocenteHandlerRef.current = null;
    }
  };

  const handleFinishRegistro = () => {
    setIsExploding(true);
    handleCloseRegistro({ skipBeforeClose: true });
  };

  return (
    <Container>
      <Toaster />
      <RegistrarVentas1
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 1}
        isOpen={openRegistro}
        onNext={() => setRegistroStep(2)}
        ventaDraftId={ventaDraftId}
        onDraftCreated={setVentaDraftId}
        onVentaTieneDatosChange={handleVentaTieneDatosChange}
        onDraftCreationStateChange={setIsCreatingDraft}
        onBeforeCloseChange={handleBeforeCloseChange}
        isEditing={accion === "Editar"}
        // Passed Docente Form Props
        docenteForm={docenteForm}
        setDocenteForm={setDocenteForm}
        institucionForm={institucionForm}
        setInstitucionForm={setInstitucionForm}
      />
      <RegistrarVentas2
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 2}
        isOpen={openRegistro}
        onNext={() => setRegistroStep(3)}
        onPrevious={() => setRegistroStep(1)}
        ventaDraftId={ventaDraftId}
        onVentaTieneDatosChange={handleVentaTieneDatosChange}
        onBeforeCloseChange={handleBeforeCloseChange}
      />
      <RegistrarVentas3
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 3}
        isOpen={openRegistro}
        onPrevious={() => setRegistroStep(2)}
        onFinish={handleFinishRegistro}
        ventaDraftId={ventaDraftId}
        ventaFlags={ventaDraftFlags}
        onPersistDocente={async () => {
          if (typeof persistDocenteHandlerRef.current === "function") {
            return persistDocenteHandlerRef.current();
          }
          return true;
        }}
      />
      <section className="area1">
        <div className="hero-text">
          <Title>Tu registro de ventas</Title>
          <p>
            Visualiza y da seguimiento a las ventas que has registrado, incluyendo su revisión y validación.
          </p>
        </div>
        <ActionButton type="button" onClick={handleNuevaVenta} disabled={isCreatingDraft || openRegistro}>
          <v.iconoagregar aria-hidden className="icon" />
          Registrar nueva venta
        </ActionButton>
      </section>
      <section className="area2">
        <div className="buscador-pos">
          <BuscadorPOS setBuscador={setBuscador} />
        </div>
      </section>
      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaPOS data={filteredVentas} onEditarBorrador={handleEditarVenta} />
      </section>
    </Container>
  );
}

const Container = styled.div`
  min-height: calc(100vh - 30px);
  padding: 24px 18px 32px;
  display: grid;
  grid-template:
    "area1" auto
    "area2" auto
    "main" auto;
  gap: 24px;
  align-content: start;

  @media (min-width: ${v.bpbart}) {
    padding: 32px 32px 40px;
    gap: 35px;
  }

  .area1 {
    grid-area: area1;
    background: ${({ theme }) => theme.heroSectionBg};
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
    border-radius: 28px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    color: ${({ theme }) => theme.text};

    @media (min-width: ${v.bpbart}) {
      padding: 36px 42px;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .hero-text {
      max-width: 720px;

      ${Title} {
        display: block;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        color: rgba(${({ theme }) => theme.textRgba}, 0.75);
      }
    }
  }

  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: center;
    height: auto;

    .buscador-pos {
      width: min(100%, 1040px);
      flex: 1;
    }

    .buscador-pos > section {
      width: 100%;
    }
  }

  .main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const ActionButton = styled.button`
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 14px 30px;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  background: linear-gradient(
      120deg,
      rgba(${({ theme }) => theme.textRgba}, 0.18),
      rgba(${({ theme }) => theme.textRgba}, 0.08)
    ),
    linear-gradient(120deg, rgba(255, 238, 88, 0.3), rgba(23, 224, 192, 0.25));
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.16);
  box-shadow: 0 12px 24px rgba(${({ theme }) => theme.textRgba}, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  .icon {
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 30px rgba(${({ theme }) => theme.textRgba}, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  @media (min-width: ${v.bpbart}) {
    align-self: auto;
  }
`;
