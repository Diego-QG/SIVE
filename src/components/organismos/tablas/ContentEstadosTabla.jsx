import styled from "styled-components";
import { RiShieldCheckLine } from "react-icons/ri";
import { HiOutlineChartPie } from "react-icons/hi";
import { PiCubeThin } from "react-icons/pi";
import { EstadoTabla, useThemeStore } from "../../../index";

const STATE_STYLES = {
  gray: {
    light: { background: "#e2e8f0", border: "#cbd5f5", color: "#475569" },
    dark: {
      background: "rgba(148, 163, 184, 0.18)",
      border: "rgba(148, 163, 184, 0.45)",
      color: "#e2e8f0",
    },
  },
  green: {
    light: { background: "#dcfce7", border: "#86efac", color: "#16a34a" },
    dark: {
      background: "rgba(34, 197, 94, 0.24)",
      border: "rgba(34, 197, 94, 0.4)",
      color: "#bbf7d0",
    },
  },
  orange: {
    light: { background: "#fef3c7", border: "#fcd34d", color: "#d97706" },
    dark: {
      background: "rgba(251, 189, 35, 0.24)",
      border: "rgba(251, 189, 35, 0.45)",
      color: "#fed7aa",
    },
  },
  purple: {
    light: { background: "#ede9fe", border: "#c4b5fd", color: "#7c3aed" },
    dark: {
      background: "rgba(196, 181, 253, 0.28)",
      border: "rgba(196, 181, 253, 0.45)",
      color: "#ddd6fe",
    },
  },
  red: {
    light: { background: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
    dark: {
      background: "rgba(239, 68, 68, 0.24)",
      border: "rgba(239, 68, 68, 0.45)",
      color: "#fecaca",
    },
  },
};

const DEFAULT_STYLE = STATE_STYLES.gray;

const SUPERVISION_COLORS = {
  pendiente: STATE_STYLES.gray,
  aceptado: STATE_STYLES.green,
  rechazado: STATE_STYLES.red,
};

const EVALUACION_COLORS = {
  pendiente: STATE_STYLES.gray,
  en_revision: STATE_STYLES.purple,
  aprobado: STATE_STYLES.green,
  observado: STATE_STYLES.red,
  pendiente_evidencia: STATE_STYLES.orange,
  en_evaluacion: STATE_STYLES.purple,
  valido: STATE_STYLES.green,
  correccion: STATE_STYLES.red,
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
    palette: SUPERVISION_COLORS,
    onClick: actions.secure,
  },
  {
    id: "analytics",
    Icon: HiOutlineChartPie,
    estado: estadoContabilidad,
    palette: EVALUACION_COLORS,
    onClick: actions.analytics,
  },
  {
    id: "inventory",
    Icon: PiCubeThin,
    estado: estadoEntregas,
    palette: EVALUACION_COLORS,
    onClick: actions.inventory,
  },
];

const estadoKeys = ["estado", "estatus", "status", "nombre", "name", "label"];

const resolveEstadoLabel = (estado) => {
  if (typeof estado === "string") {
    return estado.trim() || null;
  }
  if (estado && typeof estado === "object") {
    for (const key of estadoKeys) {
      const value = estado[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }
  return null;
};

const normalizeEstado = (estado) =>
  typeof estado === "string" ? estado.trim().toLowerCase() : estado;

const getEstadoStyles = (estadoLabel, palette, mode = "light") => {
  const normalized = normalizeEstado(estadoLabel);
  const colors = (normalized && palette?.[normalized]) || DEFAULT_STYLE;
  return colors[mode === "dark" ? "dark" : "light"];
};

export function ContentEstadosTabla({
  estadoSupervision,
  estadoContabilidad,
  estadoEntregas,
  onSecure,
  onAnalytics,
  onInventory,
}) {
  const { theme } = useThemeStore();
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
        const estadoLabel = resolveEstadoLabel(estado);
        const { color, background, border } = getEstadoStyles(
          estadoLabel,
          palette,
          theme
        );
        return (
          <EstadoTabla
            key={id}
            funcion={onClick}
            icono={<Icon />}
            color={color}
            background={background}
            border={border}
            title={estadoLabel || "Sin estado"}
            ariaLabel={`Estado ${id}: ${estadoLabel || "sin estado"}`}
          />
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