import styled from "styled-components";
import { AccionTabla } from "../../../index";
import { v } from "../../../styles/variables";

const ACTION_STYLES = {
  editar: {
    color: "#d97706",
    background: "rgba(217, 119, 6, 0.2)",
    border: "rgba(217, 119, 6, 0.55)",
  },
  eliminar: {
    color: "#dc2626",
    background: "rgba(220, 38, 38, 0.2)",
    border: "rgba(220, 38, 38, 0.55)",
  },
};

export function ContentAccionesTabla({ funcionEditar, funcionEliminar }) {
  return (
    <Container>
      <AccionTabla
        funcion={funcionEditar}
        fontSize="18px"
        color={ACTION_STYLES.editar.color}
        background={ACTION_STYLES.editar.background}
        border={ACTION_STYLES.editar.border}
        icono={<v.iconeditarTabla />}
      />
      <AccionTabla
        funcion={funcionEliminar}
        fontSize="20px"
        color={ACTION_STYLES.eliminar.color}
        background={ACTION_STYLES.eliminar.background}
        border={ACTION_STYLES.eliminar.border}
        icono={<v.iconeliminarTabla />}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;

  @media (max-width: 48em) {
    justify-content: end;
  }
`;