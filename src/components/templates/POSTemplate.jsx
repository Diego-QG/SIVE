import styled from "styled-components";
import {
  Buscador,
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

  const indicadores = useMemo(() => {
    const data = Array.isArray(dataventas) ? dataventas : [];
    const totalRegistros = data.length;
    const totalMontos = data.reduce((acc, venta) => {
      const posiblesMontos = [
        venta?.total_general,
        venta?.total_monto,
        venta?.total_venta,
        venta?.total,
      ];
      const monto = posiblesMontos.find(
        (valor) => valor !== undefined && valor !== null && valor !== ""
      );
      const numericValue = Number(monto);
      if (!Number.isNaN(numericValue)) {
        return acc + numericValue;
      }
      return acc;
    }, 0);

    const docentesUnicos = new Set(
      data
        .map((venta) => venta?.nombre_docente)
        .filter((value) => Boolean(value))
    ).size;

    const materialesUnicos = new Set(
      data
        .map((venta) => venta?.material_resumen)
        .filter((value) => Boolean(value))
    ).size;

    const currencyFormatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    });

    const formattedMonto =
      totalMontos > 0 ? currencyFormatter.format(totalMontos) : "S/ 0.00";
    const ticketPromedio =
      totalRegistros > 0 ? currencyFormatter.format(totalMontos / totalRegistros) : "S/ 0.00";

    return [
      {
        id: "ventas",
        titulo: "Ventas registradas",
        descripcion: "Movimientos en POS",
        valor: totalRegistros.toLocaleString("es-PE"),
        background: "rgba(0, 174, 255, 0.12)",
        borde: "rgba(0, 174, 255, 0.45)",
        acento: "rgba(0, 174, 255, 0.9)",
      },
      {
        id: "montos",
        titulo: "Monto total",
        descripcion: "Suma de importes",
        valor: formattedMonto,
        background: "rgba(64, 209, 149, 0.14)",
        borde: "rgba(64, 209, 149, 0.45)",
        acento: "rgba(64, 209, 149, 0.9)",
      },
      {
        id: "ticket",
        titulo: "Ticket promedio",
        descripcion: "Por registro",
        valor: ticketPromedio,
        background: "rgba(255, 204, 92, 0.15)",
        borde: "rgba(255, 204, 92, 0.6)",
        acento: "rgba(255, 204, 92, 0.95)",
      },
      {
        id: "materiales",
        titulo: "Materiales únicos",
        descripcion: "Resumenes trabajados",
        valor: materialesUnicos.toLocaleString("es-PE"),
        background: "rgba(180, 115, 255, 0.13)",
        borde: "rgba(180, 115, 255, 0.55)",
        acento: "rgba(180, 115, 255, 0.9)",
      },
      {
        id: "docentes",
        titulo: "Docentes atendidos",
        descripcion: "Contactos únicos",
        valor: docentesUnicos.toLocaleString("es-PE"),
        background: "rgba(255, 120, 168, 0.15)",
        borde: "rgba(255, 120, 168, 0.55)",
        acento: "rgba(255, 120, 168, 0.95)",
      },
    ];
  }, [dataventas]);

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
      <IndicatorsGrid>
        {indicadores.map((indicador) => (
          <IndicatorCard
            key={indicador.id}
            $background={indicador.background}
            $border={indicador.borde}
          >
            <IndicatorBadge $accent={indicador.acento} />
            <div className="indicator-content">
              <span className="indicator-label">{indicador.titulo}</span>
              <strong className="indicator-value">{indicador.valor}</strong>
              <span className="indicator-description">
                {indicador.descripcion}
              </span>
            </div>
          </IndicatorCard>
        ))}
      </IndicatorsGrid>
      <ControlsRow>
        <Buscador setBuscador={setBuscador} />
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

const IndicatorsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;

  @media (min-width: ${v.bpbart}) {
    gap: 20px;
  }
`;

const IndicatorCard = styled.article`
  background: ${(props) => props.$background};
  border: 1px solid ${(props) => props.$border};
  border-radius: 20px;
  padding: 18px;
  display: flex;
  gap: 14px;
  min-height: 120px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);

  .indicator-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .indicator-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(${({ theme }) => theme.textRgba}, 0.78);
  }

  .indicator-value {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.text};
  }

  .indicator-description {
    font-size: 0.8rem;
    color: rgba(${({ theme }) => theme.textRgba}, 0.65);
  }
`;

const IndicatorBadge = styled.span`
  width: 14px;
  height: 14px;
  margin-top: 4px;
  border-radius: 50%;
  background: ${(props) => props.$accent};
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.2);
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