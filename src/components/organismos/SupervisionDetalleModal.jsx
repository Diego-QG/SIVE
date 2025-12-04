import React, { useEffect, useState } from "react";
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

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

const SummaryCard = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ theme }) => `rgba(${theme.textRgba}, 0.06)`};
  border: 1px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.08)`};
`;

const Label = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => `rgba(${theme.textRgba}, 0.65)`};
`;

const Value = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${({ $type }) => $type === "danger" ? "rgba(244,67,54,0.12)" : "rgba(46, 125, 50, 0.12)"};
  color: ${({ $type }) => $type === "danger" ? "#b71c1c" : "#1b5e20"};
  font-weight: 700;
`;

const InlineInputs = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const Badge = styled.span`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: ${({ theme }) => `rgba(${theme.textRgba}, 0.08)`};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

export function SupervisionDetalleModal({ onClose, idUsuario, venta, items, vouchers, docente, onApprove, onReject, actionIntent }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [comentario, setComentario] = useState("");
  const [severidad, setSeveridad] = useState(1);
  const [evidenciaFile, setEvidenciaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
      if (actionIntent === 'reject') {
          setRejectMode(true);
      }
      if (actionIntent === 'approve') {
          setRejectMode(false);
      }
  }, [actionIntent]);

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
          try {
              await onReject({
                  comentario,
                  severidad,
                  evidenciaFile
              });
          } finally {
              setIsUploading(false);
          }
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
            <SummaryGrid>
                <SummaryCard>
                    <Label>Asesor</Label>
                    <Value>{venta?.usuarios?.nombres ?? "-"}</Value>
                </SummaryCard>
                <SummaryCard>
                    <Label>Docente</Label>
                    <Value>{docente?.nombres} {docente?.apellido_p}</Value>
                </SummaryCard>
                <SummaryCard>
                    <Label>Fecha de venta</Label>
                    <Value>{venta?.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : "-"}</Value>
                </SummaryCard>
                <SummaryCard>
                    <Label>Total neto</Label>
                    <Value>S/ {Number(venta.total_neto ?? 0).toFixed(2)}</Value>
                </SummaryCard>
                <SummaryCard>
                    <Label>Estado de supervisión</Label>
                    <Chip $type={rejectMode ? "danger" : "success"}>
                        {rejectMode ? "En corrección" : "Listo para aprobar"}
                    </Chip>
                </SummaryCard>
            </SummaryGrid>
        </Section>

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
            <SubTitle>Detalle de la venta</SubTitle>
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
            <SubTitle>Comentarios y evidencia</SubTitle>
            <InlineInputs>
                <div>
                    <InputLabel>Comentario</InputLabel>
                    <TextArea
                        placeholder="Explica tu decisión para dejar trazabilidad"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                    />
                </div>
                <div>
                    <InputLabel>Cargar evidencia (opcional)</InputLabel>
                    <FileInput type="file" accept="image/*" onChange={(e) => setEvidenciaFile(e.target.files[0])} />
                    <Badge style={{ marginTop: 10 }}>Se guardará en incidencias al rechazar</Badge>
                </div>
            </InlineInputs>
        </Section>

        {rejectMode && (
            <Section style={{ border: '1px solid red', padding: '10px', borderRadius: '5px' }}>
                <SubTitle style={{color: 'red'}}>Reporte de Incidencia</SubTitle>
                <div style={{ marginBottom: '10px'}}>
                    <InputLabel>Severidad</InputLabel>
                    <Select value={severidad} onChange={e => setSeveridad(Number(e.target.value))}>
                        <option value="1">Baja</option>
                        <option value="2">Media</option>
                        <option value="3">Alta</option>
                    </Select>
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
