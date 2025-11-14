import styled from "styled-components";
import { RiShieldCheckLine } from "react-icons/ri";
import { HiOutlineChartPie } from "react-icons/hi";
import { PiCubeThin } from "react-icons/pi";
import { useThemeStore } from "../../../store/ThemeStore";

const hexToRgba = (hex, alpha = 1) => {
  if (typeof hex !== "string") return hex;
  let normalized = hex.replace("#", "");
  if (![3, 6].includes(normalized.length)) return hex;
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const createStatePalette = (
  hex,
  {
    textLight,
    textDark,
    lightBgAlpha = 0.2,
    darkBgAlpha = 0.35,
    lightBorderAlpha = 0.45,
    darkBorderAlpha = 0.6,
  } = {}
) => ({
  color: {
    light: textLight ?? hex,
    dark: textDark ?? hex,
  },
  background: {
    light: hexToRgba(hex, lightBgAlpha),
    dark: hexToRgba(hex, darkBgAlpha),
  },
  border: {
    light: hexToRgba(hex, lightBorderAlpha),
    dark: hexToRgba(hex, darkBorderAlpha),
  },
});

const fallbackPalette = createStatePalette("#94a3b8", {
  textLight: "#475569",
  textDark: "#e2e8f0",
  darkBgAlpha: 0.28,
  darkBorderAlpha: 0.45,
});

const supervisionColors = {
  pendiente: fallbackPalette,
  aceptado: createStatePalette("#22c55e", {
    textLight: "#15803d",
    textDark: "#a3e635",
  }),
  rechazado: createStatePalette("#ef4444", {
    textLight: "#b91c1c",
    textDark: "#fecaca",
  }),
  __fallback: fallbackPalette,
};

const evaluacionColors = {
  pendiente: fallbackPalette,
  pendiente_evidencia: createStatePalette("#fbbf24", {
    textLight: "#b45309",
    textDark: "#fed7aa",
    lightBgAlpha: 0.22,
    darkBgAlpha: 0.4,
  }),
  en_evaluacion: createStatePalette("#a855f7", {
    textLight: "#6d28d9",
    textDark: "#ddd6fe",
  }),
  valido: supervisionColors.aceptado,
  correccion: createStatePalette("#fb7185", {
    textLight: "#be123c",
    textDark: "#fecdd3",
  }),
  __fallback: fallbackPalette,
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

const getEstadoStyles = (estado, palette, mode) => {
  const paletteConfig =
    (estado && palette?.[estado]) || palette?.__fallback || fallbackPalette;
  const themeMode = mode === "light" ? "light" : "dark";
  return {
    color: paletteConfig.color[themeMode] ?? paletteConfig.color.light,
    background:
      paletteConfig.background[themeMode] ?? paletteConfig.background.light,
    border: paletteConfig.border[themeMode] ?? paletteConfig.border.light,
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
        const { color, background, border } = getEstadoStyles(
          estado,
          palette,
          theme
        );
        return (
          <EstadoButton
            key={id}
            type="button"
            onClick={onClick}
            $color={color}
            $background={background}
            $border={border}
            title={estado || "Sin estado"}
            aria-label={`Estado ${id}: ${estado || "sin estado"}`}
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
  border: 1px solid ${(props) => props.$border || "transparent"};
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 14px rgba(0, 0, 0, 0.18);
  }
`;