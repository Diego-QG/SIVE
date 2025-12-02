import styled from "styled-components";
import {
  TablaSupervision,
  useSupervisionStore,
  useAuthStore,
  Title,
  ModalRevisionVenta,
  ModalIncidencia,
  ModalVouchers
} from "../../index";
import { v } from "../../styles/variables";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export function SupervisionTemplate() {
    const {
        ventasSupervision,
        listarVentas,
        tomarRevision,
        aprobarVenta,
        rechazarVenta
    } = useSupervisionStore();
    const { user } = useAuthStore();

    const [selectedVenta, setSelectedVenta] = useState(null);
    const [detalleVenta, setDetalleVenta] = useState(null);
    const [modalRevisionOpen, setModalRevisionOpen] = useState(false);
    const [modalIncidenciaOpen, setModalIncidenciaOpen] = useState(false);
    const [modalVouchersOpen, setModalVouchersOpen] = useState(false);
    const [selectedVouchers, setSelectedVouchers] = useState([]);

    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        listarVentas();
    }, []);

    const handleRevisar = async (venta) => {
        if (!user?.id) return;
        setLoadingAction(true);
        const result = await tomarRevision(venta.id_venta, user.id);
        setLoadingAction(false);

        if (result.success) {
            setDetalleVenta(result.detalle);
            setSelectedVenta(venta);
            setModalRevisionOpen(true);
        } else {
             Swal.fire("Bloqueado", "Esta venta ya está siendo revisada por otro supervisor.", "warning");
        }
    };

    const handleVerVouchers = (venta) => {
        const vouchers = venta.vouchers || [];
        setSelectedVouchers(vouchers);
        setModalVouchersOpen(true);
    };

    const handleAprobar = async () => {
        if (!selectedVenta || !user) return;

        const confirm = await Swal.fire({
            title: "¿Aprobar Venta?",
            text: "Se marcará como aprobada y se registrará el evento.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, aprobar",
            confirmButtonColor: v.colorIngresos
        });

        if (confirm.isConfirmed) {
            setLoadingAction(true);
            const success = await aprobarVenta({
                _id_venta: selectedVenta.id_venta,
                _id_usuario: user.id,
                _comentario: "Aprobado por supervisor"
            });
            setLoadingAction(false);
            if (success) {
                setModalRevisionOpen(false);
                Swal.fire("Aprobado", "La venta ha sido aprobada.", "success");
            }
        }
    };

    const handleRechazarClick = () => {
        setModalIncidenciaOpen(true);
    };

    const handleConfirmRechazo = async (data) => {
        if (!selectedVenta || !user) return;
        setLoadingAction(true);
        const success = await rechazarVenta({
            _id_venta: selectedVenta.id_venta,
            _id_usuario: user.id,
            _comentario: "Rechazado por incidencia",
            _incidente_descripcion: data.descripcion,
            _incidente_severidad: data.severidad,
            evidencia_file: data.archivo
        });
        setLoadingAction(false);

        if (success) {
            setModalIncidenciaOpen(false);
            setModalRevisionOpen(false);
            Swal.fire("Rechazado", "La venta ha sido rechazada y la incidencia reportada.", "success");
        }
    };

  return (
    <Container>
        <Header>
            <Title>Supervisión</Title>
            <p>Revisa, aprueba o rechaza las ventas registradas por los asesores.</p>
        </Header>

        <Main>
            <TablaSupervision
                data={ventasSupervision}
                onRevisar={handleRevisar}
                onVerVouchers={handleVerVouchers}
            />
        </Main>

        {modalRevisionOpen && (
            <ModalRevisionVenta
                open={modalRevisionOpen}
                onClose={() => setModalRevisionOpen(false)}
                detalle={detalleVenta}
                loading={loadingAction && !detalleVenta}
                onAprobar={handleAprobar}
                onRechazar={handleRechazarClick}
                processing={loadingAction}
            />
        )}

        {modalIncidenciaOpen && (
            <ModalIncidencia
                open={modalIncidenciaOpen}
                onClose={() => setModalIncidenciaOpen(false)}
                onConfirm={handleConfirmRechazo}
                loading={loadingAction}
            />
        )}

        {modalVouchersOpen && (
            <ModalVouchers
                open={modalVouchersOpen}
                onClose={() => setModalVouchersOpen(false)}
                vouchers={selectedVouchers}
            />
        )}
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: ${({theme})=>theme.bgtotal};
  color: ${({theme})=>theme.text};

  @media (min-width: ${v.bpbart}) {
    padding: 32px;
  }
`;

const Header = styled.header`
    margin-bottom: 30px;
    p { color: rgba(${({theme})=>theme.textRgba}, 0.7); }
`;

const Main = styled.main`
    background: ${({theme})=>theme.bgtotal};
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    padding: 20px;
    border: 1px solid rgba(${({theme})=>theme.textRgba}, 0.1);
`;
