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
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 10px;

  th, td {
    padding: 16px;
    text-align: left;
    color: ${({ theme }) => theme.text};
  }

  th {
    background-color: transparent;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    color: ${({ theme }) => `rgba(${theme.textRgba}, 0.6)`};
    border-bottom: 2px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.1)`};
  }

  tbody tr {
    background-color: ${({ theme }) => theme.bg};
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
    }
  }

  td:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  td:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const FilterInput = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.2)`};
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;

  &:focus {
      outline: none;
      border-color: ${v.colorPrincipal};
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  }
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

export function SupervisionTable({ data, currentUserId, onUnlock, onShowVouchers }) {
    const [globalFilter, setGlobalFilter] = useState("");

    const columns = [
        {
            header: "Docente",
            accessorKey: "nombre_docente",
            cell: info => <strong style={{fontSize: '1.05rem'}}>{info.getValue()}</strong>
        },
        {
            header: "Resumen",
            accessorKey: "resumen_venta",
            cell: info => <span style={{fontSize: '0.9rem', color: '#666'}}>{info.getValue() || "-"}</span>
        },
        {
            header: "Vendedor",
            accessorKey: "nombre_vendedor",
        },
        {
            header: "Total",
            accessorKey: "total_neto",
            cell: info => <span style={{fontWeight: 'bold', color: '#0c554a'}}>S/ {Number(info.getValue()).toFixed(2)}</span>
        },
        {
            header: "Estado",
            accessorKey: "estado_supervision",
            cell: info => <StatusBadge status={info.getValue()}>{info.getValue().replace('_', ' ')}</StatusBadge>
        },
        {
            header: "Supervisor",
            accessorKey: "supervisor_nombre",
            cell: info => info.getValue() || <span style={{fontStyle: 'italic', opacity: 0.6}}>Sin asignar</span>
        },
        {
            header: "Acciones",
            cell: ({ row }) => {
                const r = row.original;
                const isLocked = r.estado_supervision === 'en_revision' && r.venta_supervision?.[0]?.actor_usuario !== currentUserId;

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton
                            $variant="primary"
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
                            {r.estado_supervision === 'pendiente' ? 'Revisar' : 'Ver'}
                        </ActionButton>
                        <ActionButton
                            $variant="secondary"
                            onClick={() => onShowVouchers(r)}
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
            <HeaderContainer>
                <FilterInput
                    value={globalFilter ?? ""}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="🔍 Buscar por docente, vendedor..."
                />
            </HeaderContainer>
            <div style={{overflowX: 'auto'}}>
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
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={columns.length} style={{textAlign: 'center', padding: '30px'}}>
                                    No se encontraron registros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </SupervisionTableContainer>
    );
}
