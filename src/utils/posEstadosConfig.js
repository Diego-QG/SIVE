const baseGray = {
  background: "rgba(148, 163, 184, 0.18)",
  accent: "rgba(100, 116, 139, 0.78)",
};

const successGreen = {
  background: "rgba(34, 197, 94, 0.2)",
  accent: "rgba(21, 128, 61, 0.9)",
};

const warningAmber = {
  background: "rgba(251, 189, 35, 0.2)",
  accent: "rgba(202, 138, 4, 0.92)",
};

const processPurple = {
  background: "rgba(196, 181, 253, 0.25)",
  accent: "rgba(126, 58, 242, 0.85)",
};

const errorRed = {
  background: "rgba(248, 113, 113, 0.24)",
  accent: "rgba(220, 38, 38, 0.92)",
};

export const POS_ESTADO_PRIORIDAD = [
  "registro_estado",
  "supervision_estado",
  "evaluacion_estado",
];

export const POS_ESTADO_COLORES = {
  registro_estado: {
    borrador: {
      background: "rgba(148, 163, 184, 0.25)",
      accent: "rgba(100, 116, 139, 0.85)",
    },
  },
  supervision_estado: {
    pendiente: baseGray,
    aceptado: successGreen,
    rechazado: errorRed,
  },
  evaluacion_estado: {
    __fallback: baseGray,
    pendiente_evidencia: warningAmber,
    en_evaluacion: processPurple,
    valido: successGreen,
    correccion: errorRed,
  },
};

export const POS_STATUS_SUMMARY = [
  {
    id: "status-gray",
    label: "Gris",
    description: "Pendiente / Sin evaluación",
    ...baseGray,
  },
  {
    id: "status-green",
    label: "Verde",
    description: "Aceptado / Válido",
    ...successGreen,
  },
  {
    id: "status-orange",
    label: "Naranja",
    description: "Pendiente evidencia",
    ...warningAmber,
  },
  {
    id: "status-purple",
    label: "Morado",
    description: "En evaluación",
    ...processPurple,
  },
  {
    id: "status-red",
    label: "Rojo",
    description: "Rechazado / Corrección",
    ...errorRed,
  },
];

export const obtenerEstilosEstado = (rowData = {}) => {
  for (const key of POS_ESTADO_PRIORIDAD) {
    const estado = rowData[key];
    if (estado) {
      const estilos = POS_ESTADO_COLORES[key]?.[estado];
      if (estilos) {
        return estilos;
      }
    } else if (
      (estado === null || estado === undefined) &&
      POS_ESTADO_COLORES[key]?.__fallback
    ) {
      return POS_ESTADO_COLORES[key].__fallback;
    }
  }
  return null;
};