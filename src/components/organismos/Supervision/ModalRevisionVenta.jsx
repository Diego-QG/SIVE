import styled from "styled-components";
import { v } from "../../../styles/variables";
import { DetalleVenta } from "../POSDesign/DetalleVenta";

export function ModalRevisionVenta({ open, onClose, detalle, loading, error, onAprobar, onRechazar, processing }) {
    if (!open) return null;

    // Use existing DetalleVenta but overlay buttons
    return (
        <Wrapper>
             <DetalleVenta
                open={true}
                onClose={onClose}
                detalle={detalle}
                loading={loading}
                error={error}
                ventaBase={null} // Detalle should be full
            />
            {!loading && !error && (
                <ActionPanel>
                    <button className="btn-approve" onClick={onAprobar} disabled={processing}>
                        {processing ? "Procesando..." : "Aprobar Venta"}
                    </button>
                    <button className="btn-reject" onClick={onRechazar} disabled={processing}>
                        Rechazar / Reportar
                    </button>
                </ActionPanel>
            )}
        </Wrapper>
    );
}

const Wrapper = styled.div`
    position: fixed;
    z-index: 1500;
    inset: 0;
    pointer-events: auto;
    /* DetalleVenta has its own Overlay, we might have z-index issues if we don't manage it carefully.
       However, DetalleVenta is imported and used directly.
       If DetalleVenta uses a Portal, this wrapper might not wrap it visually.
       Assuming DetalleVenta is a component that renders in place or we can inject buttons.
       Wait, DetalleVenta has a portal or fixed overlay.
       The DetalleVenta source shows it has an Overlay and ModalContainer.
       I can't easily inject buttons INSIDE it without modifying it.
       So I will render Buttons ON TOP of it using z-index.
    */
`;

const ActionPanel = styled.div`
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1600; /* Higher than DetalleVenta modal */
    background: white;
    padding: 15px 25px;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    display: flex;
    gap: 20px;

    button {
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: transform 0.2s;

        &:hover { transform: scale(1.05); }
        &:disabled { opacity: 0.7; cursor: not-allowed; }
    }

    .btn-approve {
        background: ${v.colorIngresos};
        color: white;
        box-shadow: 0 4px 15px rgba(83, 178, 87, 0.4);
    }

    .btn-reject {
        background: ${v.colorError};
        color: white;
        box-shadow: 0 4px 15px rgba(245, 78, 65, 0.4);
    }
`;
