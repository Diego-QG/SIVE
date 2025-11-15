import styled from "styled-components";
import { AccionTabla } from "../../../index";
import { v } from "../../../styles/variables";

const ACTION_STYLES = {
  editar: {
    color: "#fcd34d",
    background: "rgba(250, 204, 21, 0.18)",
    border: "rgba(250, 204, 21, 0.45)",
  },
  eliminar: {
    color: "#fda4af",
    background: "rgba(239, 68, 68, 0.24)",
    border: "rgba(239, 68, 68, 0.45)",
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