import React, { useMemo, useState } from "react";
import {
    SupervisionTableContainer,
    HeaderRow,
    SearchInput,
    TableList,
    RowCard,
    RowGrid,
    CellLabel,
    CellContent,
    StrongText,
    MutedText,
    Pill,
    ActionStack,
    SmallButton,
    IconAction,
    LockOverlay,
    OverlayContent,
    OverlayTag,
    EmptyState
} from "./SupervisionTableStyles";
import {
    FaCalendarAlt,
    FaCheck,
    FaEye,
    FaFileAlt,
    FaLock,
    FaTimes,
    FaUserShield
} from "react-icons/fa";
import Swal from "sweetalert2";

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });
};

export function SupervisionTable({ data, currentUserId, onReview, onShowVouchers }) {
    const [search, setSearch] = useState("");

    const ventasPendientes = useMemo(() => {
        const list = Array.isArray(data) ? data : [];
        return list.filter((venta) => !["aprobado", "rechazado", "aceptado"].includes(venta?.estado_supervision));
    }, [data]);

    const filteredVentas = useMemo(() => {
        const text = search.toLowerCase();
        if (!text) return ventasPendientes;

        return ventasPendientes.filter((venta) => {
            const values = [
                venta?.nombre_docente,
                venta?.nombre_vendedor,
                venta?.resumen_venta,
                venta?.supervisor_nombre
            ];

            return values.some((value) => `${value ?? ""}`.toLowerCase().includes(text));
        });
    }, [search, ventasPendientes]);

    const handleLockedAlert = (venta) => {
        Swal.fire({
            icon: "warning",
            title: "Venta tomada",
            text: `Esta venta está siendo revisada por ${venta.supervisor_nombre ?? "otro supervisor"}.`,
        });
    };

    return (
        <SupervisionTableContainer>
            <HeaderRow>
                <div>
                    <h3>Ventas pendientes de supervisión</h3>
                    <p>Las filas permanecen difuminadas hasta que tomes la venta. Solo se muestran las pendientes.</p>
                </div>
                <SearchInput
                    placeholder="Buscar por asesor, docente o supervisor"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </HeaderRow>

            <TableList>
                {filteredVentas.length === 0 && (
                    <EmptyState>No hay ventas pendientes para supervisar.</EmptyState>
                )}

                {filteredVentas.map((venta) => {
                    const lockedByOther = venta.estado_supervision === "en_revision" && venta.actor_usuario && venta.actor_usuario !== currentUserId;
                    const takenByCurrent = venta.estado_supervision === "en_revision" && venta.actor_usuario === currentUserId;
                    const blurred = !takenByCurrent;

                    return (
                        <RowCard key={venta.id} $active={takenByCurrent}>
                            <LockOverlay $show={!takenByCurrent} $danger={lockedByOther}>
                                <OverlayContent>
                                    <OverlayTag $danger={lockedByOther}>
                                        <FaLock />
                                        {lockedByOther ? "Venta tomada" : "Venta bloqueada"}
                                    </OverlayTag>
                                    <span>
                                        {lockedByOther
                                            ? `Venta tomada por ${venta.supervisor_nombre ?? "otro supervisor"}`
                                            : "Supervisar venta"}
                                    </span>
                                    {!lockedByOther && (
                                        <SmallButton onClick={() => onReview(venta)}>
                                            <FaUserShield /> Tomar revisión
                                        </SmallButton>
                                    )}
                                </OverlayContent>
                            </LockOverlay>

                            <RowGrid>
                                <CellContent $blurred={blurred} $keepVisible>
                                    <CellLabel>Asesor</CellLabel>
                                    <StrongText>{venta.nombre_vendedor ?? "-"}</StrongText>
                                </CellContent>

                                <CellContent $blurred={blurred} $keepVisible>
                                    <CellLabel>Fecha de venta</CellLabel>
                                    <MutedText><FaCalendarAlt style={{ marginRight: 6 }} /> {formatDate(venta.fecha_venta)}</MutedText>
                                </CellContent>

                                <CellContent $blurred={blurred}>
                                    <CellLabel>Docente</CellLabel>
                                    <StrongText>{venta.nombre_docente ?? "-"}</StrongText>
                                </CellContent>

                                <CellContent $blurred={blurred}>
                                    <CellLabel>Resumen</CellLabel>
                                    <MutedText>{venta.resumen_venta ?? "-"}</MutedText>
                                </CellContent>

                                <CellContent $blurred={blurred}>
                                    <CellLabel>Total neto</CellLabel>
                                    <StrongText>S/ {Number(venta.total_neto ?? 0).toFixed(2)}</StrongText>
                                </CellContent>

                                <CellContent $blurred={blurred}>
                                    <CellLabel>Supervisor</CellLabel>
                                    <Pill $type={takenByCurrent ? "success" : lockedByOther ? "danger" : "warning"}>
                                        <FaUserShield />
                                        {takenByCurrent ? "Tú" : (venta.supervisor_nombre || "Sin asignar")}
                                    </Pill>
                                </CellContent>

                                <ActionStack>
                                    <SmallButton
                                        onClick={() => (lockedByOther ? handleLockedAlert(venta) : onReview(venta))}
                                        disabled={lockedByOther}
                                    >
                                        <FaEye /> Ver detalle
                                    </SmallButton>
                                    <SmallButton
                                        $variant="ghost"
                                        onClick={() => (lockedByOther ? handleLockedAlert(venta) : onShowVouchers(venta))}
                                        disabled={lockedByOther}
                                    >
                                        <FaFileAlt /> Vouchers
                                    </SmallButton>
                                    <IconAction
                                        $type="success"
                                        title="Aprobar"
                                        disabled={!takenByCurrent}
                                        onClick={() => onReview(venta, "approve")}
                                    >
                                        <FaCheck />
                                    </IconAction>
                                    <IconAction
                                        $type="danger"
                                        title="Rechazar"
                                        disabled={!takenByCurrent}
                                        onClick={() => onReview(venta, "reject")}
                                    >
                                        <FaTimes />
                                    </IconAction>
                                </ActionStack>
                            </RowGrid>
                        </RowCard>
                    );
                })}
            </TableList>
        </SupervisionTableContainer>
    );
}
