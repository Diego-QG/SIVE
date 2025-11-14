import { useMemo, useState } from "react";
import styled from "styled-components";
import {
  FiPlusCircle,
  FiSearch,
  FiUploadCloud,
  FiShield,
  FiPieChart,
  FiPackage,
} from "react-icons/fi";

const stageDefinitions = [
  {
    key: "evidencia",
    label: "Carga",
    icon: FiUploadCloud,
    helper: "Venta_evidencias / archivos en Supabase",
  },
  {
    key: "supervision",
    label: "Supervisión",
    icon: FiShield,
    helper: "Tabla venta_supervision",
  },
  {
    key: "contabilidad",
    label: "Contabilidad",
    icon: FiPieChart,
    helper: "Tabla venta_contabilidad",
  },
  {
    key: "entregas",
    label: "Materiales",
    icon: FiPackage,
    helper: "Tabla venta_entregas",
  },
];

const stageStateTokens = {
  complete: {
    label: "Listo",
    bg: "#DFF6E8",
    color: "#1F7A4D",
    border: "#B3E5C7",
  },
  inProgress: {
    label: "En revisión",
    bg: "#FFF1D6",
    color: "#A76300",
    border: "#FFD298",
  },
  pending: {
    label: "Pendiente",
    bg: "#E8EBF5",
    color: "#4F5B7E",
    border: "#CBD4F2",
  },
};

const statusFilterOptions = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "inProgress", label: "En revisión" },
  { key: "complete", label: "Listos" },
];

const rpcSuggestions = [
  {
    name: "mostrarventas",
    description:
      "Devuelve la grilla principal juntando ventas, editoriales, docentes y venta_items para totales.",
  },
  {
    name: "mostrarventadetalle",
    description:
      "Trae los items con nivel, subnivel, curso y pack usando la vista vista_resumen_materiales.",
  },
  {
    name: "insertarventa",
    description:
      "Inserta ventas y retorna el id para usarlo en insertarventaitems y cuotas.",
  },
  {
    name: "insertarventaitems",
    description:
      "Registra cada item en venta_items e impacta totales y stock de materiales_editorial.",
  },
  {
    name: "actualizarestadoventa",
    description:
      "Actualiza estados en venta_supervision, venta_contabilidad y venta_entregas.",
  },
  {
    name: "mostrarventaeventos",
    description:
      "Historial de venta_eventos con los últimos movimientos y evidencias adjuntas.",
  },
];

const salesData = [
  {
    id: "VTA-240901",
    editorial: { name: "Editorial Armonía" },
    teacher: { name: "Luis Ángel Mínguez" },
    currency: "USD",
    netTotal: 5100,
    saleDate: "2025-09-07T01:07:49",
    materials: [
      { level: "Inicial", sublevel: "4 años", descriptor: "Julio" },
      { level: "Inicial", sublevel: "4 años", descriptor: "Julio" },
    ],
    statuses: {
      evidencia: "complete",
      supervision: "complete",
      contabilidad: "inProgress",
      entregas: "pending",
    },
  },
  {
    id: "VTA-240902",
    editorial: { name: "Editorial Brújula" },
    teacher: { name: "Susana Pedro" },
    currency: "USD",
    netTotal: 2390,
    saleDate: "2025-09-06T14:57:00",
    materials: [
      { level: "Secundaria", sublevel: "4to grado", descriptor: "Anual" },
      { level: "Secundaria", sublevel: "5to grado", descriptor: "Anual" },
    ],
    statuses: {
      evidencia: "complete",
      supervision: "inProgress",
      contabilidad: "inProgress",
      entregas: "pending",
    },
  },
  {
    id: "VTA-240903",
    editorial: { name: "Editorial Prisma" },
    teacher: { name: "Cayetano Martín" },
    currency: "USD",
    netTotal: 3180,
    saleDate: "2025-09-05T20:10:00",
    materials: [
      { level: "Secundaria", sublevel: "3er grado", descriptor: "Anual" },
    ],
    statuses: {
      evidencia: "inProgress",
      supervision: "inProgress",
      contabilidad: "pending",
      entregas: "pending",
    },
  },
  {
    id: "VTA-240904",
    editorial: { name: "Editorial Horizonte" },
    teacher: { name: "Jose Daniel Llamas" },
    currency: "USD",
    netTotal: 1890,
    saleDate: "2025-09-05T16:42:00",
    materials: [
      { level: "Primaria", sublevel: "3er grado", descriptor: "Agosto" },
    ],
    statuses: {
      evidencia: "complete",
      supervision: "complete",
      contabilidad: "complete",
      entregas: "complete",
    },
  },
  {
    id: "VTA-240905",
    editorial: { name: "Editorial Aurora" },
    teacher: { name: "Eva Rivera" },
    currency: "USD",
    netTotal: 5400,
    saleDate: "2025-09-05T13:01:00",
    materials: [
      { level: "Secundaria", sublevel: "5to grado", descriptor: "Agosto" },
      { level: "Secundaria", sublevel: "5to grado", descriptor: "Anual" },
    ],
    statuses: {
      evidencia: "complete",
      supervision: "complete",
      contabilidad: "inProgress",
      entregas: "inProgress",
    },
  },
  {
    id: "VTA-240906",
    editorial: { name: "Editorial Prisma" },
    teacher: { name: "Ismael Rojas" },
    currency: "USD",
    netTotal: 3180,
    saleDate: "2025-09-04T17:33:00",
    materials: [
      { level: "Secundaria", sublevel: "Comunicación", descriptor: "Varios" },
      { level: "Secundaria", sublevel: "Comunicación", descriptor: "Varios" },
    ],
    statuses: {
      evidencia: "pending",
      supervision: "pending",
      contabilidad: "pending",
      entregas: "pending",
    },
  },
  {
    id: "VTA-240907",
    editorial: { name: "Editorial Prisma" },
    teacher: { name: "Ernesto Montez" },
    currency: "USD",
    netTotal: 2100,
    saleDate: "2025-09-04T11:19:00",
    materials: [
      { level: "Secundaria", sublevel: "Comunicación", descriptor: "varios" },
    ],
    statuses: {
      evidencia: "inProgress",
      supervision: "complete",
      contabilidad: "complete",
      entregas: "pending",
    },
  },
  {
    id: "VTA-240908",
    editorial: { name: "Editorial Prisma" },
    teacher: { name: "Alessandro Evertte" },
    currency: "USD",
    netTotal: 1000,
    saleDate: "2025-09-03T09:00:00",
    materials: [
      { level: "Secundaria", sublevel: "Varios", descriptor: "varios" },
    ],
    statuses: {
      evidencia: "pending",
      supervision: "pending",
      contabilidad: "pending",
      entregas: "pending",
    },
  },
];

export function POSTemplate() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSales = useMemo(() => {
    return salesData.filter((sale) => {
      const searchTarget = `${sale.teacher.name} ${sale.editorial.name} ${buildMaterialSummary(
        sale.materials,
      )}`
        .toLowerCase()
        .trim();
      const matchesSearch = searchTarget.includes(searchValue.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        Object.values(sale.statuses).includes(statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusFilter]);

  const handleStageClick = (sale, stageKey) => {
    const stageMeta = stageDefinitions.find((stage) => stage.key === stageKey);
    if (!stageMeta) return;
    const message = `Venta ${sale.id} (docente: ${sale.teacher.name})\nEtapa: ${stageMeta.label}\nEstado actual: ${stageStateTokens[sale.statuses[stageKey]].label}`;
    if (typeof window !== "undefined") {
      window.alert(message);
    } else {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  };

  return (
    <Wrapper>
      <HeroCard>
        <TitleBlock>
          <h1>Ventas</h1>
          <p>
            Visualiza el estado completo de cada registro POS y accede a las
            etapas críticas en un clic.
          </p>
        </TitleBlock>
        <ActionButton type="button">
          <FiPlusCircle /> Registrar nueva venta
        </ActionButton>
      </HeroCard>

      <FiltersRow>
        <SearchBar>
          <FiSearch />
          <input
            placeholder="Buscar por docente, editorial o resumen"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </SearchBar>
        <FilterButtons>
          {statusFilterOptions.map((option) => (
            <FilterButton
              key={option.key}
              type="button"
              onClick={() => setStatusFilter(option.key)}
              className={statusFilter === option.key ? "active" : ""}
            >
              {option.label}
            </FilterButton>
          ))}
        </FilterButtons>
        <Legend>
          {Object.entries(stageStateTokens).map(([key, token]) => (
            <LegendItem key={key}>
              <span style={{ backgroundColor: token.bg }} />
              {token.label}
            </LegendItem>
          ))}
        </Legend>
      </FiltersRow>

      <TableCard>
        <StyledTable>
          <thead>
            <tr>
              <th>Nombre del docente</th>
              <th>Material resumen</th>
              <th>Precio de venta</th>
              <th>Fecha y hora de venta</th>
              <th>Estados</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState>
                    No encontramos ventas con ese criterio. Intenta ajustar la
                    búsqueda.
                  </EmptyState>
                </td>
              </tr>
            )}
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <TeacherCell>
                    <Avatar>{sale.teacher.name.slice(0, 1)}</Avatar>
                    <div>
                      <strong>{sale.teacher.name}</strong>
                      <span>{sale.editorial.name}</span>
                    </div>
                  </TeacherCell>
                </td>
                <td>
                  <MaterialCell>
                    <strong>{buildMaterialSummary(sale.materials)}</strong>
                    <TagList>
                      {buildMaterialTags(sale.materials).map((tag) => (
                        <li key={`${sale.id}-${tag}`}>{tag}</li>
                      ))}
                    </TagList>
                  </MaterialCell>
                </td>
                <td>
                  <AmountCell>
                    {formatCurrency(sale.netTotal, sale.currency)}
                    <span>total neto</span>
                  </AmountCell>
                </td>
                <td>
                  <DateCell>
                    {formatDate(sale.saleDate)}
                    <span>{formatHour(sale.saleDate)}</span>
                  </DateCell>
                </td>
                <td>
                  <StageGroup>
                    {stageDefinitions.map((stage) => {
                      const Icon = stage.icon;
                      const state = sale.statuses[stage.key];
                      const stateToken = stageStateTokens[state];
                      return (
                        <StageButton
                          key={`${sale.id}-${stage.key}`}
                          type="button"
                          $state={state}
                          aria-label={`${stage.label}: ${stateToken.label}`}
                          onClick={() => handleStageClick(sale, stage.key)}
                        >
                          <Icon />
                        </StageButton>
                      );
                    })}
                  </StageGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
        <Pagination>
          <button type="button">Previous</button>
          <span>{`${filteredSales.length} ventas`}</span>
          <button type="button">Next</button>
        </Pagination>
      </TableCard>

      <RpcCard>
        <h2>RPC sugeridos</h2>
        <p>
          Estos procedimientos almacenados mantienen el POS desacoplado del
          esquema completo. Nómbralos en minúscula como solicitaste:
        </p>
        <RpcList>
          {rpcSuggestions.map((rpc) => (
            <li key={rpc.name}>
              <strong>{rpc.name}</strong>
              <span>{rpc.description}</span>
            </li>
          ))}
        </RpcList>
      </RpcCard>
    </Wrapper>
  );
}

function buildMaterialSummary(materials = []) {
  if (!materials.length) {
    return "Sin materiales";
  }
  const level = extractDimension(materials, "level");
  const sublevel = extractDimension(materials, "sublevel");
  const descriptor = extractDimension(materials, "descriptor");
  return `${level} - ${sublevel} - ${descriptor}`;
}

function buildMaterialTags(materials = []) {
  if (!materials.length) return ["Sin registro"];
  const tags = [
    extractDimension(materials, "level"),
    extractDimension(materials, "sublevel"),
    extractDimension(materials, "descriptor"),
  ];
  return Array.from(new Set(tags.filter(Boolean)));
}

function extractDimension(materials, key) {
  const values = Array.from(
    new Set(
      materials
        .map((item) => item[key])
        .filter((value) => value && String(value).trim() !== ""),
    ),
  );
  if (values.length === 0) {
    return "Sin datos";
  }
  if (values.length === 1) {
    return values[0];
  }
  return "Otros";
}

function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatHour(value) {
  return new Date(value).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const Wrapper = styled.section`
  min-height: 100vh;
  padding: 32px clamp(16px, 5vw, 56px);
  background-color: ${({ theme }) => theme.bgtotal};
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeroCard = styled.header`
  background: ${({ theme }) => theme.bgcards || "#fff"};
  border-radius: 24px;
  padding: clamp(20px, 4vw, 32px);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.boxshadowGray};

  h1 {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }

  p {
    margin: 4px 0 0;
    color: ${({ theme }) => theme.colorSubtitle};
    max-width: 620px;
  }
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 240px;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #47c17a, #2a9fd7);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(42, 159, 215, 0.25);
  }
`;

const FiltersRow = styled.section`
  background: ${({ theme }) => theme.bgcards || "#fff"};
  border-radius: 24px;
  padding: 18px clamp(12px, 3vw, 32px);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  box-shadow: ${({ theme }) => theme.boxshadowGray};
`;

const SearchBar = styled.label`
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg4 || "#f5f5f5"};
  color: ${({ theme }) => theme.colorSubtitle};

  input {
    border: none;
    background: transparent;
    width: 100%;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;

    &:focus {
      outline: none;
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.bg4 || "#e0e0e0"};
  padding: 8px 18px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &.active {
    background: ${({ theme }) => theme.color1};
    color: #fff;
    border-color: transparent;
  }
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colorSubtitle};
  font-size: 0.85rem;

  span {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

const TableCard = styled.section`
  background: ${({ theme }) => theme.bgcards || "#fff"};
  border-radius: 32px;
  padding: clamp(12px, 3vw, 24px);
  box-shadow: ${({ theme }) => theme.boxshadowGray};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead th {
    text-align: left;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colorSubtitle};
    padding: 0 0 12px 0;
  }

  tbody td {
    padding: 16px 0;
    border-top: 1px solid ${({ theme }) => theme.bg4 || "#ececec"};
    vertical-align: middle;
  }
`;

const TeacherCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  strong {
    display: block;
    font-size: 1rem;
  }

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color1};
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 600;
`;

const MaterialCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  strong {
    font-weight: 600;
  }
`;

const TagList = styled.ul`
  list-style: none;
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;

  li {
    background: ${({ theme }) => theme.bg4 || "#ececec"};
    color: ${({ theme }) => theme.colorSubtitle};
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
  }
`;

const AmountCell = styled.div`
  font-weight: 600;
  display: flex;
  flex-direction: column;

  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const DateCell = styled.div`
  font-weight: 600;
  display: flex;
  flex-direction: column;

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;

const StageGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const StageButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid
    ${({ $state }) => stageStateTokens[$state]?.border || "#dfe3ec"};
  background: ${({ $state }) => stageStateTokens[$state]?.bg || "#fff"};
  color: ${({ $state }) => stageStateTokens[$state]?.color || "#4F5B7E"};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Pagination = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colorSubtitle};

  button {
    border: none;
    background: transparent;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  padding: 32px 0;
  text-align: center;
  color: ${({ theme }) => theme.colorSubtitle};
`;

const RpcCard = styled.section`
  background: ${({ theme }) => theme.bgcards || "#fff"};
  border-radius: 24px;
  padding: clamp(16px, 4vw, 32px);
  box-shadow: ${({ theme }) => theme.boxshadowGray};

  h2 {
    margin: 0 0 8px;
  }

  p {
    margin: 0 0 16px;
    color: ${({ theme }) => theme.colorSubtitle};
    max-width: 780px;
  }
`;

const RpcList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  li {
    background: ${({ theme }) => theme.bg4 || "#f4f4f4"};
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  strong {
    text-transform: lowercase;
  }

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colorSubtitle};
  }
`;