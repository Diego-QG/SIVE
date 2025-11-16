import styled from "styled-components";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";

export function Selector({
  color,
  state,
  funcion,
  texto1,
  texto2,
  isPlaceholder,
  onClear,
}) {
  const hasLabel = Boolean(texto1?.trim());
  const showClear = Boolean(onClear) && !isPlaceholder;

  const handleClear = (event) => {
    event.stopPropagation();
    onClear?.();
  };

  return (
    <Container color={color} onClick={funcion} data-open={state}>
      <div className="texts">
        {hasLabel && <span className="label">{texto1}</span>}
        <span className={`value ${isPlaceholder ? "placeholder" : ""}`}>
          {texto2}
        </span>
      </div>
      <div className="actions">
        {showClear && (
          <button
            type="button"
            className="clear"
            onClick={handleClear}
            aria-label="Limpiar selección"
          >
            <IoIosClose />
          </button>
        )}
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
  border-radius: 14px;
  padding: 12px 16px;
  gap: 12px;
  transition: 0.3s ease;
  font-weight: 600;
  box-shadow: 0 14px 30px -20px ${(props) => props.color};
  background: rgba(${({ theme }) => theme.textRgba}, 0.03);
  min-height: 56px;

  .texts {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(${({ theme }) => theme.textRgba}, 0.6);
  }

  .value {
    font-size: 0.95rem;
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
    gap: 6px;
    color: ${({ theme }) => theme.text};
  }

  .clear {
    border: none;
    background: rgba(${({ theme }) => theme.textRgba}, 0.08);
    color: ${({ theme }) => theme.text};
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .clear:hover {
    background: rgba(${({ theme }) => theme.textRgba}, 0.15);
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
    box-shadow: 0 18px 35px -22px ${(props) => props.color};
  }
`;