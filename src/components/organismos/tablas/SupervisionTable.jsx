import React, { useState } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { SupervisionTableContainer, StatusBadge, ActionButton } from "./SupervisionTableStyles";
import Swal from "sweetalert2";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: ${({ theme }) => theme.text};
  }

  th {
    background-color: ${({ theme }) => theme.bg3};
    font-weight: bold;
  }

  tr:hover {
    background-color: ${({ theme }) => theme.bg2};
  }
`;

const FilterInput = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  width: 300px;
`;

export function SupervisionTable({ data, currentUserId, onUnlock, onShowVouchers }) {
    const [globalFilter, setGlobalFilter] = useState("");

    const columns = [
        {
            header: "Docente",
            accessorKey: "nombre_docente",
        },
        {
            header: "Resumen de venta",
            accessorKey: "resumen_venta",
            cell: info => info.getValue() || "-"
        },
        {
            header: "Vendedor",
            accessorKey: "nombre_vendedor",
        },
        {
            header: "Total",
            accessorKey: "total_neto",
            cell: info => `S/ ${info.getValue()}`
        },
        {
            header: "Ingreso",
            accessorKey: "tipo_ingreso",
        },
        {
            header: "Estado",
            accessorKey: "estado_supervision",
            cell: info => <StatusBadge status={info.getValue()}>{info.getValue()}</StatusBadge>
        },
        {
            header: "Supervisor",
            accessorKey: "supervisor_nombre",
        },
        {
            header: "Acciones",
            cell: ({ row }) => {
                const r = row.original;
                const isLocked = r.estado_supervision === 'en_revision' && r.venta_supervision?.[0]?.actor_usuario !== currentUserId;

                return (
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <ActionButton
                            onClick={() => {
                                if (isLocked) {
                                    Swal.fire({
                                        icon: "warning",
                                        title: "Bloqueado",
                                        text: `Esta venta está siendo revisada por ${r.supervisor_nombre}`
                                    });
                                } else {
                                    onUnlock(r);
                                }
                            }}
                            disabled={isLocked}
                        >
                            {r.estado_supervision === 'pendiente' ? 'Revisar' : 'Ver/Editar'}
                        </ActionButton>
                        <ActionButton
                            onClick={() => onShowVouchers(r)}
                            style={{ backgroundColor: v.colorSecundario }}
                        >
                            Vouchers
                        </ActionButton>
                    </div>
                );
            }
        }
    ];

    const table = useReactTable({
        data: data || [],
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <SupervisionTableContainer>
            <div style={{ marginBottom: '10px' }}>
                <FilterInput
                    value={globalFilter ?? ""}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Buscar ventas..."
                />
            </div>
            <Table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </SupervisionTableContainer>
    );
}
