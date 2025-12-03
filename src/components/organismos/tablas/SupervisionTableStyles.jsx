import styled from "styled-components";
import { v } from "../../../styles/variables";

export const SupervisionTableContainer = styled.div`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: ${v.borderRadius};
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
`;

export const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ status }) => status === 'en_revision' ? '#333' : '#fff'};
  background-color: ${({ status }) => {
    switch (status) {
      case 'aprobado': return '#4caf50';
      case 'rechazado': return '#f44336';
      case 'en_revision': return '#ffeb3b';
      default: return '#9e9e9e';
    }
  }};
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

export const ActionButton = styled.button`
  background-color: ${({ $variant }) => $variant === 'primary' ? v.colorPrincipal : '#e0e0e0'};
  color: ${({ $variant }) => $variant === 'primary' ? '#000' : '#333'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    filter: brightness(0.95);
  }

  &:disabled {
      background-color: #f0f0f0;
      color: #aaa;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
  }
`;
