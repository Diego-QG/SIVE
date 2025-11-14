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
          <v.iconoagregar aria-hidden className="icon" />
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
  background: #10243b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 22px 36px rgba(7, 14, 24, 0.32);

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
      color: rgba(255, 255, 255, 0.75);
    }
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