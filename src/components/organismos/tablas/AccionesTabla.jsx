import styled from "styled-components";

export function AccionTabla({
  funcion,
  icono,
  color,
  fontSize,
  background,
  border,
}) {
  const hasHandler = typeof funcion === "function";
  return (
    <CircleButton
      type="button"
      onClick={hasHandler ? funcion : undefined}
      $color={color}
      $fontSize={fontSize}
      $background={background}
      $border={border}
      $hasHandler={hasHandler}
      aria-disabled={!hasHandler}
    >
      {icono}
    </CircleButton>
  );
}

const CircleButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid ${(props) => props.$border || "transparent"};
  background-color: ${(props) => props.$background || "transparent"};
  color: ${(props) => props.$color || "currentColor"};
  font-size: ${(props) => props.$fontSize || "18px"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.$hasHandler ? "pointer" : "default")};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: none;
  opacity: ${(props) => (props.$hasHandler ? 1 : 0.95)};

  &:hover {
    transform: ${(props) => (props.$hasHandler ? "translateY(-2px)" : "none")};
    box-shadow: ${(props) =>
      props.$hasHandler ? "0 8px 14px rgba(0, 0, 0, 0.18)" : "none"};
  }
`;