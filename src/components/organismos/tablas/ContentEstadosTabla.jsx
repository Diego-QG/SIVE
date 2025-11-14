import styled from "styled-components";
import { RiShieldCheckLine } from "react-icons/ri";
import { HiOutlineChartPie } from "react-icons/hi";
import { PiCubeThin } from "react-icons/pi";

const supervisionColors = {
  pendiente: {
    color: "#6b7280",
    background: "#f3f4f6",
  },
  aceptado: {
    color: "#15803d",
    background: "#dcfce7",
  },
  rechazado: {
    color: "#b91c1c",
    background: "#fee2e2",
  },
};

const evaluacionColors = {
  pendiente_evidencia: {
    color: "#6b7280",
    background: "#f3f4f6",
  },
  en_evaluacion: {
    color: "#1d4ed8",
    background: "#dbeafe",
  },
  valido: {
    color: "#15803d",
    background: "#dcfce7",
  },
  correccion: {
    color: "#c2410c",
    background: "#ffedd5",
  },
};

const estadosConfig = (
  estadoSupervision,
  estadoContabilidad,
  estadoEntregas,
  actions
) => [
  {
    id: "secure",
    Icon: RiShieldCheckLine,
    estado: estadoSupervision,
    palette: supervisionColors,
    onClick: actions.secure,
  },
  {
    id: "analytics",
    Icon: HiOutlineChartPie,
    estado: estadoContabilidad,
    palette: evaluacionColors,
    onClick: actions.analytics,
  },
  {
    id: "inventory",
    Icon: PiCubeThin,
    estado: estadoEntregas,
    palette: evaluacionColors,
    onClick: actions.inventory,
  },
];

const getEstadoStyles = (estado, palette) => {
  if (estado && palette?.[estado]) {
    return palette[estado];
  }
  return {
    color: "#6b7280",
    background: "#f3f4f6",
  };
};

export function ContentEstadosTabla({
  estadoSupervision,
  estadoContabilidad,
  estadoEntregas,
  onSecure,
  onAnalytics,
  onInventory,
}) {
  const actions = {
    secure: onSecure,
    analytics: onAnalytics,
    inventory: onInventory,
  };

  return (
    <Container>
      {estadosConfig(
        estadoSupervision,
        estadoContabilidad,
        estadoEntregas,
        actions
      ).map(({ id, Icon, estado, palette, onClick }) => {
        const { color, background } = getEstadoStyles(estado, palette);
        return (
          <EstadoButton
            key={id}
            type="button"
            onClick={onClick}
            $color={color}
            $background={background}
            title={estado || "Sin estado"}
          >
            <Icon />
          </EstadoButton>
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

const EstadoButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 14px rgba(0, 0, 0, 0.12);
  }
`;