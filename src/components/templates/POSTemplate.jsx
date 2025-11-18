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

export function POSTemplate() {
  const { dataventas, buscador, setBuscador } = useVentasStore();
  const [openRegistro, setOpenRegistro] = useState(false);
  const [registroStep, setRegistroStep] = useState(1);
  const [accion, setAccion] = useState("Nuevo");
  const [dataSelect, setDataSelect] = useState(null);
  const [isExploding, setIsExploding] = useState(false);
  const [ventaDraftId, setVentaDraftId] = useState(null);
  const [ventaTieneDatos, setVentaTieneDatos] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const beforeCloseRegistroRef = useRef(null);

  const handleBeforeCloseChange = useCallback((handler) => {
    beforeCloseRegistroRef.current = handler;
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
    setVentaTieneDatos(false);
  };

  const handleCloseRegistro = async (options = {}) => {
    try {
      if (!options?.skipBeforeClose && typeof beforeCloseRegistroRef.current === "function") {
        await beforeCloseRegistroRef.current();
      }
    } finally {
      setOpenRegistro(false);
      setRegistroStep(1);
      setVentaDraftId(null);
      setVentaTieneDatos(false);
      setIsCreatingDraft(false);
    }
  };

  const handleFinishRegistro = () => {
    setIsExploding(true);
    handleCloseRegistro();
  };

  return (
    <Container>
      <RegistrarVentas1
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 1}
        onNext={() => setRegistroStep(2)}
        ventaDraftId={ventaDraftId}
        onDraftCreated={setVentaDraftId}
        ventaTieneDatos={ventaTieneDatos}
        onVentaTieneDatosChange={setVentaTieneDatos}
        onDraftCreationStateChange={setIsCreatingDraft}
        onBeforeCloseChange={handleBeforeCloseChange}
      />
      <RegistrarVentas2
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 2}
        onNext={() => setRegistroStep(3)}
        onPrevious={() => setRegistroStep(1)}
        ventaDraftId={ventaDraftId}
        ventaTieneDatos={ventaTieneDatos}
      />
      <RegistrarVentas3
        onClose={handleCloseRegistro}
        state={openRegistro && registroStep === 3}
        onPrevious={() => setRegistroStep(2)}
        onFinish={handleFinishRegistro}
        ventaDraftId={ventaDraftId}
        ventaTieneDatos={ventaTieneDatos}
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
        <TablaPOS data={filteredVentas} />
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
  color: #071424;
  cursor: pointer;
  background: linear-gradient(120deg, #ffee58, #17e0c0);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;

  .icon {
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.35);
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