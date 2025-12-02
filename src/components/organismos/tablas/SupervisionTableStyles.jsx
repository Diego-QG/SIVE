import styled from "styled-components";
import { v } from "../../../styles/variables";

export const SupervisionTableContainer = styled.div`
  width: 100%;
  padding: 20px;
  background-color: ${({ theme }) => theme.bg};
  border-radius: ${v.borderRadius};
`;

export const StatusBadge = styled.span`
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return v.verde; // Green
      case 'rechazado': return v.rojo; // Red
      case 'en_revision': return v.colorPrincipal; // Yellow/Gold
      default: return '#ccc'; // Gray for pendiente
    }
  }};
`;

export const ActionButton = styled.button`
  background-color: ${v.colorPrincipal};
  color: black;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
  }
`;
