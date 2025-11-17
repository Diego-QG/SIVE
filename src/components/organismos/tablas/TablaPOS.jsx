import styled from "styled-components";
import {
  Paginacion,
  ContentEstadosTabla,
  ContentAccionesTabla,
  useVentasStore,
  useUsuariosStore,
} from "../../../index";
import { v } from "../../../styles/variables";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";
import { obtenerEstilosEstado } from "../../../utils/posEstadosConfig";
import Swal from "sweetalert2";

const obtenerPartesFecha = (valor) => {
  if (!valor) {
    return { fecha: "--/--/--", hora: "--:--" };
  }

  if (typeof valor === "string") {
    const [fechaParte, tiempoParte] = valor.trim().split(/\s+/);
    if (fechaParte && fechaParte.includes("/")) {
      return {
        fecha: fechaParte,
        hora: tiempoParte ? tiempoParte.slice(0, 5) : "--:--",
      };
    }

    const parsed = new Date(valor);
    if (!Number.isNaN(parsed.getTime())) {
      const dia = String(parsed.getDate()).padStart(2, "0");
      const mes = String(parsed.getMonth() + 1).padStart(2, "0");
      const anio = String(parsed.getFullYear()).slice(-2);
      const horas = String(parsed.getHours()).padStart(2, "0");
      const minutos = String(parsed.getMinutes()).padStart(2, "0");
      return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
    }
  }

  const parsed = new Date(valor);
  if (!Number.isNaN(parsed.getTime())) {
    const dia = String(parsed.getDate()).padStart(2, "0");
    const mes = String(parsed.getMonth() + 1).padStart(2, "0");
    const anio = String(parsed.getFullYear()).slice(-2);
    const horas = String(parsed.getHours()).padStart(2, "0");
    const minutos = String(parsed.getMinutes()).padStart(2, "0");
    return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
  }

  return { fecha: "--/--/--", hora: "--:--" };
};

const mostrarConGuion = (valor) => {
  if (valor === null || valor === undefined || valor === "" || valor.trim() === "") {
    return "-";
  }
  return valor;
};

const obtenerIdVenta = (venta) => {
  if (!venta || typeof venta !== "object") {
    return null;
  }

  const possibleKeys = ["id", "id_venta", "venta_id"];

  for (const key of possibleKeys) {
    const value = venta[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return null;
};

const obtenerPayloadEliminacion = (venta, usuarioId) => {
  const idVenta = obtenerIdVenta(venta);

  if (!idVenta || !usuarioId) {
    return null;
  }

  return {
    _id_venta: idVenta,
    _id_usuario: usuarioId,
  };
};

export function TablaPOS({ data = [], onEditarBorrador }) {
  const tableData = Array.isArray(data) ? data : [];
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const { eliminarborrador } = useVentasStore();
  const { datausuarios } = useUsuariosStore();
  const canEditBorrador = typeof onEditarBorrador === "function";

  const editarBorrador = (venta) => {
    if (canEditBorrador) {
      onEditarBorrador(venta);
    }
  };

  const eliminarBorrador = (venta) => {
    const usuarioId = datausuarios?.id;
    const payload = obtenerPayloadEliminacion(venta, usuarioId);

    if (!payload) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo identificar el borrador que deseas eliminar (ID faltante).",
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro(a)(e)?",
      text: "Una vez eliminado, ¡no podrás recuperar este borrador!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      const eliminado = await eliminarborrador(payload);

    });
  };

  const columns = [
    {
      accessorKey: "fecha_str",
      header: "Fecha",
      meta: {
        dataTitle: "Fecha",
      },
      cell: (info) => {
        const partes = obtenerPartesFecha(info.getValue());
        return (
          <FechaContent>
            <span className="date">{partes.fecha}</span>
            <span className="time">{partes.hora}</span>
          </FechaContent>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "editorial",
      header: "Editorial",
      meta: {
        dataTitle: "Editorial",
      },
      cell: (info) => <span>{mostrarConGuion(info.getValue())}</span>,
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "nombre_docente",
      header: "Docente",
      meta: {
        dataTitle: "Docente",
      },
      cell: (info) => <span>{mostrarConGuion(info.getValue())}</span>,
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "material_resumen",
      header: "Resumen",
      meta: {
        dataTitle: "Resumen",
      },
      cell: (info) => {
        const value = info.getValue();
        const normalizedEstado = `${
          info.row?.original?.estado_registro ?? ""
        }`
          .toLowerCase()
          .trim();
        const esBorrador = normalizedEstado === "borrador";
        const resumenLabel = value || "Sin resumen";

        if (esBorrador) {
          return <span>{resumenLabel}</span>;
        }

        return (
          <ResumenButton
            type="button"
            title={resumenLabel}
            aria-label={`Seleccionar resumen ${resumenLabel}`}
          >
            {resumenLabel}
          </ResumenButton>
        );
      },
      enableColumnFilter: true,
      enableSorting: false,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "total_neto",
      header: "Total",
      meta: {
        dataTitle: "Total",
      },
      cell: (info) => {
        const value = info.getValue();
        return (
          <span>
            {mostrarConGuion(value)}
          </span>
        );
      },
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      id: "estados",
      header: "Estados",
      enableSorting: false,
      meta: {
        dataTitle: "Estados",
        className: "ContentCell",
      },
      cell: (info) => {
        const estadoRegistro = `${info.row?.original?.estado_registro ?? ""}`
          .toLowerCase()
          .trim();
        const esBorrador = estadoRegistro === "borrador";

        if (esBorrador) {
          return (
            <ContentAccionesTabla
              funcionEditar={
                canEditBorrador
                  ? () => editarBorrador(info.row.original)
                  : undefined
              }
              funcionEliminar={() => eliminarBorrador(info.row.original)}
            />
          );
        }

        return (
          <ContentEstadosTabla
            estadoSupervision={info.row?.original?.estado_supervision}
            estadoContabilidad={info.row?.original?.estado_contabilidad}
            estadoEntregas={info.row?.original?.estado_entregas}
          />
        );
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
  ];
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
  });
  return (
    <>
      <Container>
        <table className="responsive-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.columnDef.header}
                    {header.column.getCanSort() && (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <FaArrowsAltV />
                      </span>
                    )}
                    {
                      {
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()]
                    }
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""
                        }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((item) => {
              const isBorrador = item?.original?.estado_registro === "borrador";
              const estadoEstilos = isBorrador
                ? obtenerEstilosEstado(item.original)
                : null;
              const rowClassName = estadoEstilos ? "status-colored" : undefined;
              const rowStyle = estadoEstilos
                ? {
                  "--row-status-bg": estadoEstilos.background,
                  "--row-status-accent": estadoEstilos.accent,
                }
                : undefined;
              return (
                <tr key={item.id} className={rowClassName} style={rowStyle}>
                  {item.getVisibleCells().map((cell) => {
                    const { meta } = cell.column.columnDef;
                    const dataTitle =
                      typeof meta?.dataTitle === "string"
                        ? meta.dataTitle
                        : undefined;
                    const className = meta?.className ?? undefined;

                    return (
                      <td
                        key={cell.id}
                        data-title={dataTitle}
                        className={className}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <Paginacion
          table={table}
          irinicio={() => table.setPageIndex(0)}
          pagina={table.getState().pagination.pageIndex + 1}
          setPagina={setPagina}
          maximo={table.getPageCount()}
        />
      </Container>
    </>
  );
}
const Container = styled.div`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  
  .ioqlpo {
    display: none !important; /* oculta el tacho si es el segundo botón */
  }
  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }
    thead {
      position: absolute;

      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;

      @media (min-width: ${v.bpbart}) {
        position: relative;
        height: auto;
        width: auto;
        overflow: auto;
      }
      th {
        border-bottom: 2px solid ${({ theme }) => theme.color2};
        font-weight: 700;
        text-align: center;
        color: ${({ theme }) => theme.text};
        &:first-of-type {
          text-align: center;
        }
      }
    }
    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }
    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }

    th,
    td {
      padding: 0.75em 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bplisa}) {
        padding: 1em 0.75em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.75em 0.75em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 1em 0.75em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 1.25em 1em;
      }
    }
    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      tr {
        margin-bottom: 1em;
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        &:nth-of-type(even) {
          @media (min-width: ${v.bpbart}) {
          }
        }
        &.status-colored {
          background-color: var(--row-status-bg, transparent);
          border: 1px solid var(--row-status-accent, transparent);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04),
            inset 4px 0 0 var(--row-status-accent, transparent);
          border-radius: 10px;
          @media (min-width: ${v.bpbart}) {
            border-radius: 0;
            box-shadow: inset 5px 0 0 var(--row-status-accent, transparent);
          }
        }
      }
      th[scope="row"] {
        @media (min-width: ${v.bplisa}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }
        @media (min-width: ${v.bpbart}) {
          background-color: transparent;
          text-align: center;
          color: ${({ theme }) => theme.text};
        }
      }
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;

        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
          border-bottom: none;
        }
      }
      td {
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          /* border-bottom: 1px solid rgba(161, 161, 161, 0.32); */
          text-align: center;
        }
      }
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        @media (min-width: ${v.bplisa}) {
          font-size: 0.9em;
        }
        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;

const FechaContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;

  .date {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  .time {
    font-size: 0.85em;
    color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  }

  @media (min-width: ${v.bpbart}) {
    align-items: center;
    .time {
      font-size: 0.8em;
    }
  }
`;

const Colorcontent = styled.div`
  justify-content: center;
  min-height: ${(props) => props.$alto};
  width: ${(props) => props.$ancho};
  display: flex;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  text-align: center;
`;

const ResumenButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  text-align: left;

  &:hover {
    color: rgba(${({ theme }) => theme.textRgba}, 0.85);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(${({ theme }) => theme.textRgba}, 0.3);
    border-radius: 6px;
  }
`;