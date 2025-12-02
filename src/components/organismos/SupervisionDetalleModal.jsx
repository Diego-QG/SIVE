import React, { useState } from "react";
import styled from "styled-components";
import { v } from "../../styles/variables";
import Swal from "sweetalert2";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 20px;
  border-radius: ${v.borderRadius};
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${({ color }) => color || "#ccc"};
  color: white;
  &:hover { opacity: 0.9; }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    min-height: 80px;
`;

const FileInput = styled.input`
    margin-top: 10px;
`;

export function SupervisionDetalleModal({ onClose, idUsuario, venta, items, vouchers, docente, onApprove, onReject }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [comentario, setComentario] = useState("");
  const [severidad, setSeveridad] = useState(1);
  const [evidenciaFile, setEvidenciaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleApprove = async () => {
      const result = await Swal.fire({
          title: '¿Aprobar venta?',
          text: "Esta acción no se puede deshacer",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, aprobar',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          onApprove(comentario);
      }
  };

  const handleReject = async () => {
       if (!comentario.trim()) {
           Swal.fire('Error', 'El comentario es obligatorio para rechazar', 'error');
           return;
       }

       const result = await Swal.fire({
          title: '¿Rechazar venta?',
          text: "Se generará una incidencia",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, rechazar',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          setIsUploading(true);
          onReject({
              comentario,
              severidad,
              evidenciaFile
          });
      }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>
          <Title>Revisión de Venta #{venta.id}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Section>
            <SubTitle>Datos del Docente</SubTitle>
            <InfoGrid>
                <div><strong>Nombre:</strong> {docente?.nombres} {docente?.apellido_p}</div>
                <div><strong>DNI:</strong> {docente?.nro_doc}</div>
                <div><strong>Institución:</strong> {docente?.instituciones?.nombre}</div>
                <div><strong>Celular:</strong> {docente?.telefono}</div>
            </InfoGrid>
        </Section>

        <Section>
            <SubTitle>Items de Venta</SubTitle>
            <ItemTable>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>P. Unit</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.materiales_editorial?.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>{item.precio_unitario}</td>
                            <td>{item.subtotal}</td>
                        </tr>
                    ))}
                </tbody>
            </ItemTable>
            <div style={{ textAlign: "right", marginTop: "10px", fontWeight: "bold" }}>
                Total Neto: S/ {venta.total_neto}
            </div>
        </Section>

        <Section>
            <SubTitle>Vouchers</SubTitle>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                {vouchers && vouchers.length > 0 ? vouchers.map((v, i) => (
                    <a key={i} href={v.archivo} target="_blank" rel="noopener noreferrer">
                        <img src={v.archivo} alt="Voucher" style={{ height: '80px', border: '1px solid #ccc' }} />
                    </a>
                )) : <p>No hay vouchers adjuntos</p>}
            </div>
        </Section>

        <Section>
            <SubTitle>Comentarios / Observaciones</SubTitle>
            <TextArea
                placeholder="Ingrese comentario..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
            />
        </Section>

        {rejectMode && (
            <Section style={{ border: '1px solid red', padding: '10px', borderRadius: '5px' }}>
                <SubTitle style={{color: 'red'}}>Reporte de Incidencia</SubTitle>
                <div style={{ marginBottom: '10px'}}>
                    <label>Severidad: </label>
                    <select value={severidad} onChange={e => setSeveridad(e.target.value)}>
                        <option value="1">Baja</option>
                        <option value="2">Media</option>
                        <option value="3">Alta</option>
                    </select>
                </div>
                <div style={{ marginBottom: '10px'}}>
                     <label>Evidencia (Imagen): </label>
                     <FileInput type="file" accept="image/*" onChange={(e) => setEvidenciaFile(e.target.files[0])} />
                </div>
                <Button color={v.rojo} onClick={handleReject} disabled={isUploading}>
                    {isUploading ? "Subiendo..." : "Confirmar Rechazo"}
                </Button>
                <Button color="#ccc" onClick={() => setRejectMode(false)} style={{marginLeft: '10px'}}>Cancelar</Button>
            </Section>
        )}

        {!rejectMode && (
            <ButtonGroup>
                <Button color={v.rojo} onClick={() => setRejectMode(true)}>Rechazar</Button>
                <Button color={v.verde} onClick={handleApprove}>Aprobar</Button>
            </ButtonGroup>
        )}

      </ModalContent>
    </ModalOverlay>
  );
}
