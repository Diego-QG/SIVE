import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  Paginacion,
  useSupervisionStore,
  useAuthStore
} from "../../../index";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV, FaSearch, FaLock } from "react-icons/fa";
import { RiFileListLine } from "react-icons/ri";

export function TablaSupervision({ data = [], onRevisar, onVerVouchers }) {
  const tableData = Array.isArray(data) ? data : [];
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const { user } = useAuthStore();

  const columns = [
    {
      accessorKey: "docente_nombre",
      header: "Docente",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
      accessorKey: "resumen_venta",
      header: "Resumen",
      cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
        accessorKey: "total_neto",
        header: "Total",
        cell: (info) => <span>{info.getValue() ? `S/ ${Number(info.getValue()).toFixed(2)}` : "-"}</span>,
    },
    {
        accessorKey: "tipo_ingreso",
        header: "Tipo",
        cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
        accessorKey: "estado_supervision",
        header: "Estado",
        cell: (info) => {
            const estado = info.getValue();
            let color = "gray";
            let text = "Pendiente";
            if (estado === "en_revision") { color = "#FFC107"; text = "En Revisión"; }
            if (estado === "aprobado") { color = "#28a745"; text = "Aprobado"; }
            if (estado === "rechazado") { color = "#dc3545"; text = "Rechazado"; }

            return <Badge color={color}>{text}</Badge>;
        },
    },
    {
        accessorKey: "supervisor_nombre",
        header: "Supervisor",
        cell: (info) => <span>{info.getValue() || "-"}</span>,
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: (info) => {
            const row = info.row.original;
            const estado = row.estado_supervision;
            const supervisorId = row.id_supervisor; // Assuming this field exists
            const currentUserId = user?.id;

            const isLockedByOther = estado === "en_revision" && supervisorId !== currentUserId;
            const isLockedByMe = estado === "en_revision" && supervisorId === currentUserId;

            return (
                <AccionesContainer>
                    <button
                        className="btn-vouchers"
                        onClick={() => onVerVouchers(row)}
                        title="Ver Vouchers"
                    >
                        <RiFileListLine /> Vouchers
                    </button>

                    {estado === "aprobado" || estado === "rechazado" ? (
                         <span className="text-muted">Finalizado</span>
                    ) : (
                        <button
                            className={`btn-action ${isLockedByOther ? "disabled" : "primary"}`}
                            onClick={() => !isLockedByOther && onRevisar(row)}
                            disabled={isLockedByOther}
                        >
                            {isLockedByOther ? <FaLock /> : (isLockedByMe ? "Continuar Revisión" : "Desbloquear / Revisar")}
                        </button>
                    )}
                </AccionesContainer>
            );
        }
    }
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Container>
      <TableScrollArea>
        <table className="responsive-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.columnDef.header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableScrollArea>
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    th {
        font-weight: 600;
        color: ${({theme})=>theme.text};
    }
    td {
        color: ${({theme})=>theme.text};
    }
  }
`;

const TableScrollArea = styled.div`
  overflow-x: auto;
`;

const Badge = styled.span`
    background-color: ${props => props.color};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: 500;
`;

const AccionesContainer = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    .btn-vouchers {
        background: transparent;
        border: 1px solid ${({theme})=>theme.color2};
        color: ${({theme})=>theme.text};
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        &:hover {
            background: rgba(0,0,0,0.05);
        }
    }

    .btn-action {
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;

        &.primary {
            background-color: ${v.colorPrincipal};
            color: #000;
            &:hover {
                filter: brightness(0.9);
            }
        }
        &.disabled {
            background-color: #ccc;
            cursor: not-allowed;
            color: #666;
        }
    }
    .text-muted {
        color: #888;
        font-size: 0.9em;
    }
`;
