import styled from "styled-components";
import { v } from "../../../styles/variables";

export function ModalIncidencia({ open, onClose, onConfirm, loading }) {
    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onConfirm({
            descripcion: formData.get("descripcion"),
            severidad: formData.get("severidad"),
            archivo: formData.get("archivo"), // File object
        });
    };

    return (
        <Overlay>
            <ModalContainer>
                <Header>
                    <h3>Reportar Incidencia / Rechazar Venta</h3>
                    <button onClick={onClose} disabled={loading}>&times;</button>
                </Header>
                <form onSubmit={handleSubmit}>
                    <Body>
                        <Label>
                            Descripción del error (Obligatorio)
                            <textarea name="descripcion" required rows="4" placeholder="Describa el motivo del rechazo..." disabled={loading}></textarea>
                        </Label>
                        <Label>
                            Severidad
                            <select name="severidad" disabled={loading}>
                                <option value="1">Baja</option>
                                <option value="2">Media</option>
                                <option value="3">Alta</option>
                            </select>
                        </Label>
                        <Label>
                            Evidencia (Opcional)
                            <input type="file" name="archivo" accept="image/*" disabled={loading}/>
                        </Label>
                    </Body>
                    <Footer>
                        <Button type="button" onClick={onClose} disabled={loading} className="cancel">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="confirm">
                            {loading ? "Procesando..." : "Confirmar Rechazo"}
                        </Button>
                    </Footer>
                </form>
            </ModalContainer>
        </Overlay>
    );
}

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContainer = styled.div`
    background: ${({theme}) => theme.bgtotal};
    width: 90%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 { margin: 0; color: ${({theme}) => theme.text}; }
    button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${({theme}) => theme.text}; }
`;

const Body = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: ${({theme}) => theme.text};
    font-weight: 500;

    textarea, select, input {
        padding: 10px;
        border: 1px solid rgba(0,0,0,0.2);
        border-radius: 4px;
        background: ${({theme}) => theme.bgtotal};
        color: ${({theme}) => theme.text};
    }
`;

const Footer = styled.div`
    padding: 15px 20px;
    border-top: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

const Button = styled.button`
    padding: 10px 15px;
    border-radius: 4px;
    border: none;
    font-weight: 600;
    cursor: pointer;

    &.cancel {
        background: transparent;
        border: 1px solid #ccc;
        color: ${({theme}) => theme.text};
    }
    &.confirm {
        background: ${v.colorError};
        color: white;
    }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
`;
