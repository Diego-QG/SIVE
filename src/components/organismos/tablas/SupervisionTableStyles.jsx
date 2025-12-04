import styled, { css } from "styled-components";
import { v } from "../../../styles/variables";

export const SupervisionTableContainer = styled.div`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.bgtotal};
  border-radius: ${v.borderRadius};
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.text};
    font-size: 18px;
  }

  p {
    margin: 4px 0 0 0;
    color: ${({ theme }) => `rgba(${theme.textRgba}, 0.7)`};
    font-size: 0.95rem;
  }
`;

export const SearchInput = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.15)`};
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  min-width: 260px;
  flex: 1;
  max-width: 420px;

  &:focus {
    outline: none;
    border-color: ${v.colorPrincipal};
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  }
`;

export const TableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RowCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.08)`};
  border-radius: 14px;
  padding: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  ${({ $active }) => $active && css`
    border-color: ${v.colorPrincipal};
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  `}
`;

export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr)) 220px;
  gap: 12px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
  }
`;

export const CellLabel = styled.span`
  display: block;
  color: ${({ theme }) => `rgba(${theme.textRgba}, 0.6)`};
  font-size: 0.85rem;
  margin-bottom: 4px;
`;

export const CellContent = styled.div`
  position: relative;
  filter: ${({ $blurred, $keepVisible }) => ($blurred && !$keepVisible ? "blur(5px)" : "none")};
  opacity: ${({ $blurred, $keepVisible }) => ($blurred && !$keepVisible ? 0.55 : 1)};
  transition: filter 0.2s ease, opacity 0.2s ease;
`;

export const StrongText = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 700;
  font-size: 1rem;
`;

export const MutedText = styled.span`
  color: ${({ theme }) => `rgba(${theme.textRgba}, 0.8)`};
  font-size: 0.95rem;
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${({ $type }) => {
    if ($type === 'danger') return "rgba(244, 67, 54, 0.12)";
    if ($type === 'warning') return "rgba(255, 193, 7, 0.18)";
    return "rgba(76, 175, 80, 0.12)";
  }};
  color: ${({ $type }) => {
    if ($type === 'danger') return "#d32f2f";
    if ($type === 'warning') return "#946200";
    return "#0f5132";
  }};
`;

export const ActionStack = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => `rgba(${theme.textRgba}, 0.12)`};
  background: ${({ $variant }) => ($variant === "ghost" ? "transparent" : v.colorPrincipal)};
  color: ${({ $variant, theme }) => ($variant === "ghost" ? theme.text : "#000")};
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 110px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const IconAction = styled.button`
  height: 40px;
  width: 40px;
  border-radius: 12px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
  background: ${({ $type }) => ($type === 'success' ? '#2e7d32' : '#c62828')};

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 18px rgba(0,0,0,0.14); }
  &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
`;

export const LockOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: ${({ $show }) => ($show ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background: ${({ $danger }) => $danger ? "linear-gradient(135deg, rgba(244,67,54,0.1), rgba(244,67,54,0.04))" : "linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.08))"};
  backdrop-filter: blur(2px);
  text-align: center;
  padding: 12px;
`;

export const OverlayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: ${({ theme }) => theme.text};

  span { color: ${({ theme }) => `rgba(${theme.textRgba}, 0.85)`}; font-weight: 600; }
`;

export const OverlayTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ $danger }) => $danger ? "rgba(244, 67, 54, 0.12)" : "rgba(0,0,0,0.05)"};
  color: ${({ $danger }) => $danger ? "#b71c1c" : "inherit"};
  font-weight: 700;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 32px 12px;
  color: ${({ theme }) => `rgba(${theme.textRgba}, 0.7)`};
  border: 1px dashed ${({ theme }) => `rgba(${theme.textRgba}, 0.15)`};
  border-radius: 12px;
`;
