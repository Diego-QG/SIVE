import styled from "styled-components";
import { Device } from "../../index";

export function ListaDesplegable({
  data = [],
  setState,
  funcion,
  scroll = "auto",
  top,
  state,
  onClear,
  clearLabel = "Limpiar selección",
  emptyLabel = "Sin opciones disponibles",
  width,
}) {
  if (!state) return null;

  const handleSelect = (item) => {
    funcion?.(item);
    setState?.();
  };

  const handleClear = () => {
    onClear?.();
    setState?.();
  };

  const hasItems = data?.length > 0;

  return (
    <Container scroll={scroll} $top={top} $width={width}>
      <section className="panel-actions">
        <button
          type="button"
          className="close"
          onClick={setState}
          aria-label="Cerrar listado"
        >
          ×
        </button>
        {onClear && (
          <button
            type="button"
            className="clear"
            onClick={handleClear}
          >
            {clearLabel}
          </button>
        )}
      </section>
      <section className="contentItems">
        {hasItems ? (
          data?.map((item, index) => (
            <ItemContainer
              key={item?.id ?? index}
              onClick={() => handleSelect(item)}
            >
              <span className="badge">🌫️</span>
              <span className="text">{item?.nombre}</span>
            </ItemContainer>
          ))
        ) : (
          <EmptyState>{emptyLabel}</EmptyState>
        )}
      </section>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  position: absolute;
  top: ${(props) => props.$top};
  width: ${({ $width }) => $width ?? "min(100%, 340px)"};
  padding: 12px;
  border-radius: 14px;
  gap: 12px;
  z-index: 3;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);

  @media ${() => Device.tablet} {
    width: 100%;
  }

  .panel-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  .panel-actions button {
    border: none;
    background: rgba(${({ theme }) => theme.textRgba}, 0.08);
    color: ${({ theme }) => theme.text};
    border-radius: 999px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: 0.2s ease;
  }

  .panel-actions button:hover {
    background: rgba(${({ theme }) => theme.textRgba}, 0.15);
  }

  .panel-actions .close {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    font-size: 1rem;
    border-radius: 50%;
    padding: 0;
  }

  .contentItems {
    overflow-y: ${(props) => props.scroll};
    max-height: 210px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

const ItemContainer = styled.button`
  gap: 12px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  width: 100%;
  border: none;
  background: rgba(${({ theme }) => theme.textRgba}, 0.04);
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;

  .badge {
    font-size: 1rem;
  }

  .text {
    flex: 1;
    text-align: left;
  }

  &:hover {
    background-color: rgba(${({ theme }) => theme.textRgba}, 0.12);
  }
`;

const EmptyState = styled.div`
  padding: 16px 12px;
  text-align: center;
  color: rgba(${({ theme }) => theme.textRgba}, 0.7);
  font-size: 0.9rem;
`;