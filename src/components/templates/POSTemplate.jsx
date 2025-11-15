import styled from "styled-components";
import {
  BuscadorPOS,
  RegistrarCursos,
  TablaPOS,
  Title,
  useVentasStore,
} from "../../index";
import { v } from "../../styles/variables";
import ConfettiExplosion from "react-confetti-explosion";
import { useMemo, useState } from "react";

export function POSTemplate() {
  const { dataventas, buscador, setBuscador } = useVentasStore();
  const [openRegistro, setOpenRegistro] = useState(false);
  const [accion, setAccion] = useState("Nuevo");
  const [dataSelect, setDataSelect] = useState(null);
  const [isExploding, setIsExploding] = useState(false);

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
    setOpenRegistro(true);
    setAccion("Nuevo");
    setDataSelect(null);
    setIsExploding(false);
  };

  const handleCloseRegistro = () => {
    setOpenRegistro(false);
  };

  return (
    <Container>
      <RegistrarCursos
        setIsExploding={setIsExploding}
        onClose={handleCloseRegistro}
        dataSelect={dataSelect}
        accion={accion}
        state={openRegistro}
      />
      <section className="area1">
        <div className="hero-text">
          <Title>Tu registro de ventas</Title>
          <p>
            Visualiza y da seguimiento a las ventas que has registrado, incluyendo su revisión y validación.
          </p>
        </div>
        <ActionButton type="button" onClick={handleNuevaVenta}>
          <v.iconoagregar aria-hidden className="icon" />
          Registrar nueva venta
        </ActionButton>
      </section>
      <section className="area2">
        <BuscadorPOS setBuscador={setBuscador} />
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

  @media (min-width: ${v.bpbart}) {
    padding: 32px 32px 40px;
    gap: 28px;
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

  @media (min-width: ${v.bpbart}) {
    align-self: auto;
  }
`;