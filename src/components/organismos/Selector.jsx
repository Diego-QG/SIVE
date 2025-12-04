import styled from "styled-components";
import { IoIosArrowDown } from "react-icons/io";

export function Selector({
  color,
  state,
  funcion,
  texto1,
  texto2,
  isPlaceholder,
  width,
  minWidth,
}) {
  const hasLabel = Boolean(texto1?.trim());

  return (
    <Container
      color={color}
      onClick={funcion}
      data-open={state}
      $width={width}
      $minWidth={minWidth}
    >
      <div className="texts">
        {hasLabel && <span className="label">{texto1}</span>}
        <span className={`value ${isPlaceholder ? "placeholder" : ""}`}>
          {texto2}
        </span>
      </div>
      <div className="actions">
        <span className={state ? "open" : "close"}>
          <IoIosArrowDown />
        </span>
      </div>
    </Container>
  );
}

const getHoverColor = (hexColor) => {
  if (typeof hexColor !== "string" || !hexColor.startsWith("#")) {
    return hexColor;
  }
  return `${hexColor}E6`;
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${(props) => props.color};
  border-radius: 12px;
  padding: 2px 10px;
  gap: 10px;
  transition: 0.3s ease;
  font-weight: 600;
  box-shadow: 0 10px 24px -18px ${(props) => props.color};
  background: rgba(${({ theme }) => theme.textRgba}, 0.02);
  min-height: 44px;
  width: ${({ $width }) => $width ?? "min(100%, 340px)"};
  min-width: ${({ $minWidth }) => $minWidth ?? "auto"};
  max-width: 100%;
  box-sizing: border-box;

  .texts {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
  }

  .value {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value.placeholder {
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
    font-weight: 500;
  }

  .actions {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.text};
  }

  .open,
  .close {
    transition: 0.3s;
    display: flex;
    align-items: center;
  }

  .open {
    transform: rotate(0deg);
  }

  .close {
    transform: rotate(180deg);
  }

  &:hover {
    background-color: ${(props) => getHoverColor(props.color)};
    color: ${({ theme }) => theme.text};
    box-shadow: 0 16px 32px -22px ${(props) => props.color};
  }
`;