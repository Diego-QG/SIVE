import styled from "styled-components";

export function EstadoTabla({
  funcion,
  icono,
  color,
  background,
  border,
  fontSize = "20px",
  title,
  ariaLabel,
}) {
  const hasHandler = typeof funcion === "function";

  return (
    <EstadoButton
      type="button"
      onClick={hasHandler ? funcion : undefined}
      $color={color}
      $fontSize={fontSize}
      $background={background}
      $border={border}
      $hasHandler={hasHandler}
      title={title}
      aria-label={ariaLabel}
    >
      {icono}
    </EstadoButton>
  );
}

const EstadoButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid ${(props) => props.$border || "transparent"};
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => props.$fontSize};
  cursor: ${(props) => (props.$hasHandler ? "pointer" : "default")};
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: ${(props) => (props.$hasHandler ? "translateY(-2px)" : "none")};
    box-shadow: ${(props) =>
      props.$hasHandler ? "0 8px 14px rgba(0, 0, 0, 0.18)" : "none"};
  }
`;
