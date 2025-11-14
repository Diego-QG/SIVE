import styled from "styled-components";
import {
  BuscadorPOS,
  TablaPOS,
  Title,
  useVentasStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useMemo } from "react";

export function POSTemplate() {
  const { dataventas, buscador, setBuscador } = useVentasStore();

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


  return (
    <Container>
      <HeroSection>
        <div className="hero-text">
          <Title>Ventas POS</Title>
          <p>
            Visualiza el estado completo de cada registro POS y accede a las etapas
            críticas en un clic.
          </p>
        </div>
        <ActionButton type="button">
          Registrar nueva venta
        </ActionButton>
      </HeroSection>
      <ControlsRow>
        <BuscadorPOS setBuscador={setBuscador} />
      </ControlsRow>
      <section className="main">
        <TablaPOS data={filteredVentas} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: calc(100vh - 30px);
  padding: 24px 18px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: ${v.bpbart}) {
    padding: 32px 32px 40px;
    gap: 28px;
  }

  .main {
    flex: 1;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0)
    ),
    ${({ theme }) => theme.bg6};
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${v.bpbart}) {
    padding: 32px 36px;
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
      color: rgba(${({ theme }) => theme.textRgba}, 0.82);
    }
  }
`;

const ActionButton = styled.button`
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 14px 28px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #0b1c29;
  cursor: pointer;
  background: linear-gradient(120deg, rgba(255, 238, 88, 0.95), rgba(0, 188, 212, 0.9));
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 28px rgba(0, 0, 0, 0.2);
  }

  @media (min-width: ${v.bpbart}) {
    align-self: auto;
  }
`;

const ControlsRow = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${v.bpbart}) {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
`;