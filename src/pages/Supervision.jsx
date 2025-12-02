import React, { useEffect, useState } from "react";
import {
    useSupervisionStore,
    useAuthStore,
    SupervisionTemplate,
    SupervisionDetalleModal,
    VoucherModal
} from "../index";
import Swal from "sweetalert2";

export function Supervision() {
    const {
        dataVentas,
        mostrarVentas,
        tomarRevision,
        cargarDetalleVenta,
        aprobarVenta,
        rechazarVenta,
        ventaSeleccionada,
        vouchersVenta,
        limpiarDetalle,
        subirEvidencia
    } = useSupervisionStore();
    const { user } = useAuthStore();

    const [selectedVentaId, setSelectedVentaId] = useState(null);
    const [showVouchers, setShowVouchers] = useState(false);
    const [vouchersToShow, setVouchersToShow] = useState([]);
    const [voucherTitle, setVoucherTitle] = useState("");

    useEffect(() => {
        mostrarVentas();
    }, []);

    const handleUnlock = async (row) => {
        const idVenta = row.id;
        const currentStatus = row.estado_supervision;
        const currentActor = row.venta_supervision?.[0]?.actor_usuario;

        if (currentStatus === 'en_revision' && currentActor !== user.id) {
            Swal.fire({
                icon: "warning",
                title: "Bloqueado",
                text: `Esta venta está siendo revisada por ${row.supervisor_nombre}`
            });
            return;
        }

        const success = await tomarRevision(idVenta, user.id);
        if (success) {
            await cargarDetalleVenta(idVenta);
            setSelectedVentaId(idVenta);
        }
    };

    const handleShowVouchers = async (row) => {
        const { vouchers } = await cargarDetalleVenta(row.id);
        if (vouchers && vouchers.length > 0) {
            setVouchersToShow(vouchers);
            setVoucherTitle(`Vouchers - ${row.nombre_docente}`);
            setShowVouchers(true);
        } else {
            Swal.fire("Info", "No hay vouchers registrados para esta venta", "info");
        }
    };

    const handleCloseDetail = () => {
        setSelectedVentaId(null);
        limpiarDetalle();
    };

    const handleApprove = async (comentario) => {
        if (!ventaSeleccionada) return;
        const success = await aprobarVenta(ventaSeleccionada.venta.id, user.id, comentario);
        if (success) {
            Swal.fire('Aprobado', 'La venta ha sido aprobada', 'success');
            handleCloseDetail();
        }
    };

    const handleReject = async ({ comentario, severidad, evidenciaFile }) => {
        if (!ventaSeleccionada) return;

        let evidenciaUrl = null;
        if (evidenciaFile) {
            evidenciaUrl = await subirEvidencia(evidenciaFile, ventaSeleccionada.venta.id);
            if (!evidenciaUrl && evidenciaFile) {
                // Should stop if upload fails? Store usually alerts.
                return;
            }
        }

        const success = await rechazarVenta({
              id_venta: ventaSeleccionada.venta.id,
              id_usuario: user.id,
              comentario,
              id_asesor: ventaSeleccionada.venta.id_usuario,
              severidad,
              evidencia_archivo: evidenciaUrl
          });

        if (success) {
            Swal.fire('Rechazado', 'La venta ha sido rechazada e incidencia creada', 'success');
            handleCloseDetail();
        }
    };

    return (
        <>
            <SupervisionTemplate
                dataVentas={dataVentas}
                currentUserId={user?.id}
                onUnlock={handleUnlock}
                onShowVouchers={handleShowVouchers}
            />

            {selectedVentaId && ventaSeleccionada && (
                <SupervisionDetalleModal
                    venta={ventaSeleccionada.venta}
                    items={ventaSeleccionada.items}
                    docente={ventaSeleccionada.docente}
                    vouchers={vouchersVenta}
                    idUsuario={user?.id}
                    onClose={handleCloseDetail}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {showVouchers && (
                <VoucherModal
                    onClose={() => setShowVouchers(false)}
                    vouchers={vouchersToShow}
                    titulo={voucherTitle}
                />
            )}
        </>
    );
}
