import styled from "styled-components";
import { RiShieldCheckLine } from "react-icons/ri";
import { HiOutlineChartPie } from "react-icons/hi";
import { PiCubeThin } from "react-icons/pi";

const estadosConfig = [
  {
    id: "secure",
    Icon: RiShieldCheckLine,
    color: "#6b7280",
    background: "#f3f4f6",
  },
  {
    id: "analytics",
    Icon: HiOutlineChartPie,
    color: "#6b7280",
    background: "#f3f4f6",
  },
  {
    id: "inventory",
    Icon: PiCubeThin,
    color: "#6b7280",
    background: "#f3f4f6",
  },
];

export function ContentEstadosTabla({
  onSecure,
  onAnalytics,
  onInventory,
}) {
  const actions = {
    secure: onSecure,
    analytics: onAnalytics,
    inventory: onInventory,
  };

  return (
    <Container>
      {estadosConfig.map(({ id, Icon, color, background }) => (
        <EstadoButton
          key={id}
          type="button"
          onClick={() => actions[id]?.()}
          $color={color}
          $background={background}
        >
          <Icon />
        </EstadoButton>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

const EstadoButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 14px rgba(0, 0, 0, 0.12);
  }
`;